import { mountStoreDevtool } from 'simple-zustand-devtools';
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { isDevMode } from '@/utils/app/env';
import { YukuPlatformFee } from '@/canisters/yuku-old/yuku_core';
import { setLanguage } from '@/locales';
import { SupportedLanguage } from '@/types/app';

const isDev = isDevMode();

interface AppState {
    language: SupportedLanguage;
    setLanguage: (language: SupportedLanguage) => void;

    theme: 'light' | 'dark';
    setTheme: (theme: 'light' | 'dark') => void;
    goldModalFlag: boolean;
    setGoldModalFlag: (flag: boolean) => void;

    icp_usd: string | undefined;
    setIcpUsd: (value: string | undefined) => void;
    ogy_usd: string | undefined;
    setOgyUsd: (value: string | undefined) => void;

    yuku_platform_fee: YukuPlatformFee | undefined;
    setYukuPlatformFee: (value: YukuPlatformFee | undefined) => void;

    createTooltipOpen: boolean;
    setCreateTooltipOpen: (o: boolean) => void;

    generationOpen: boolean;
    setGenerationOpen: (o: boolean) => void;
}

export const useAppStore = create<AppState>()(
    devtools(
        persist(
            (set) => ({
                language: 'en',
                setLanguage: (language: SupportedLanguage) => {
                    setLanguage(language);
                    return set({ language });
                },
                generationOpen: false,
                goldModalFlag: false,
                setGoldModalFlag: (flag) => set({ goldModalFlag: flag }),

                // theme: window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light',
                theme: 'light',
                setTheme: (theme: 'light' | 'dark') => set({ theme }),

                icp_usd: undefined,
                setIcpUsd: (value: string | undefined) => set({ icp_usd: value }),
                ogy_usd: undefined,
                setOgyUsd: (value: string | undefined) => set({ ogy_usd: value }),

                yuku_platform_fee: undefined,
                setYukuPlatformFee: (value: YukuPlatformFee | undefined) =>
                    set({ yuku_platform_fee: value }),

                createTooltipOpen: true,
                setCreateTooltipOpen: (open: boolean) => set({ createTooltipOpen: open }),
                setGenerationOpen: (open: boolean) => set({ generationOpen: open }),
            }),
            {
                name: '__yuku_app__',
            },
        ),
        {
            enabled: isDev,
        },
    ),
);

isDev && mountStoreDevtool('AppStore', useAppStore);
