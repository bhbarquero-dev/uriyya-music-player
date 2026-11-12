import { version } from "../../../package.json";

export function SidebarFooter() {
    return (
        <div className="sidebar-footer">
            <div>Uriyyá Music Player v{version}</div>
            <div>Hecho con ❤️ por <a href="https://github.com/bhbarquero-dev">bhbarquero-dev</a></div>
        </div>
    );
}
