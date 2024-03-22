/// <reference types="vite/client" />

declare module '*.yaml' {
    const value: Record<string, any>;
    export default value;
}
declare module '*.yml' {
    const value: Record<string, any>;
    export default value;
}

export type BuildMode = 'production' | 'staging' | 'test' | 'development';

export interface ImportMetaEnv {
    // Configuration required for program development
    VITE_PORT?: string;
    VITE_DROP_CONSOLE?: 'true' | 'false'; // Whether to remove console output
    VITE_DROP_DEBUGGER?: 'true' | 'false'; // Whether to remove debugger points

    // Configuration required for Vite plugins
    VITE_PLUGIN_KEYWORDS: string; // Homepage keywords
    VITE_PLUGIN_AUTHOR: string; // Homepage author
    VITE_PLUGIN_DESCRIPTION: string; // Homepage description
    VITE_PLUGIN_ICON: string; // Website ICO
    VITE_PLUGIN_NO_SCRIPT_TITLE: string; // Title for no script support on the homepage
    VITE_PLUGIN_TITLE: string; // Homepage title
    VITE_PLUGIN_SHOW_DEBUG_SCRIPT: 'true' | 'false'; // Display script in styles
    VITE_PLUGIN_LEGACY?: 'true' | 'false';
    VITE_PLUGIN_BUILD_COMPRESS_TYPE?: 'gzip' | 'brotli' | 'none';
    VITE_PLUGIN_BUILD_COMPRESS_DELETE_ORIGIN_FILE?: string;
    VITE_PLUGIN_USE_IMAGEMIN?: 'true' | 'false';
    VITE_PLUGIN_USE_PWA?: 'true' | 'false';
    VITE_PLUGIN_GLOB_APP_TITLE?: string;
    VITE_PLUGIN_GLOB_APP_SHORT_NAME?: string;

    // Configuration required for code usage
    BUILD_MODE: BuildMode;
    CONNECT_HOST: string; // Domain for connection, provided by ic official
    CONNECT_DERIVATION_ORIGIN: string; // Anchors can be specified for certain login methods

    // ALCHEMY
    ALCHEMY_APP_ID: string;

    // YUKU
    YUKU_OGY_BROKER: string;
    YUKU_GOLD_THEME: boolean;
    YUKU_LARK_URL: string;
    YUKU_LARK_URL_ERROR: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
