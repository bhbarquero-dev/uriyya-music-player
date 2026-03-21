interface ConfirmDialogProps {
    title: string;
    message: string;
    canSave?: boolean;
    onSave: () => void;
    onDiscard: () => void;
    onCancel: () => void;
}

export function ConfirmDialog({ title, message, canSave = true, onSave, onDiscard, onCancel }: ConfirmDialogProps) {
    return (
        <div
            className="confirm-dialog-overlay"
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-dialog-title"
            aria-describedby="confirm-dialog-message"
        >
            <div className="confirm-dialog">
                <h2 id="confirm-dialog-title" className="confirm-dialog-title">
                    {title}
                </h2>
                <p id="confirm-dialog-message" className="confirm-dialog-message">
                    {message}
                </p>
                <div className="confirm-dialog-actions">
                    <button onClick={onCancel} className="confirm-dialog-btn confirm-dialog-btn--cancel">
                        Cancelar
                    </button>
                    <button onClick={onDiscard} className="confirm-dialog-btn confirm-dialog-btn--discard">
                        Descartar
                    </button>
                    <button onClick={onSave} disabled={!canSave} className="confirm-dialog-btn confirm-dialog-btn--save">
                        Guardar
                    </button>
                </div>
            </div>
        </div>
    );
}
