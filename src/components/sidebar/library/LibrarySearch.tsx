interface LibrarySearchProps {
    value: string;
    onChange: (query: string) => void;
}

export function LibrarySearch({ value, onChange }: LibrarySearchProps) {
    return (
        <div className="sidebar-search">
            <input
                type="text"
                className="sidebar-search-input"
                placeholder="Buscar canciones..."
                value={value}
                onChange={(e) => onChange(e.target.value)}
            />
        </div>
    );
}
