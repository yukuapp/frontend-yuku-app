import type { Plugin } from 'vite';
import legacy from '@vitejs/plugin-legacy';

// The default browser support baseline for Vite is native ESM. This plugin provides support for traditional browsers that do not support native ESM.
// It generates a corresponding legacy chunk for each chunk in the final bundle, transforms them using @babel/preset-env, and publishes them in the form of SystemJS modules (still supporting code splitting!).
export function legacyPlugin() {
    return legacy({
        targets: ['ie >= 11'],
        additionalLegacyPolyfills: ['regenerator-runtime/runtime'],
    }) as unknown as Plugin[];
}
