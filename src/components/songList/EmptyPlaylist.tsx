interface EmptyPlaylistProps {
    message?: string;
}

export function EmptyPlaylist({ message = "No hay canciones cargadas. Usa la barra lateral para cargar una lista." }: EmptyPlaylistProps) {
    return (
        <p style={{ color: "var(--apple-text-secondary)", padding: "32px 48px" }}>
            {message}
        </p>
    );
}
