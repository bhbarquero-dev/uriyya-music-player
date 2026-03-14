import { useEffect, useRef } from "react";

export interface ContextMenuItem {
    label: string;
    onClick: () => void;
    disabled?: boolean;
}

interface ContextMenuProps {
    x: number;
    y: number;
    items: ContextMenuItem[];
    onClose: () => void;
}

export function ContextMenu({ x, y, items, onClose }: ContextMenuProps) {
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        const handleMouseDown = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                onClose();
            }
        };
        document.addEventListener("keydown", handleKeyDown);
        document.addEventListener("mousedown", handleMouseDown);
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            document.removeEventListener("mousedown", handleMouseDown);
        };
    }, [onClose]);

    return (
        <div ref={menuRef} className="context-menu" style={{ top: y, left: x }}>
            <ul className="context-menu-list">
                {items.map((item) => (
                    <li
                        key={item.label}
                        className={`context-menu-item${item.disabled ? " disabled" : ""}`}
                        onClick={() => {
                            if (item.disabled) return;
                            item.onClick();
                            onClose();
                        }}
                    >
                        {item.label}
                    </li>
                ))}
            </ul>
        </div>
    );
}
