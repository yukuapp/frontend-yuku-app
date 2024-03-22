import { BuildMode } from '@/vite-env';
import { getBackendType } from './backend';

const IS_PRODUCTION = ['https://yuku.app'].includes(location.origin);

const IS_STAGING = [''].includes(location.origin);

const IS_TEST = ['https://test.yuku.app'].includes(location.origin);

const IS_DEVELOPMENT = !IS_PRODUCTION && !IS_STAGING && !IS_TEST;

export const getCommand = (): 'serve' | 'build' => (process?.env?.NODE_ENV ? 'serve' : 'build');

export const getBuildMode = (): BuildMode => {
    if (IS_PRODUCTION) return 'production';
    if (IS_STAGING) return 'staging';
    if (IS_TEST) return 'development';
    if (IS_DEVELOPMENT) return 'development';

    const mode = import.meta.env.BUILD_MODE;
    // console.warn('ENV_MODE', mode);
    switch (mode) {
        case 'production':
        case 'staging':
        case 'test':
        case 'development':
            return mode;
    }
    console.error(`Unknown mode: ${mode}. Parse backend mode failed.`);
    return 'production';
};

export const isDevMode = (): boolean => getBuildMode() !== 'production';

const CHECKED_DERIVATION_ORIGINS = [];
export const getConnectDerivationOrigin = (): string | undefined => {
    if (getCommand() === 'build') {
        const origin = window.location.origin;
        const backendType = (() => {
            const mode = getBuildMode();
            if (mode === 'production') return mode;
            if (mode === 'staging') return mode;
            if (mode === 'test') return mode;
            const backendType = getBackendType();
            switch (backendType) {
                case 'production':
                case 'staging':
                case 'test':
                    return backendType;
            }
            throw new Error(`can not find backend type: ${backendType}`);
        })();
        for (const derivationOrigin of CHECKED_DERIVATION_ORIGINS) {
            if (origin.indexOf(derivationOrigin) >= 0) {
                switch (backendType) {
                    case 'production':
                        return '********';
                    case 'staging':
                        return '********';
                    case 'test':
                        return '********';
                }
            }
        }
    }
    return import.meta.env.CONNECT_DERIVATION_ORIGIN
        ? import.meta.env.CONNECT_DERIVATION_ORIGIN
        : undefined;
};

export const getConnectHost = (): string | undefined =>
    import.meta.env.CONNECT_HOST ? import.meta.env.CONNECT_HOST : undefined;

export const isGoldTheme = () => import.meta.env.yuku_GOLD_THEME;
