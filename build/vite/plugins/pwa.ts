import type { Plugin } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import { ImportMetaEnv } from '../../../src/vite-env';

// vite pwa 0 configuration plugin https://github.com/antfu/vite-plugin-pwa

export function pwaPlugin(env: ImportMetaEnv) {
    const {
        VITE_PLUGIN_USE_PWA: shouldUsePwa,
        VITE_PLUGIN_GLOB_APP_TITLE: appTitle,
        VITE_PLUGIN_GLOB_APP_SHORT_NAME: shortName,
    } = env;

    if (shouldUsePwa) {
        // vite-plugin-pwa
        const pwaPlugin = VitePWA({
            manifest: {
                name: appTitle,
                short_name: shortName,
                icons: [
                    // I don't know how to configure the images yet
                    // {
                    //     src: "./resource/images/pwa-192x192.png",
                    //     sizes: "192x192",
                    //     type: "image/png",
                    // },
                    // {
                    //     src: "./resource/images/pwa-512x512.png",
                    //     sizes: "512x512",
                    //     type: "image/png",
                    // },
                ],
            },
        });
        return pwaPlugin as unknown as Plugin[];
    }
    return [];
}
