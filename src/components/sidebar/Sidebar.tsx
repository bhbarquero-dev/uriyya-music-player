import { SidebarSection } from "./SidebarSection";
import { SidebarFooter } from "./SidebarFooter";

export function Sidebar() {
    const handleLibraryAddClick = () => {
        window.alert("Funcionalidad de Biblioteca aún no está implementada.");
    };

    return (
        <aside className="sidebar">
            <div className="sidebar-content">
                <SidebarSection title="Biblioteca" onAddClick={handleLibraryAddClick}>
                    {null}
                </SidebarSection>
            </div>

            <SidebarFooter />
        </aside>
    );
}
