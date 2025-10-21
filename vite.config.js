import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import tailwindcss from '@tailwindcss/vite';
import jsconfigPaths from 'vite-jsconfig-paths';
import path from 'path';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/index.jsx'],
            refresh: true,
        }),
        tailwindcss(),
        jsconfigPaths(),
    ],
    esbuild: {
        jsx: 'automatic',
        jsxImportSource: 'react',
    },
    server: {
        hmr: {
            host: 'localhost',
        },
    },
    define: {
        global: 'globalThis',
    },
    build: {
        // Force new build with different hash on every build
        manifest: true,
        // Ensure assets get unique hashes
        rollupOptions: {
            output: {
                // Add timestamp-based hashing for better cache busting
                entryFileNames: `assets/[name]-[hash].js`,
                chunkFileNames: `assets/[name]-[hash].js`,
                assetFileNames: `assets/[name]-[hash].[ext]`
            }
        }
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'resources/js'),
            'components': path.resolve(__dirname, 'resources/js/components'),
            'contexts': path.resolve(__dirname, 'resources/js/contexts'),
            'hooks': path.resolve(__dirname, 'resources/js/hooks'),
            'layout': path.resolve(__dirname, 'resources/js/layout'),
            'menu-items': path.resolve(__dirname, 'resources/js/menu-items'),
            'routes': path.resolve(__dirname, 'resources/js/routes'),
            'services': path.resolve(__dirname, 'resources/js/services'),
            'store': path.resolve(__dirname, 'resources/js/store'),
            'themes': path.resolve(__dirname, 'resources/js/themes'),
            'ui-component': path.resolve(__dirname, 'resources/js/ui-component'),
            'utils': path.resolve(__dirname, 'resources/js/utils'),
            'views': path.resolve(__dirname, 'resources/js/views'),
            'assets': path.resolve(__dirname, 'resources/js/assets'),
        },
    },
});
