import {For} from "solid-js";

interface HeaderProps {
    onSettingsClick: () => void;
}

function Header(props: HeaderProps) {
    const items = [
        {icon: "music-note-list", label: "Collection"},
        {icon: "list-stars", label: "Playlists"},
        {icon: "folder2-open", label: "Files"},
    ];

    return (
        <header class="border-bottom bg-dark text-white">
            <div class="container-fluid py-2">
                <div class="d-flex gap-3">

                    <For each={items}>
                        {(item) => (
                            <button class="btn btn-link text-decoration-none">
                                <i class={`bi bi-${item.icon} me-2`}/>
                                {item.label}
                            </button>
                        )}
                    </For>

                    <button class="btn btn-link text-decoration-none ms-auto"
                            onClick={() => {
                                props.onSettingsClick();
                            }}>
                        <i class="bi bi-gear me-2"></i>
                        Settings
                    </button>

                </div>
            </div>
        </header>
    );
}

export default Header;