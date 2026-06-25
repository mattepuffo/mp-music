// import "./App.css";
import Header from "./components/Header.tsx";
import Sidebar from "./components/Sidebar.tsx";
import MusicList from "./components/MusicList.tsx";
import {createSignal} from "solid-js";
import SettingsModal from "./components/SettingsModal.tsx";
import {invoke} from "@tauri-apps/api/core";

function App() {
    const [showSettings, setShowSettings] = createSignal(false);

    const saveSettings = async (folders: string[]) => {
        await invoke("scan_music_folders", {
            folders,
        });

        setShowSettings(false);
    };

    return (
        <>

            <div class="vh-100 d-flex flex-column">
                <Header onSettingsClick={() => setShowSettings(true)}/>

                <main class="flex-grow-1 overflow-hidden">
                    <div class="row g-0 h-100">

                        <Sidebar/>

                        <section class="col">
                            <MusicList/>
                        </section>

                    </div>
                </main>
            </div>

            <SettingsModal
                show={showSettings()}
                onClose={() => setShowSettings(false)}
                onSave={saveSettings}
            />
        </>
    );
}

export default App;
