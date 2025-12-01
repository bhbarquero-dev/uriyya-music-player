import { defineConfig } from 'vite';

// https://vitejs.dev/config
export default defineConfig({
    build: {
        watch: {
            include: ['src/main/**'],
        },
    },
    server: {
        watch: {
            ignored: ['**/coverage/**'],
        },
    },
});
