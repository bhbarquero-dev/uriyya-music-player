import { ReactNode } from "react";

interface SidebarSectionProps {
    title: string;
    onAddClick: () => void;
    children: ReactNode;
    selectedItem?: string | null;
}

export function SidebarSection({ title, onAddClick, children, selectedItem }: SidebarSectionProps) {
    return (
        <div className="sidebar-section">
            <div className="sidebar-header">
                <h3 className="sidebar-title">{title}</h3>
                <button className="add-btn" onClick={onAddClick} title={`Añadir a ${title.toLowerCase()}`}>
                    Agregar
                </button>
            </div>
            {selectedItem && (
                <div className="sidebar-selected-item">
                    {selectedItem}
                </div>
            )}
            <ul className="sidebar-menu">
                {children}
            </ul>
        </div>
    );
}
