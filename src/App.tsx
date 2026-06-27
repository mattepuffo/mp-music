// import "./App.css";
import Header from "./components/Header.tsx";
import Sidebar from "./components/Sidebar.tsx";
import Tracks from "./components/Tracks.tsx";
import {createSignal} from "solid-js";
import SettingsModal from "./components/SettingsModal.tsx";
import {invoke} from "@tauri-apps/api/core";

function App() {
    const [showSettings, setShowSettings] = createSignal(false);

    const saveSettings = async (folders: string[]) => {
        await invoke("save_settings", {
            folders,
        });

        setShowSettings(false);
    };

    return (
        <>

            <div class="vh-100 d-flex flex-column overflow-hidden">
                <Header onSettingsClick={() => setShowSettings(true)}/>

                <main class="flex-grow-1 d-flex min-vh-0 overflow-hidden">
                    <div class="d-flex w-100 min-vh-0">

                        <Sidebar/>

                        <section class="flex-grow-1 d-flex flex-column min-vh-0 overflow-hidden">
                            <Tracks/>
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
