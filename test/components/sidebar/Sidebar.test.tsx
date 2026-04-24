import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { Sidebar } from "@components/sidebar/Sidebar";

describe("Sidebar", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("Structure", () => {
        it("should render library behavior entry points", () => {
            render(<Sidebar />);
            expect(screen.getByText("Biblioteca")).toBeInTheDocument();
        });

        it("should render sidebar footer", () => {
            render(<Sidebar />);
            expect(screen.getByText(/Uriyyá Music Player/i)).toBeInTheDocument();
        });
    });
});
