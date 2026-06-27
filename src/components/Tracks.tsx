import {createSignal, createEffect, For, Show} from "solid-js";
import {invoke} from "@tauri-apps/api/core";

type Track = {
    id: number;
    title: string | null;
    artist: string | null;
    album: string | null;
    filename: string;
};

function Tracks() {
    const [folders, setFolders] = createSignal<string[]>([]);
    const [tracks, setTracks] = createSignal<Track[]>([]);
    const [loading, setLoading] = createSignal(false);

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

                <Show
                    when={tracks().length > 0}
                    fallback={
                        <div class="text-muted text-center mt-5">
                            Nessuna canzone trovata
                        </div>
                    }
                >
                    <table class="table table-hover table-sm align-middle">

                        <thead>
                            <tr>
                                <th>Title</th>
                                <th>Artist</th>
                                <th>Album</th>
                                <th>File</th>
                            </tr>
                        </thead>

                        <tbody>
                            <For each={tracks()}>
                                {(track) => (
                                    <tr>
                                        <td>{track.title ?? "-"}</td>
                                        <td>{track.artist ?? "-"}</td>
                                        <td>{track.album ?? "-"}</td>
                                        <td class="text-muted small">
                                            {track.filename}
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