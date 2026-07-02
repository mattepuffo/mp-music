import {createSignal, createEffect, createMemo, For, Show} from "solid-js";
import {invoke} from "@tauri-apps/api/core";

type Track = {
    id: number;
    title: string | null;
    artist: string | null;
    album: string | null;
    filename: string;
    modified: number;
};

function Tracks() {
    const [folders, setFolders] = createSignal<string[]>([]);
    const [tracks, setTracks] = createSignal<Track[]>([]);
    const [loading, setLoading] = createSignal(false);
    const [sortAsc, setSortAsc] = createSignal(true);
    const [search, setSearch] = createSignal("");

    const [sortColumn, setSortColumn] = createSignal<
        "title" | "artist" | "album" | "filename" | "modified"
    >("filename");

    const sortBy = (
        column: "title" | "artist" | "album" | "filename" | "modified"
    ) => {
        if (sortColumn() === column) {
            setSortAsc(!sortAsc());
        } else {
            setSortColumn(column);
            setSortAsc(true);
        }
    };

    const filteredTracks = createMemo(() => {
        const text = search().trim().toLowerCase();

        let result = tracks();

        if (text !== "") {
            result = result.filter(track =>
                (track.title ?? "").toLowerCase().includes(text) ||
                (track.artist ?? "").toLowerCase().includes(text) ||
                (track.album ?? "").toLowerCase().includes(text) ||
                track.filename.toLowerCase().includes(text)
            );
        }

        result = [...result].sort((a, b) => {
            const column = sortColumn();

            let av: any = a[column];
            let bv: any = b[column];

            if (typeof av === "string") av = av.toLowerCase();
            if (typeof bv === "string") bv = bv.toLowerCase();

            if (av == null) av = "";
            if (bv == null) bv = "";

            if (av < bv) return sortAsc() ? -1 : 1;
            if (av > bv) return sortAsc() ? 1 : -1;

            return 0;
        });

        return result;
    });

    const loadFolders = async () => {
        const res = await invoke<string[]>("load_settings");
        setFolders(res);
    };

    const loadTracks = async () => {
        const res = await invoke<Track[]>("get_tracks");
        setTracks(res);
    };

    const refresh = async () => {
        setLoading(true);

        try {
            const folders = await invoke<string[]>("load_settings");

            await invoke("scan_music_folders", {
                folders,
            });

            await loadTracks();
        } finally {
            setLoading(false);
        }
    };

    createEffect(() => {
        loadFolders();
        loadTracks();
    });

    return (
        <div class="d-flex flex-column h-100 min-vh-0 overflow-hidden">

            {/* HEADER */}
            <div class="d-flex justify-content-between align-items-center p-3 border-bottom flex-shrink-0">

                <h4 class="m-0">Collection</h4>

                <Show when={folders().length > 0}>
                    <button
                        class="btn btn-primary btn-sm"
                        onClick={refresh}
                        disabled={loading()}
                    >
                        <Show when={!loading()} fallback={
                            <>
                                <span class="spinner-border spinner-border-sm me-2"/>
                                Scanning...
                            </>
                        }>
                            <i class="bi bi-arrow-repeat me-2"></i>
                            Refresh
                        </Show>
                    </button>
                </Show>

            </div>

            {/* CONTENT */}
            <div class="flex-grow-1 min-vh-0 overflow-auto">

                <div class="p-3 border-bottom">
                    <input
                        class="form-control"
                        type="search"
                        placeholder="Search..."
                        value={search()}
                        onInput={(e) => setSearch(e.currentTarget.value)}
                    />
                </div>

                <Show
                    when={tracks().length > 0}
                    fallback={
                        <div class="text-muted text-center mt-5">
                            Nessuna canzone trovata
                        </div>
                    }
                >
                    <table class="table table-hover table-sm align-middle">

                        <thead class="table-light position-sticky top-0">
                            <tr>
                                <th role="button" onClick={() => sortBy("title")}>
                                    Title
                                </th>

                                <th role="button" onClick={() => sortBy("artist")}>
                                    Artist
                                </th>

                                <th role="button" onClick={() => sortBy("album")}>
                                    Album
                                </th>

                                <th role="button" onClick={() => sortBy("filename")}>
                                    File
                                </th>

                                <th role="button" onClick={() => sortBy("modified")}>
                                    Modified
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            <For each={filteredTracks()}>
                                {(track) => (
                                    <tr>
                                        <td>{track.title ?? "-"}</td>
                                        <td>{track.artist ?? "-"}</td>
                                        <td>{track.album ?? "-"}</td>
                                        <td class="text-muted small">
                                            {track.filename}
                                        </td>
                                        <td class="text-nowrap">
                                            {new Date(track.modified * 1000).toLocaleString()}
                                        </td>
                                    </tr>
                                )}
                            </For>
                        </tbody>

                    </table>
                </Show>

            </div>

        </div>
    );
}

export default Tracks;