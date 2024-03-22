import * as ccc_proxy from '@/canisters/yuku-old/yuku_ccc_proxy';
import { ConnectedIdentity } from '@/types/identity';
import { CccProxyNft } from '@/types/nft-standard/ccc';
import { anonymous } from '../../connect/anonymous';
import { getYukuCccProxyCanisterId } from './special';

export const queryNftDepositor = async (
    collection: string,
    index: number,
): Promise<string | undefined> => {
    const backend_canister_id = getYukuCccProxyCanisterId();
    return ccc_proxy.queryNftDepositor(anonymous, backend_canister_id, {
        collection,
        index,
    });
};

export const beforeDepositingNft = async (
    identity: ConnectedIdentity,
    args: { collection: string; token_index: number },
): Promise<boolean> => {
    const backend_canister_id = getYukuCccProxyCanisterId();
    return ccc_proxy.beforeDepositingNft(identity, backend_canister_id, args);
};

export const afterDepositingNft = async (
    identity: ConnectedIdentity,
    args: { collection: string; token_index: number },
): Promise<boolean> => {
    const backend_canister_id = getYukuCccProxyCanisterId();
    return ccc_proxy.afterDepositingNft(identity, backend_canister_id, args);
};

export const getAllCccProxyNfts = async (): Promise<CccProxyNft[]> => {
    const backend_canister_id = getYukuCccProxyCanisterId();
    return ccc_proxy.getAllCccProxyNfts(anonymous, backend_canister_id);
};

export const retrieveCccNft = async (
    identity: ConnectedIdentity,
    token_identifier: string,
): Promise<boolean> => {
    const backend_canister_id = getYukuCccProxyCanisterId();
    return ccc_proxy.retrieveCccNft(identity, backend_canister_id, token_identifier);
};
