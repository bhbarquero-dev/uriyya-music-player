import { defineConfig } from 'vitest/config'
import '@testing-library/jest-dom/vitest'

export default defineConfig({
    test: {
        environment: 'jsdom',
        globals: true,
    },
})
