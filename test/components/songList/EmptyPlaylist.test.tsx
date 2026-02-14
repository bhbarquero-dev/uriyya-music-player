import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { EmptyPlaylist } from "@components/songList/EmptyPlaylist";

describe("EmptyPlaylist", () => {
    it("should render default message", () => {
        render(<EmptyPlaylist />);
        expect(screen.getByText("No hay canciones cargadas. Usa la barra lateral para cargar una lista.")).toBeInTheDocument();
    });
});
