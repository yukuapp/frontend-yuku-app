import { defineConfig, loadEnv, UserConfig } from 'vite';
import path from 'path';
import { createVitePlugins } from './build/vite/plugins';
import { ImportMetaEnv } from './src/vite-env';

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
    console.warn('command and mode->', command, mode);

    const readEnv = loadEnv(mode, './env');
    // @ts-ignore force transform, not a bit problem for string variable
    const metaEvn: ImportMetaEnv = readEnv; // Import the environment variables set, which will select the file based on the selected mode
    console.warn('IMPORT_META_ENV -> ', metaEvn); // Output the loaded environment variables
    // but matters other types

    // port
    let port = parseInt(metaEvn.VITE_PORT ?? '3000');
    if (isNaN(port)) port = 3000;
    console.log('port ->', port);

    const isBuild = command === 'build';
    const isProd = command === 'build' && mode.startsWith('production');

    console.warn('isBuild and isProd ->', isProd, isProd);

    // console and debugger
    const drop_console = isProd || metaEvn.VITE_DROP_CONSOLE === 'true';
    const drop_debugger = isProd || metaEvn.VITE_DROP_DEBUGGER === 'true';

    let define: any = {};
    if (!isBuild) {
        define = {
            ...define,
            // ? Originally needed for astrox me login, but always failed to build, not needed here since it is imported in html
            'process.env.NODE_ENV': JSON.stringify(mode), // Used in the interface file for judgment, needs to be wrapped in double quotes for some reason
            'process.env': process.env, // Environment variables
        };
    }

    const common: UserConfig = {
        publicDir: 'public', // Files in this directory will be copied to dist without modification
        mode, // Running mode
        define,
        plugins: [...createVitePlugins(metaEvn, isProd, isBuild)], // Plugins
        resolve: {
            alias: {
                '@': path.resolve(__dirname, 'src'), // Resolve the @ symbol
            },
            extensions: ['.js', '.ts', '.jsx', '.tsx'], // Extensions that can be omitted in import statements
        },
        build: {
            minify: isProd ? 'terser' : false, // Default is esbuild, which is 20-40 times faster than terser with only 1%-2% difference in compression ratio
            terserOptions: isProd && {
                compress: {
                    drop_console, // Remove console in production environment
                    drop_debugger, // Remove debugger in production environment
                },
            },
        },
        envDir: 'env',
        envPrefix: ['BUILD', 'CONNECT', 'ALCHEMY', 'YUKU'],
        clearScreen: false,
        // optimizeDeps: {
        //     esbuildOptions: {
        //         target: 'esnext',
        //         // Node.js global to browser globalThis
        //         // define: {
        //         //     global: 'globalThis',
        //         // },
        //         supported: {
        //             bigint: true,
        //         },
        //     },
        // },
    };

    if (!isProd) {
        return {
            // Configuration specific to serve development mode
            ...common,
            server: {
                hmr: true, // Hot module replacement
                proxy: {
                    '/api': {
                        target: 'http://localhost',
                        changeOrigin: true,
                        rewrite: (path) => path,
                    },
                },
                cors: true,
                host: '0.0.0.0',
                port,
            },
        };
    } else {
        return {
            // Configuration specific to build production mode
            ...common,
        };
    }
});
