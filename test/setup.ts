import { vi } from 'vitest';
import '@testing-library/jest-dom/vitest';

class MockResizeObserver implements ResizeObserver {
    observe = vi.fn<(target: Element, options?: ResizeObserverOptions) => void>();
    unobserve = vi.fn<(target: Element) => void>();
    disconnect = vi.fn<() => void>();
    takeRecords = vi.fn<() => ResizeObserverEntry[]>(() => []);
}

// Mock scrollIntoView for jsdom
Element.prototype.scrollIntoView = vi.fn();
vi.stubGlobal("ResizeObserver", MockResizeObserver);

// Mock Tauri APIs globally
vi.mock("@tauri-apps/api/core", () => ({
    convertFileSrc: vi.fn((path) => `asset://${path}`),
}));
