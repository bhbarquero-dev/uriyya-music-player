import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { ErrorNotification } from "../../src/components/ErrorNotification";

describe("ErrorNotification", () => {
  it("should not render when error is null", () => {
    const { container } = render(
      <ErrorNotification error={null} onDismiss={() => {}} />
    );

    expect(container.firstChild).toBeNull();
  });

  it("should render error notification when error is provided", () => {
    const error = {
      title: "Test Error",
      message: "This is a test error message",
    };

    render(<ErrorNotification error={error} onDismiss={() => {}} />);

    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText("Test Error")).toBeInTheDocument();
    expect(screen.getByText("This is a test error message")).toBeInTheDocument();
  });

  it("should call onDismiss when close button is clicked", async () => {
    const error = {
      title: "Test Error",
      message: "Test message",
    };
    const onDismiss = vi.fn();
    const user = userEvent.setup();

    render(<ErrorNotification error={error} onDismiss={onDismiss} />);

    const closeButton = screen.getByRole("button", { name: /close/i });
    await user.click(closeButton);

    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it("should auto-dismiss after specified duration", () => {
    vi.useFakeTimers();

    const error = {
      title: "Test Error",
      message: "Test message",
    };
    const onDismiss = vi.fn();

    render(
      <ErrorNotification
        error={error}
        onDismiss={onDismiss}
        autoHideDuration={3000}
      />
    );

    expect(onDismiss).not.toHaveBeenCalled();

    vi.advanceTimersByTime(3000);

    expect(onDismiss).toHaveBeenCalledTimes(1);

    vi.useRealTimers();
  });

  it("should not auto-dismiss when autoHideDuration is 0", () => {
    vi.useFakeTimers();

    const error = {
      title: "Test Error",
      message: "Test message",
    };
    const onDismiss = vi.fn();

    render(
      <ErrorNotification
        error={error}
        onDismiss={onDismiss}
        autoHideDuration={0}
      />
    );

    vi.advanceTimersByTime(10000);

    expect(onDismiss).not.toHaveBeenCalled();

    vi.useRealTimers();
  });

  it("should have proper accessibility attributes", () => {
    const error = {
      title: "Test Error",
      message: "Test message",
    };

    render(<ErrorNotification error={error} onDismiss={() => {}} />);

    const alert = screen.getByRole("alert");
    expect(alert).toHaveAttribute("aria-live", "assertive");

    const closeButton = screen.getByRole("button", { name: /close/i });
    expect(closeButton).toHaveAttribute("aria-label", "Close notification");
  });
});
