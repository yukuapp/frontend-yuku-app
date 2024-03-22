import type { PluginOption } from 'vite';
import purgeIcons from 'vite-plugin-purge-icons';
import react from '@vitejs/plugin-react-swc';
import { ImportMetaEnv } from '../../../src/vite-env';
import { viteCompressionPlugin } from './compression';
import { viteHtmlPlugins } from './html';
import { imageminPlugin } from './imagemin';
import { legacyPlugin } from './legacy';
import { pwaPlugin } from './pwa';
import { svgIconsPlugin } from './svgIcons';
import { visualizerPlugin } from './visualizer';
import { viteYaml } from './yaml';

export const createVitePlugins = (metaEvn: ImportMetaEnv, isProd: boolean, isBuild: boolean) => {
    const {
        VITE_PLUGIN_LEGACY: legacy,
        VITE_PLUGIN_BUILD_COMPRESS_TYPE: compressType,
        VITE_PLUGIN_BUILD_COMPRESS_DELETE_ORIGIN_FILE: shouldBuildCompressDeleteFile,
        VITE_PLUGIN_USE_IMAGEMIN: shouldUseImagemin,
    } = metaEvn;

    const vitePlugins: (PluginOption | PluginOption[])[] = [];
    vitePlugins.push(react());
    vitePlugins.push(...viteHtmlPlugins(metaEvn, isProd, isBuild)); // Inject configuration strings
    vitePlugins.push(svgIconsPlugin(isProd)); // Manage SVG icon resources
    vitePlugins.push(...viteYaml()); // Import YAML
    vitePlugins.push(purgeIcons({})); // Manage images
    vitePlugins.push(...visualizerPlugin()); // Visualize dependency analysis, non-production mode
    legacy === 'true' && vitePlugins.push(...legacyPlugin()); // Support for legacy browsers

    if (isProd) {
        // Execute in production mode
        vitePlugins.push(
            viteCompressionPlugin(compressType, shouldBuildCompressDeleteFile === 'true'), // Compression
        );
        shouldUseImagemin === 'true' && vitePlugins.push(imageminPlugin()); // Compress images, vite-plugin-imagemin seems to not support M1 chips, need to check later
        vitePlugins.push(...pwaPlugin(metaEvn)); // Cache applications and more
    }

    return vitePlugins;
};
