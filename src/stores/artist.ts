import { produce } from 'immer';
import { mountStoreDevtool } from 'simple-zustand-devtools';
import { devtools, persist } from 'zustand/middleware';
import { shallow } from 'zustand/shallow';
import { createWithEqualityFn } from 'zustand/traditional';
import { isDevMode } from '@/utils/app/env';
import { Apply2ArtistFormData } from '@/canisters/yuku-old/yuku_application';
import { MintingNFT } from '@/canisters/yuku-old/yuku_artist_router';

const isDev = isDevMode();

export type MimeType = 'video' | 'image' | '3dmodel';

export interface CreateNFTFormData extends MintingNFT {
    discord?: string;
    twitter?: string;
    instagram?: string;
    telegram?: string;
    medium?: string;
    website?: string;

    mimeTypeOrigin?: MimeType;
    mimeTypeThumb?: MimeType;
}

const getInitialApply2ArtistFromData = (): Apply2ArtistFormData => {
    return {
        contact: '',
        name: '',
        representing: '',
        interested: '',
    };
};

const initialCreateNFTFormData: CreateNFTFormData = {
    name: '',
    category: '',
    description: '',
    url: '',
    mimeType: '',
    thumb: '',
    attributes: [],
    timestamp: 0,
};

interface ArtistState {
    applyFormData: Apply2ArtistFormData;
    updateArtistApplyFormData: (data: Apply2ArtistFormData) => void;
    deleteArtistApplyFormData: () => void;

    createNFTFormData: CreateNFTFormData;
    updateCreateNFTFormData: (data: any) => void;
    deleteCreateNFTFormData: () => void;
}

export const useArtistStore = createWithEqualityFn<ArtistState>()(
    devtools(
        persist(
            (set) => ({
                applyFormData: getInitialApply2ArtistFromData(),
                updateArtistApplyFormData: (data: Apply2ArtistFormData) =>
                    set(
                        produce((state: ArtistState) => {
                            Object.keys(data).forEach((key) => {
                                state.applyFormData[key] = data[key];
                            });
                        }),
                    ),
                deleteArtistApplyFormData: () => {
                    set({ applyFormData: getInitialApply2ArtistFromData() });
                },

                createNFTFormData: initialCreateNFTFormData,
                updateCreateNFTFormData: (data: CreateNFTFormData) =>
                    set(
                        produce((state: ArtistState) => {
                            Object.keys(data).forEach((key) => {
                                state.createNFTFormData[key] = data[key];
                            });
                        }),
                    ),
                deleteCreateNFTFormData: () => {
                    set({ createNFTFormData: initialCreateNFTFormData });
                },
            }),
            {
                name: '__yuku_artist__',
            },
        ),
        {
            enabled: isDev,
        },
    ),
    shallow,
);

isDev && mountStoreDevtool('ArtistStore', useArtistStore);
