import { SidebarSection } from "./SidebarSection";
import { PlaylistMenu } from "./PlaylistMenu";
import { SidebarFooter } from "./SidebarFooter";

interface SidebarProps {
    onLoadPlaylist: () => void;
    currentPlaylistName: string | null;
    activeItem: string;
    onSelectItem: (id: string) => void;
}

export function Sidebar({ onLoadPlaylist, currentPlaylistName, activeItem, onSelectItem }: SidebarProps) {
    return (
        <aside className="sidebar">
            <div className="sidebar-content">
                <SidebarSection title="Biblioteca" onAddClick={() => {}}>
                    {null}
                </SidebarSection>

                <SidebarSection title="Listas de reproducción" onAddClick={onLoadPlaylist}>
                    <PlaylistMenu
                        currentPlaylistName={currentPlaylistName}
                        activeItem={activeItem}
                        onSelectItem={onSelectItem}
                    />
                </SidebarSection>
            </div>

            <SidebarFooter />
        </aside>
    );
}
