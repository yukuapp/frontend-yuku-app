import * as artist_router from '@/canisters/yuku-old/yuku_artist_router';
import { ArtistCollectionArgs, MintingNFT } from '@/canisters/yuku-old/yuku_artist_router';
import { ConnectedIdentity } from '@/types/identity';
import { NftIdentifier } from '@/types/nft';
import { ArtistCollectionData } from '@/types/yuku';
import { anonymous } from '../../connect/anonymous';
import { getYukuArtistRouterCanisterId } from './special';

export const queryArtistCollectionIdList = async (): Promise<string[]> => {
    const backend_canister_id = getYukuArtistRouterCanisterId();
    return artist_router.queryArtistCollectionIdList(anonymous, backend_canister_id);
};

export const queryArtistCollectionIdListByBackend = async (
    backend_canister_id: string,
): Promise<string[]> => {
    return artist_router.queryArtistCollectionIdList(anonymous, backend_canister_id);
};

export const queryAllArtistNftTokenIdList = async (): Promise<NftIdentifier[]> => {
    const backend_canister_id = getYukuArtistRouterCanisterId();
    return artist_router.queryAllArtistNftTokenIdList(anonymous, backend_canister_id);
};

export const queryArtistCollectionDataList = async (): Promise<ArtistCollectionData[]> => {
    const backend_canister_id = getYukuArtistRouterCanisterId();
    return artist_router.queryArtistCollectionDataList(anonymous, backend_canister_id);
};

export const queryArtistCollectionDataListByBackend = async (
    backend_canister_id: string,
): Promise<ArtistCollectionData[]> => {
    return artist_router.queryArtistCollectionDataList(anonymous, backend_canister_id);
};

export const getAllArtists = async (): Promise<string[]> => {
    const backend_canister_id = getYukuArtistRouterCanisterId();
    return artist_router.getAllArtists(anonymous, backend_canister_id);
};

export const queryMintingFee = async (): Promise<string> => {
    const backend_canister_id = getYukuArtistRouterCanisterId();
    return artist_router.queryMintingFee(anonymous, backend_canister_id);
};

export const queryUserArtistCollection = async (principal: string): Promise<string | undefined> => {
    const backend_canister_id = getYukuArtistRouterCanisterId();
    return artist_router.queryUserArtistCollection(anonymous, backend_canister_id, principal);
};

export const createArtistCollection = async (
    identity: ConnectedIdentity,
    args: ArtistCollectionArgs,
): Promise<string | undefined> => {
    const backend_canister_id = getYukuArtistRouterCanisterId();
    return artist_router.createArtistCollection(identity, backend_canister_id, args);
};

export const mintArtistNFT = async (
    identity: ConnectedIdentity,
    args: {
        collection: string;
        to: string; // principal or account_hex
        metadata?: MintingNFT;
        height: string;
    },
): Promise<NftIdentifier> => {
    const backend_canister_id = getYukuArtistRouterCanisterId();
    return artist_router.mintArtistNFT(identity, backend_canister_id, args);
};

export type ArtistNotice = {
    id: string; // ? bigint -> string
    status: 'read' | 'unread';
    minter: string;
    timestamp: string; // ? bigint -> string
    result: { reject: string } | { accept: string };
};

export const queryNoticeList = async (identity: ConnectedIdentity): Promise<ArtistNotice[]> => {
    const backend_canister_id = getYukuArtistRouterCanisterId();
    return artist_router.queryNoticeList(identity, backend_canister_id);
};

export const readNotices = async (identity: ConnectedIdentity, args: string[]): Promise<void> => {
    const backend_canister_id = getYukuArtistRouterCanisterId();
    return artist_router.readNotices(identity, backend_canister_id, args);
};
