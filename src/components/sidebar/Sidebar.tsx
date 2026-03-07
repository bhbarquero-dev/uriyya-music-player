import { useState } from "react";
import { SidebarSection } from "./SidebarSection";
import { SidebarFooter } from "./SidebarFooter";
import { TauriFileDialog } from "../../logic/TauriFileDialog";

export function Sidebar() {
    const [libraryDirectory, setLibraryDirectory] = useState<string | null>(null);
    const fileDialog = new TauriFileDialog();

    const handleLibraryAddClick = async () => {
        const selectedPath = await fileDialog.openDirectory();
        if (selectedPath) {
            // Extract directory name from path
            const dirName = selectedPath.split(/[\\/]/).pop() || selectedPath;
            setLibraryDirectory(dirName);
        }
    };

    return (
        <aside className="sidebar">
            <div className="sidebar-content">
                <SidebarSection 
                    title="Biblioteca" 
                    onAddClick={handleLibraryAddClick}
                    selectedItem={libraryDirectory}
                >
                    {null}
                </SidebarSection>
            </div>

            <SidebarFooter />
        </aside>
    );
}
