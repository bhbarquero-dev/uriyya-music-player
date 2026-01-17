import { vi } from 'vitest';
import '@testing-library/jest-dom/vitest';

// Mock scrollIntoView for jsdom
Element.prototype.scrollIntoView = vi.fn();

// Mock Tauri APIs globally
vi.mock("@tauri-apps/api/core", () => ({
    convertFileSrc: vi.fn((path) => `asset://${path}`),
}));

vi.mock("@tauri-apps/plugin-dialog", () => ({
    open: vi.fn(),
}));

vi.mock("@tauri-apps/plugin-fs", () => ({
    readTextFile: vi.fn(),
}));
