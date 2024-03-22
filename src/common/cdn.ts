const YUKU_S3AWS_OLD = import.meta.env.YUKU_S3AWS_OLD;
const YUKU_CLOUDFLARE = import.meta.env.YUKU_CLOUDFLARE;
// CDN proxy for static resources
export const cdn = (
    url: string | undefined,
    origin?: string, // The source address to use for completing the link if needed
    modify?: (cdn: string) => string, // Function to modify the original URL
): string | undefined => {
    if (url === undefined) return undefined;
    url = url?.replace(YUKU_S3AWS_OLD, YUKU_CLOUDFLARE);
    if (!url.trim()) return url; // No content// Replace old proxy with new one
    if (url.startsWith('https://cdn.yuku.app')) return url; // Already proxied
    if (!url.match(/^https?:\/\//)) {
        // 0. If it is localhost, no proxy is needed, request local resources
        if (location.origin === `http://localhost:4000`) {
            return url;
        }
        // 1. Complete the link
        url = `${
            origin ?? location.origin // Use the current address if not specified
        }${url}`;
    }

    // 2. Check if encoding is required
    url = decodeURIComponent(url); // Decode first to prevent double encoding
    let path = (() => {
        let index = url.indexOf('/', 9); // Find the first /
        if (index >= 0) return url.substring(index);
        // If there is no /, check for parameters
        index = url.indexOf('?');
        if (index === -1) return '';
        return url.substring(index);
    })();
    url = encodeURIComponent(url); // Encode

    // 3. Return the proxy
    if (path.indexOf('url=') >= 0) path = '';
    const hasSearch = path.indexOf('?') >= 0;

    let cdn = `https://cdn.yuku.app${path}${!hasSearch ? '?' : ''}${
        path.endsWith('?') ? '' : '&'
    }url=${url}`;
    if (modify) cdn = modify(cdn); // Modify if necessary
    return cdn;
};

// Specify image transformation options
export const cdn_by_resize = (
    url: string | undefined,
    {
        width,
        height,
        fit,
        quality,
    }: {
        width?: number;
        height?: number;
        fit?: 'scale-down' | 'contain' | 'cover' | 'crop' | 'pad';
        quality?: number;
    },
    origin?: string,
) =>
    cdn(url, origin, (cdn) => {
        const changed = width || height || fit || quality;
        if (!changed) return cdn;
        const index = cdn.lastIndexOf('?');
        if (index === -1) cdn += '?';
        if (width) cdn += `${cdn.endsWith('?') ? '' : '&'}width=${width}`;
        if (height) cdn += `${cdn.endsWith('?') ? '' : '&'}height=${height}`;
        if (fit) cdn += `${cdn.endsWith('?') ? '' : '&'}fit=${fit}`;
        if (quality) cdn += `${cdn.endsWith('?') ? '' : '&'}quality=${quality}`;
        return cdn;
    });

// Origin of the static assets canister
export const ASSETS_CANISTER_ORIGIN = 'https://yg2aj-yqaaa-aaaai-qpbqq-cai.raw.icp0.io/frontend';

// Load resources from the static assets canister
export const cdn_by_assets = (url: string | undefined) => cdn(url, ASSETS_CANISTER_ORIGIN);

// URL wrapper
export const url_cdn = (
    url: string | undefined,
    origin?: string, // The source address to use for completing the link if needed
    modify?: (cdn: string) => string, // Function to modify the original URL
): string | undefined => `url('${cdn(url, origin, modify)}')`;
export const url_cdn_by_resize = (
    url: string | undefined,
    options: {
        width?: number;
        height?: number;
        fit?: 'scale-down' | 'contain' | 'cover' | 'crop' | 'pad';
        quality?: number;
    },
    origin?: string,
) => `url('${cdn_by_resize(url, options, origin)}')`;
export const url_cdn_by_assets = (url: string | undefined) => `url('${cdn_by_assets(url)}')`;
