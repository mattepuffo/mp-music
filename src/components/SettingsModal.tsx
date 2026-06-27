import {createSignal, For, Show, createEffect} from "solid-js";
import {invoke} from "@tauri-apps/api/core";

interface SettingsModalProps {
    show: boolean;
    onClose: () => void;
    onSave: (folders: string[]) => void;
}

export default function SettingsModal(props: SettingsModalProps) {
    const [folders, setFolders] = createSignal<string[]>([]);

    createEffect(() => {
        if (props.show) {
            invoke<string[]>("load_settings")
                .then((data) => setFolders(data))
                .catch(console.error);
        }
    });

    const updateFolder = (index: number, value: string) => {
        const copy = [...folders()];
        copy[index] = value;
        setFolders(copy);
    };

    const addRow = () => {
        setFolders([...folders(), ""]);
    };

    const removeRow = (index: number) => {
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
                                <button class="btn-close" onClick={props.onClose}/>
                            </div>

                            <div class="modal-body">

                                <div class="d-flex justify-content-between mb-3">
                                    <h6>Music Folders</h6>

                                    <button class="btn btn-outline-primary btn-sm" onClick={addRow}>
                                        <i class="bi bi-plus-lg"></i>
                                    </button>
                                </div>

                                <div class="list-group">
                                    <For each={folders()}>
                                        {(folder, index) => (
                                            <div class="list-group-item d-flex gap-2 align-items-center">

                                                <input class="form-control"
                                                       value={folder}
                                                       onInput={(e) =>
                                                           updateFolder(index(), e.currentTarget.value)
                                                       }
                                                />

                                                <button class="btn btn-outline-danger btn-sm"
                                                        onClick={() => removeRow(index())}>
                                                    <i class="bi bi-trash"></i>
                                                </button>

                                            </div>
                                        )}
                                    </For>
                                </div>

                            </div>

                            <div class="modal-footer">
                                <button class="btn btn-secondary" onClick={props.onClose}>
                                    Cancel
                                </button>

                                <button class="btn btn-primary"
                                        onClick={() => props.onSave(folders().filter(f => f.trim() !== ""))}>
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