import { SupportedBackend } from '@/types/app';
import { BuildMode } from '@/vite-env';

export type YukuSpecialHosts = {
    yuku_api: string; // ? API_URL
    space_host: string; // ? Space_host
    yuku_data_api: string;
    yuku_alchemy_host: string;
    ai_avatar_api: string; // ? ai_avatar_api
    ai_avatar_host: string; // ? ai_avatar_host
};

const hosts_production: YukuSpecialHosts = {
    yuku_api: 'https://api.yuku.app', // ? API_URL
    space_host: 'https://space.yuku.app', // ? Space_host
    yuku_data_api: 'https://stat.yuku.app/api',
    yuku_alchemy_host: 'https://api.alchemypay.org/index/v2',
    ai_avatar_api: 'https://ai.yuku.app', // ? ai_avatar_api
    ai_avatar_host: 'https://aicdn.shiku.pro/client/ShikuAi/index.html', // TODO to be modified ? ai_avatar_host
};

const hosts_staging: YukuSpecialHosts = {
    yuku_api: 'https://api.yuku.app', // ? API_URL
    space_host: 'https://space.yuku.app', // ? Space_host
    yuku_data_api: 'https://staging-stat.yuku.app/api',
    yuku_alchemy_host: 'https://api.alchemypay.org/index/v2',
    ai_avatar_api: 'https://test-ai.yuku.app', // ? ai_avatar_api
    ai_avatar_host: 'https://aicdn.shiku.pro/client/ShikuAi/index.html', // TODO to be modified ? ai_avatar_host
};

const hosts_test: YukuSpecialHosts = {
    yuku_api: 'https://test-api.yuku.app', // ? API_URL
    space_host: 'https://clientcdn.shiku.pro/test/shiku/index.html', // ? Space_host
    yuku_data_api: 'https://stat.yuku.app/api',
    yuku_alchemy_host: 'https://api.alchemypay.org/index/v2',
    ai_avatar_api: 'https://test-ai.yuku.app', // ? ai_avatar_api
    ai_avatar_host: 'https://aicdn.shiku.pro/client/ShikuAi/index.html', // ? ai_avatar_host
};

export const findYukuSpecialHosts = (
    mode: BuildMode,
    backendType: SupportedBackend,
): YukuSpecialHosts => {
    if (mode === 'production') return hosts_production;
    if (mode === 'staging') return hosts_staging;
    if (mode === 'test') return hosts_test;

    // Development build can freely configure the backend selection
    switch (backendType) {
        case 'production':
            return hosts_production;
        case 'staging':
            return hosts_staging;
        case 'test':
            return hosts_test;
    }
    throw new Error(`can not find special hosts: ${backendType}`);
};
