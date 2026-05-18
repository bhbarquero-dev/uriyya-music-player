import { describe, it, beforeEach, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { mock } from "vitest-mock-extended";
import { Sidebar } from "@components/sidebar/Sidebar";
import type { Library as LibraryStore } from "@logic/Library";

describe("Sidebar", () => {
    let fakeStore: ReturnType<typeof mock<LibraryStore>>;

    beforeEach(() => {
        fakeStore = mock<LibraryStore>();
    });

    describe("Structure", () => {
        it("should render library behavior entry points", () => {
            render(<Sidebar store={fakeStore} />);
            expect(screen.getByText("Biblioteca")).toBeInTheDocument();
        });

        it("should render sidebar footer", () => {
            render(<Sidebar store={fakeStore} />);
            expect(screen.getByText(/Uriyyá Music Player/i)).toBeInTheDocument();
        });
    });
});
