import { ReactNode } from "react";

interface SidebarSectionProps {
    title: string;
    onAddClick: () => void;
    children: ReactNode;
    selectedItem?: string | null;
    onRefreshClick?: () => void;
}

export function SidebarSection({ title, onAddClick, children, selectedItem, onRefreshClick }: SidebarSectionProps) {
    const hasLibrary = !!selectedItem;

    return (
        <div className="sidebar-section">
            <div className="sidebar-header">
                <h3 className="sidebar-title">{title}</h3>
                {!hasLibrary && (
                    <button className="icon-btn add-icon-btn" onClick={onAddClick} title="Agregar biblioteca">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                    </button>
                )}
            </div>
            {!hasLibrary && (
                <div className="sidebar-placeholder">
                    No hay biblioteca seleccionada
                </div>
            )}
            {hasLibrary && (
                <div className="sidebar-selected-item">
                    <span className="sidebar-selected-item-text">{selectedItem}</span>
                    <div className="sidebar-actions">
                        <button className="icon-btn edit-btn" onClick={onAddClick} title="Cambiar biblioteca">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                        </button>
                        {onRefreshClick && (
                            <button className="icon-btn refresh-btn" onClick={onRefreshClick} title="Actualizar lista de canciones">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" />
                                </svg>
                            </button>
                        )}
                    </div>
                </div>
            )}
            <ul className="sidebar-menu">
                {children}
            </ul>
        </div>
    );
}
