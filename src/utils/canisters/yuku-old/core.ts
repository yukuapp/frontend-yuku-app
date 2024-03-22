import * as core from '@/canisters/yuku-old/yuku_core';
import {
    AuctionOffer,
    BatchOrderInfo,
    ProfileLet,
    ShikuNftDutchAuctionDealPrice,
    YukuBuyOrder,
    YukuPlatformFee,
} from '@/canisters/yuku-old/yuku_core';
import { isPrincipalText } from '@/common/ic/principals';
import { ConnectedIdentity } from '@/types/identity';
import { NftListingData } from '@/types/listing';
import { NftIdentifier, TokenInfo } from '@/types/nft';
import { CoreCollectionData } from '@/types/yuku';
import { anonymous } from '../../connect/anonymous';
import { getYukuCoreCanisterId } from './special';

export const updateUserSettings = async (
    identity: ConnectedIdentity,
    args: {
        username: string;
        banner: string;
        avatar: string;
        email: string;
        bio: string;
    },
): Promise<boolean> => {
    const backend_canister_id = getYukuCoreCanisterId();
    return core.updateUserSettings(identity, backend_canister_id, args);
};

export const queryProfileByPrincipal = async (principal: string): Promise<ProfileLet> => {
    const backend_canister_id = getYukuCoreCanisterId();
    return core.queryProfile(anonymous, backend_canister_id, {
        type: 'principal',
        principal,
    });
};

export const queryProfileByAccountHex = async (account: string): Promise<ProfileLet> => {
    const backend_canister_id = getYukuCoreCanisterId();
    return core.queryProfile(anonymous, backend_canister_id, { type: 'address', account });
};

export const queryProfileByPrincipalOrAccountHex = async (
    principal_or_account: string,
): Promise<ProfileLet> => {
    return isPrincipalText(principal_or_account)
        ? queryProfileByPrincipal(principal_or_account)
        : queryProfileByAccountHex(principal_or_account);
};

export const queryCoreCollectionIdList = async (): Promise<string[]> => {
    const backend_canister_id = getYukuCoreCanisterId();
    return core.queryCoreCollectionIdList(anonymous, backend_canister_id);
};

export const queryCoreCollectionIdListByBackend = async (
    backend_canister_id: string,
): Promise<string[]> => {
    return core.queryCoreCollectionIdList(anonymous, backend_canister_id);
};

export const queryCoreCollectionDataList = async (): Promise<CoreCollectionData[]> => {
    const backend_canister_id = getYukuCoreCanisterId();
    return core.queryCoreCollectionDataList(anonymous, backend_canister_id);
};

export const queryCoreCollectionDataListByBackend = async (
    backend_canister_id: string,
): Promise<CoreCollectionData[]> => {
    return core.queryCoreCollectionDataList(anonymous, backend_canister_id);
};

export const queryCoreCollectionData = async (
    collection: string,
): Promise<CoreCollectionData | undefined> => {
    const backend_canister_id = getYukuCoreCanisterId();
    return core.queryCoreCollectionData(anonymous, backend_canister_id, collection);
};

export const queryAllAuctionOfferList = async (principal: string): Promise<AuctionOffer[]> => {
    const backend_canister_id = getYukuCoreCanisterId();
    return core.queryAllAuctionOfferList(anonymous, backend_canister_id, principal);
};

export const queryTokenListing = async (
    token_id_list: NftIdentifier[],
): Promise<NftListingData[]> => {
    const backend_canister_id = getYukuCoreCanisterId();
    return core.queryTokenListing(anonymous, backend_canister_id, token_id_list);
};

export const queryYukuPlatformFee = async (): Promise<YukuPlatformFee> => {
    const backend_canister_id = getYukuCoreCanisterId();
    return core.queryYukuPlatformFee(anonymous, backend_canister_id);
};

export const queryYukuPlatformFeeByBackend = async (
    backend_canister_id: string,
): Promise<YukuPlatformFee> => {
    return core.queryYukuPlatformFee(anonymous, backend_canister_id);
};

export const batchListing = async (
    identity: ConnectedIdentity,
    args: {
        token_identifier: string;
        token: TokenInfo;
        price: string;
    }[],
): Promise<string[]> => {
    const backend_canister_id = getYukuCoreCanisterId();
    return core.batchListing(identity, backend_canister_id, args);
};

export const listing = async (
    identity: ConnectedIdentity,
    args: {
        token_identifier: string;
        token: TokenInfo;
        price: string;
    },
): Promise<string> => {
    const backend_canister_id = getYukuCoreCanisterId();
    return core.listing(identity, backend_canister_id, args);
};

export const cancelListing = async (
    identity: ConnectedIdentity,
    token_identifier: string,
): Promise<string> => {
    const backend_canister_id = getYukuCoreCanisterId();
    return core.cancelListing(identity, backend_canister_id, token_identifier);
};

export const favoriteByCore = async (
    identity: ConnectedIdentity,
    args: {
        token_identifier: string;
        favorite: boolean;
    },
): Promise<void> => {
    const backend_canister_id = getYukuCoreCanisterId();
    return core.favoriteByCore(identity, backend_canister_id, args);
};

export const createSingleBuyOrder = async (
    identity: ConnectedIdentity,
    token_identifier: string,
): Promise<YukuBuyOrder> => {
    const backend_canister_id = getYukuCoreCanisterId();
    return core.createSingleBuyOrder(identity, backend_canister_id, token_identifier);
};

export const submittingTransferHeight = async (
    identity: ConnectedIdentity,
    args: { token_id: NftIdentifier; height: string; token: TokenInfo },
): Promise<string> => {
    const backend_canister_id = getYukuCoreCanisterId();
    return core.submittingTransferHeight(identity, backend_canister_id, args);
};

export const createBatchBuyOrder = async (
    identity: ConnectedIdentity,
    token_identifier_list: string[],
): Promise<BatchOrderInfo> => {
    const backend_canister_id = getYukuCoreCanisterId();
    return core.createBatchBuyOrder(identity, backend_canister_id, token_identifier_list);
};

export const submittingTransferBatchHeight = async (
    identity: ConnectedIdentity,
    transfer_height: string,
    token_id_list: NftIdentifier[],
): Promise<string[]> => {
    const backend_canister_id = getYukuCoreCanisterId();
    return core.submittingTransferBatchHeight(
        identity,
        backend_canister_id,
        transfer_height,
        token_id_list,
    );
};

export const queryShoppingCart = async (identity: ConnectedIdentity): Promise<NftIdentifier[]> => {
    const backend_canister_id = getYukuCoreCanisterId();
    return core.queryShoppingCart(identity, backend_canister_id);
};

export const addShoppingCartItems = async (
    identity: ConnectedIdentity,
    args: {
        token_identifier: string;
        url: string;
        name: string;
    }[],
): Promise<string[]> => {
    const backend_canister_id = getYukuCoreCanisterId();
    return core.addShoppingCartItems(identity, backend_canister_id, args);
};

export const removeShoppingCartItems = async (
    identity: ConnectedIdentity,
    token_identifier?: string,
): Promise<void> => {
    const backend_canister_id = getYukuCoreCanisterId();
    return core.removeShoppingCartItems(identity, backend_canister_id, token_identifier);
};

export const subscribeEmail = async (email: string): Promise<void> => {
    const backend_canister_id = getYukuCoreCanisterId();
    return core.subscribeEmail(anonymous, backend_canister_id, email);
};

export const viewedNft = async (
    identity: ConnectedIdentity,
    token_identifier: string,
): Promise<void> => {
    const backend_canister_id = getYukuCoreCanisterId();
    return core.viewedNft(identity, backend_canister_id, token_identifier);
};

export const queryShikuLandsHighestOffer = async (
    token_identifier: string,
): Promise<AuctionOffer | undefined> => {
    const backend_canister_id = getYukuCoreCanisterId();
    return core.queryShikuLandsHighestOffer(anonymous, backend_canister_id, token_identifier);
};

export const queryShikuLandsDealPrice = async (
    token_identifier: string,
): Promise<ShikuNftDutchAuctionDealPrice | undefined> => {
    const backend_canister_id = getYukuCoreCanisterId();
    return core.queryShikuLandsDealPrice(anonymous, backend_canister_id, token_identifier);
};

export const queryShikuLandsPayAccount = async (identity: ConnectedIdentity): Promise<string> => {
    const backend_canister_id = getYukuCoreCanisterId();
    return core.queryShikuLandsPayAccount(identity, backend_canister_id);
};

export const shikuLandsMakeOffer = async (
    identity: ConnectedIdentity,
    args: {
        seller: string; // account
        token_id: NftIdentifier;
        token: TokenInfo;
        price: string;
        ttl: string;
    },
): Promise<string> => {
    const backend_canister_id = getYukuCoreCanisterId();
    return core.shikuLandsMakeOffer(identity, backend_canister_id, args);
};

export const shikuLandsUpdateOffer = async (
    identity: ConnectedIdentity,
    args: {
        offer_id: string; // ? bigint -> string
        price: string;
    },
): Promise<string> => {
    const backend_canister_id = getYukuCoreCanisterId();
    return core.shikuLandsUpdateOffer(identity, backend_canister_id, args);
};
