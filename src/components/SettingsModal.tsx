import {For, Show, createSignal} from "solid-js";

interface SettingsModalProps {
    show: boolean;
    onClose: () => void;
    onSave: (folders: string[]) => void;
}

export default function SettingsModal(props: SettingsModalProps) {
    const [folders, setFolders] = createSignal<string[]>([]);

    const addFolder = async () => {
        const path = prompt("Percorso cartella");

        if (!path) return;

        setFolders([...folders(), path]);
    };

    const removeFolder = (index: number) => {
        setFolders(folders().filter((_, i) => i !== index));
    };

    return (
        <Show when={props.show}>
            <>
                <div class="modal fade show d-block">
                    <div class="modal-dialog modal-lg">
                        <div class="modal-content">

                            <div class="modal-header">
                                <h5 class="modal-title">Settings</h5>
                                <button
                                    class="btn-close"
                                    onClick={props.onClose}
                                />
                            </div>

                            <div class="modal-body">

                                <div class="d-flex justify-content-between mb-3">
                                    <h6>Music Folders</h6>

                                    <button
                                        class="btn btn-primary btn-sm"
                                        onClick={addFolder}
                                    >
                                        Add Folder
                                    </button>
                                </div>

                                <ul class="list-group">
                                    <For each={folders()}>
                                        {(folder, index) => (
                                            <li class="list-group-item d-flex justify-content-between">
                                                {folder}

                                                <button
                                                    class="btn btn-danger btn-sm"
                                                    onClick={() => removeFolder(index())}
                                                >
                                                    Remove
                                                </button>
                                            </li>
                                        )}
                                    </For>
                                </ul>

                            </div>

                            <div class="modal-footer">
                                <button
                                    class="btn btn-secondary"
                                    onClick={props.onClose}
                                >
                                    Cancel
                                </button>

                                <button
                                    class="btn btn-primary"
                                    onClick={() => props.onSave(folders())}
                                >
                                    OK
                                </button>
                            </div>

                        </div>
                    </div>
                </div>

                <div class="modal-backdrop fade show"></div>
            </>
        </Show>
    );
}