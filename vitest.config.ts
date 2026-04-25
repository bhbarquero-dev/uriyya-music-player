import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@logic': path.resolve(__dirname, './src/logic'),
            '@components': path.resolve(__dirname, './src/components'),
        },
    },
    test: {
        environment: 'jsdom',
        globals: true,
        setupFiles: ['./test/setup.ts'],
        exclude: ['**/node_modules/**', '**/dist/**', '**/e2e/**'],
    },
})
