import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ConfirmDialog } from "../../../src/components/common/ConfirmDialog";

describe("ConfirmDialog", () => {
    const defaultProps = {
        title: "Cambios sin guardar",
        message: "Tienes cambios sin guardar. ¿Qué deseas hacer?",
        onSave: vi.fn(),
        onDiscard: vi.fn(),
        onCancel: vi.fn(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should render title and message", () => {
        render(<ConfirmDialog {...defaultProps} />);

        expect(screen.getByText("Cambios sin guardar")).toBeInTheDocument();
        expect(screen.getByText("Tienes cambios sin guardar. ¿Qué deseas hacer?")).toBeInTheDocument();
    });

    it("should render all three action buttons", () => {
        render(<ConfirmDialog {...defaultProps} />);

        expect(screen.getByRole("button", { name: "Guardar" })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Descartar" })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Cancelar" })).toBeInTheDocument();
    });

    it("should call onSave when Guardar is clicked", async () => {
        const onSave = vi.fn();
        const user = userEvent.setup();
        render(<ConfirmDialog {...defaultProps} onSave={onSave} />);

        await user.click(screen.getByRole("button", { name: "Guardar" }));

        expect(onSave).toHaveBeenCalledTimes(1);
    });

    it("should call onDiscard when Descartar is clicked", async () => {
        const onDiscard = vi.fn();
        const user = userEvent.setup();
        render(<ConfirmDialog {...defaultProps} onDiscard={onDiscard} />);

        await user.click(screen.getByRole("button", { name: "Descartar" }));

        expect(onDiscard).toHaveBeenCalledTimes(1);
    });

    it("should call onCancel when Cancelar is clicked", async () => {
        const onCancel = vi.fn();
        const user = userEvent.setup();
        render(<ConfirmDialog {...defaultProps} onCancel={onCancel} />);

        await user.click(screen.getByRole("button", { name: "Cancelar" }));

        expect(onCancel).toHaveBeenCalledTimes(1);
    });

    it("should disable Guardar button when canSave is false", () => {
        render(<ConfirmDialog {...defaultProps} canSave={false} />);

        expect(screen.getByRole("button", { name: "Guardar" })).toBeDisabled();
    });

    it("should enable Guardar button by default (canSave defaults to true)", () => {
        render(<ConfirmDialog {...defaultProps} />);

        expect(screen.getByRole("button", { name: "Guardar" })).toBeEnabled();
    });
});
