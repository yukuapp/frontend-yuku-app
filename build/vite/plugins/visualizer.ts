import type { Plugin } from 'vite';
import { visualizer } from 'rollup-plugin-visualizer';

//  Package file size analysis
export function visualizerPlugin() {
    if (process.env.REPORT) {
        const v = visualizer({
            filename: './node_modules/.cache/visualizer/stats.html',
            open: true,
            gzipSize: true,
            brotliSize: true,
        });
        return [v as unknown as Plugin];
    }
    return [];
}
