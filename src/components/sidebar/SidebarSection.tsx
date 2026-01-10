import { ReactNode } from "react";

interface SidebarSectionProps {
    title: string;
    onAddClick: () => void;
    children: ReactNode;
}

export function SidebarSection({ title, onAddClick, children }: SidebarSectionProps) {
    return (
        <div className="sidebar-section">
            <div className="sidebar-header">
                <h3 className="sidebar-title">{title}</h3>
                <button className="add-btn" onClick={onAddClick} title={`Añadir a ${title.toLowerCase()}`}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                    </svg>
                </button>
            </div>
            <ul className="sidebar-menu">
                {children}
            </ul>
        </div>
    );
}
