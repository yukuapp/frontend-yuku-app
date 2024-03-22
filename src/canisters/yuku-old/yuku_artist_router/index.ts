import { canister_module_hash_and_time } from '@/common/ic/status';
import { ConnectedIdentity } from '@/types/identity';
import { NftIdentifier } from '@/types/nft';
import { ArtistCollectionData, CollectionLinks } from '@/types/yuku';
import module_39dda77a from './module_39dda77a';
import module_beb8bacf from './module_beb8bacf';
import module_dc452c7a from './module_dc452c7a';

const MAPPING_MODULES = {
    ['beb8bacf351a265aa7b8757bed762e2d1a38582ed60d3e576ac53f0d4f0bd59d']: module_beb8bacf,
    ['dc452c7a3cd38232bfcc65e63ef34ff3446c67aca6b79db5c523abc230e7523f']: module_dc452c7a,
    ['39dda77a07f3a2fb5265b7d2022590f32f391f7900b680be7584ee8359b87153']: module_39dda77a,
};

const MAPPING_CANISTERS: Record<
    string,
    | 'beb8bacf351a265aa7b8757bed762e2d1a38582ed60d3e576ac53f0d4f0bd59d'
    | '39dda77a07f3a2fb5265b7d2022590f32f391f7900b680be7584ee8359b87153'
    | 'dc452c7a3cd38232bfcc65e63ef34ff3446c67aca6b79db5c523abc230e7523f'
> = {
    ['qnblj-lyaaa-aaaah-aa74a-cai']:
        'beb8bacf351a265aa7b8757bed762e2d1a38582ed60d3e576ac53f0d4f0bd59d',
    ['st74o-biaaa-aaaah-abcoa-cai']:
        'dc452c7a3cd38232bfcc65e63ef34ff3446c67aca6b79db5c523abc230e7523f',
    ['v32d7-paaaa-aaaah-abc7q-cai']:
        '39dda77a07f3a2fb5265b7d2022590f32f391f7900b680be7584ee8359b87153',
};

export const checkYuKuArtistRouterCanisterModule = async () => {
    for (const canister_id of [
        'qnblj-lyaaa-aaaah-aa74a-cai',
        'st74o-biaaa-aaaah-abcoa-cai',
        'v32d7-paaaa-aaaah-abc7q-cai',
    ]) {
        const r = await canister_module_hash_and_time(canister_id, import.meta.env.CONNECT_HOST);
        console.error('yuku artist router canister module is changed', canister_id, r.module_hash);
    }
};

for (const key of Object.keys(MAPPING_CANISTERS)) {
    const module = MAPPING_CANISTERS[key];
    if (!MAPPING_MODULES[module]) {
        console.error('Yuku artist router canister is not implement', key, module);
    }
}
const getModule = (collection: string) => {
    const module_hex = MAPPING_CANISTERS[collection];
    if (module_hex === undefined)
        throw new Error(`unknown yuku artist router canister id: ${collection}`);
    const module = MAPPING_MODULES[module_hex];
    if (module === undefined)
        throw new Error(`unknown yuku artist router canister id: ${collection}`);
    return module;
};

export const queryArtistCollectionIdList = async (
    identity: ConnectedIdentity,
    backend_canister_id: string,
): Promise<string[]> => {
    const module = getModule(backend_canister_id);
    return module.queryArtistCollectionIdList(identity, backend_canister_id);
};

export const queryArtistCollectionDataList = async (
    identity: ConnectedIdentity,
    backend_canister_id: string,
): Promise<ArtistCollectionData[]> => {
    const module = getModule(backend_canister_id);
    return module.queryArtistCollectionDataList(identity, backend_canister_id);
};

export const queryAllArtistNftTokenIdList = async (
    identity: ConnectedIdentity,
    backend_canister_id: string,
): Promise<NftIdentifier[]> => {
    const module = getModule(backend_canister_id);
    return module.queryAllArtistNftTokenIdList(identity, backend_canister_id);
};

export const getAllArtists = async (
    identity: ConnectedIdentity,
    backend_canister_id: string,
): Promise<string[]> => {
    const module = getModule(backend_canister_id);
    return module.getAllArtists(identity, backend_canister_id);
};

export const queryMintingFee = async (
    identity: ConnectedIdentity,
    backend_canister_id: string,
): Promise<string> => {
    const module = getModule(backend_canister_id);
    return module.queryMintingFee(identity, backend_canister_id);
};

export const queryUserArtistCollection = async (
    identity: ConnectedIdentity,
    backend_canister_id: string,
    principal: string,
): Promise<string | undefined> => {
    const module = getModule(backend_canister_id);
    return module.queryUserArtistCollection(identity, backend_canister_id, principal);
};

export type ArtistCollectionArgs = {
    royalties?: string;
    isVisible?: boolean;
    name?: string;
    category?: string;
    description?: string;
    featured?: string;
    logo?: string;
    banner?: string;
    links?: CollectionLinks;
    releaseTime?: string;
    openTime?: string;
    url?: string;
};

export const createArtistCollection = async (
    identity: ConnectedIdentity,
    backend_canister_id: string,
    args: ArtistCollectionArgs,
): Promise<string> => {
    const module = getModule(backend_canister_id);
    return module.createArtistCollection(identity, backend_canister_id, args);
};

export type NftMetadataLink<T extends string> = { label: T; value: string };
export type Attribute = { trait_type: string; value: string };

export type MintingNFT = {
    name: string;
    category: string;
    description: string;
    url: string;
    mimeType: string;
    thumb: string;
    attributes?: Attribute[];
    timestamp: number;
    linkList?: [
        NftMetadataLink<'discord'>,
        NftMetadataLink<'instagram'>,
        NftMetadataLink<'medium'>,
        NftMetadataLink<'telegram'>,
        NftMetadataLink<'twitter'>,
        NftMetadataLink<'website'>,
    ];
};

export const mintArtistNFT = async (
    identity: ConnectedIdentity,
    backend_canister_id: string,
    args: {
        collection: string;
        to: string;
        metadata?: MintingNFT;
        height: string;
    },
): Promise<NftIdentifier> => {
    const module = getModule(backend_canister_id);
    return module.mintArtistNFT(identity, backend_canister_id, args);
};

export type ArtistNotice = {
    id: string;
    status: 'read' | 'unread';
    minter: string;
    timestamp: string;
    result: { reject: string } | { accept: string };
};

export const queryNoticeList = async (
    identity: ConnectedIdentity,
    backend_canister_id: string,
): Promise<ArtistNotice[]> => {
    const module = getModule(backend_canister_id);
    return module.queryNoticeList(identity, backend_canister_id);
};

export const readNotices = async (
    identity: ConnectedIdentity,
    backend_canister_id: string,
    args: string[],
): Promise<void> => {
    const module = getModule(backend_canister_id);
    return module.readNotices(identity, backend_canister_id, args);
};
