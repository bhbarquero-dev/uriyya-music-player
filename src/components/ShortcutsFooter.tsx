export function ShortcutsFooter() {
    return (
        <footer className="shortcuts-footer">
            <div className="shortcut-item">
                <span className="key-cap">P</span>
                <span>Reproducir</span>
            </div>
            <div className="shortcut-item">
                <span className="key-cap">S</span>
                <span>Detener</span>
            </div>
            <div className="shortcut-item">
                <span className="key-cap">Espacio</span>
                <span>Pausar</span>
            </div>
            <div className="shortcut-item">
                <div style={{ display: "flex", gap: "2px" }}>
                    <span className="key-cap">↑</span>
                    <span className="key-cap">↓</span>
                </div>
                <span>Navegar</span>
            </div>
        </footer>
    );
}
