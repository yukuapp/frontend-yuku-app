import * as origyn_art from '@/canisters/yuku-old/yuku_origyn_art';
import { OrigynArtCollectionData } from '@/canisters/yuku-old/yuku_origyn_art';
import { TokenInfo } from '@/types/nft';
import { anonymous } from '../../connect/anonymous';
import { getYukuOrigynArtCanisterId } from './special';

export const queryOrigynArtCollectionIdList = async (): Promise<string[]> => {
    const backend_canister_id = getYukuOrigynArtCanisterId();
    return origyn_art.queryOrigynArtCollectionIdList(anonymous, backend_canister_id);
};

export const queryOrigynArtSupportedTokens = async (): Promise<TokenInfo[]> => {
    const backend_canister_id = getYukuOrigynArtCanisterId();
    return origyn_art.queryOrigynArtSupportedTokens(anonymous, backend_canister_id);
};

export const queryOrigynArtMarketCollectionIdList = async (): Promise<string[]> => {
    const backend_canister_id = getYukuOrigynArtCanisterId();
    return origyn_art.queryOrigynArtMarketCollectionIdList(anonymous, backend_canister_id);
};

export const queryOrigynArtMarketCollectionIdListByBackend = async (
    backend_canister_id: string,
): Promise<string[]> => {
    return origyn_art.queryOrigynArtMarketCollectionIdList(anonymous, backend_canister_id);
};

export const queryOrigynArtMarketCollectionDataList = async (): Promise<
    OrigynArtCollectionData[]
> => {
    const backend_canister_id = getYukuOrigynArtCanisterId();
    return origyn_art.queryOrigynArtMarketCollectionDataList(anonymous, backend_canister_id);
};
export const queryOrigynArtMarketCollectionDataListByBackend = async (
    backend_canister_id: string,
): Promise<OrigynArtCollectionData[]> => {
    return origyn_art.queryOrigynArtMarketCollectionDataList(anonymous, backend_canister_id);
};
