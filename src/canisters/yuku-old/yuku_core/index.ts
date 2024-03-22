import _ from 'lodash';
import { principal2account } from '@/common/ic/account';
import { bigint2string, string2bigint } from '@/common/types/bigint';
import { principal2string } from '@/common/types/principal';
import { MotokoResult, parseMotokoResult, unwrapMotokoResult } from '@/common/types/results';
import { unwrapVariantKey } from '@/common/types/variant';
import { getRandomAvatar, getRandomBanner } from '@/common/yuku';
import { ConnectedIdentity } from '@/types/identity';
import { ListingFee, NftListingData } from '@/types/listing';
import { NftIdentifier, TokenInfo } from '@/types/nft';
import { ExtUser } from '@/types/nft-standard/ext';
import { CoreCollectionData } from '@/types/yuku';
import { filterNotSupportedTokenIdentifier, filterOgyTokenIdentifier } from '../../nft/special';
import module_8d3a5afa from './module_8d3a5afa';
import module_971fd8f8 from './module_971fd8f8';
import module_4766db8a from './module_4766db8a';
import { Result_2 as CandidProfileLetResult } from './module_4766db8a/core_4766db8a.did.d';

const MAPPING_MODULES = {
    ['8d3a5afa682995a237ba949621127498710996002f7d9f18808239f75b9520f7']: module_8d3a5afa,
    ['4766db8a9e1d96051319b795924a84a8646d35ba8c8f8e4d87f7c85232fc4473']: module_4766db8a,
    ['971fd8f85af57ef257c3de57452c88cf4fa316f62a6b2ddd0bf4451535ce9e01']: module_971fd8f8,
};

const MAPPING_CANISTERS: Record<
    string,
    | '8d3a5afa682995a237ba949621127498710996002f7d9f18808239f75b9520f7'
    | '4766db8a9e1d96051319b795924a84a8646d35ba8c8f8e4d87f7c85232fc4473'
    | '971fd8f85af57ef257c3de57452c88cf4fa316f62a6b2ddd0bf4451535ce9e01'
> = {
    ['udtw4-baaaa-aaaah-abc3q-cai']:
        // '5cecdb323f621b2af6bb46643344da08e4ffca5678654199505d701baab98e1b',
        '8d3a5afa682995a237ba949621127498710996002f7d9f18808239f75b9520f7',

    ['pfsjt-fqaaa-aaaap-aaapq-cai']:
        // '3242c8077cd7ffba5a58abe98db0bd46fac030bbd57857572944257dbdc8fabb',
        '4766db8a9e1d96051319b795924a84a8646d35ba8c8f8e4d87f7c85232fc4473',

    ['ajy76-hiaaa-aaaah-aa3mq-cai']:
        // 'cfd33178f492d106e545b0803705e3c54c461716ef6665386f7c3cc1728a8723',
        '971fd8f85af57ef257c3de57452c88cf4fa316f62a6b2ddd0bf4451535ce9e01',
};
for (const key of Object.keys(MAPPING_CANISTERS)) {
    const module = MAPPING_CANISTERS[key];
    if (!MAPPING_MODULES[module]) {
        console.error('yuku core canister is not implement', key, module);
    }
}
const getModule = (collection: string) => {
    const module_hex = MAPPING_CANISTERS[collection];
    if (module_hex === undefined) throw new Error(`unknown yuku core canister id: ${collection}`);
    const module = MAPPING_MODULES[module_hex];
    if (module === undefined) throw new Error(`unknown yuku core canister id: ${collection}`);
    return module;
};

export const getNewUser = (principal: string) => {
    return {
        userName: principal,
        banner: getRandomBanner(),
        avatar: getRandomAvatar(),
        email: '',
        bio: '',
        notification: [],
    };
};

export const registerUser = async (
    identity: ConnectedIdentity,
    backend_canister_id: string,
    principal: string,
): Promise<boolean> => {
    const module = getModule(backend_canister_id);
    const r = await module.registerUser(identity, backend_canister_id, principal);
    // console.debug(`🚀 ~ file: index.ts:107 ~ r:`, principal, r);
    return r;
};

export type UpdateUserSettingsArgs = {
    username: string;
    banner: string;
    avatar: string;
    email: string;
    bio: string;
};
export const getUserSettings = (args: UpdateUserSettingsArgs) => {
    return {
        userName: args.username,
        banner: args.banner,
        avatar: args.avatar,
        email: args.email,
        bio: args.bio,
        notification: [],
    };
};
export const updateUserSettings = async (
    identity: ConnectedIdentity,
    backend_canister_id: string,
    args: UpdateUserSettingsArgs,
): Promise<boolean> => {
    const module = getModule(backend_canister_id);
    return module.updateUserSettings(identity, backend_canister_id, args);
};

export type QueryProfileArgs =
    | { type: 'address'; account: string }
    | { type: 'principal'; principal: string };

type ProfileError = { alreadyCreate: null } | { noProfile: null } | { defaultAccount: null };
export type ProfileLet = {
    principal: string | undefined; // ? principal -> string // userId
    account: string;
    username: string;
    banner: string;
    avatar: string;
    email: string;
    bio: string;
    notification: string[];
    created: string[]; // ? token_identifier
    favorited: string[]; // ? token_identifier
    time: string; // ? bigint -> string
    offersReceived: string[];
    collections: string[]; // ? principal -> string
    collected: string[]; // ? token_identifier
    offersMade: string[];
    followed: string[]; // ? principal -> string
    followers: string[]; // ? principal -> string
};
export type ProfileResult = MotokoResult<ProfileLet, ProfileError>;

export const parseProfileLet = (args: QueryProfileArgs, r: CandidProfileLetResult): ProfileLet => {
    const mapped: ProfileResult = parseMotokoResult(
        r,
        (ok) => {
            const value: ProfileLet = {
                principal: principal2string(ok.userId), // ? principal -> string
                account: principal2account(principal2string(ok.userId)),
                username: ok.userName,
                banner: ok.banner,
                avatar: ok.avatar,
                email: ok.email,
                bio: ok.bio,
                notification: ok.notification,
                created: _.uniq(
                    ok.created
                        .filter(filterNotSupportedTokenIdentifier)
                        .filter(filterOgyTokenIdentifier),
                ),
                favorited: _.uniq(
                    ok.favorited
                        .filter(filterNotSupportedTokenIdentifier)
                        .filter(filterOgyTokenIdentifier),
                ),
                time: bigint2string(ok.time),
                offersReceived: ok.offersReceived.map(bigint2string),
                collections: ok.collections.map(principal2string), // ? principal -> string
                collected: ok.collected,
                offersMade: ok.offersMade.map(bigint2string),
                followed: ok.followeds.map(principal2string) /* cspell: disable-line */, // ? principal -> string
                followers: ok.followers.map(principal2string), // ? principal -> string
            };
            return value;
        },
        (err) => err,
    );
    return unwrapMotokoResult(mapped, (e) => {
        const key = unwrapVariantKey(e);
        if (key === 'noProfile') {
            const mock: ProfileLet = {
                principal: args.type === 'principal' ? args.principal : undefined, // ? principal -> string
                account: args.type === 'principal' ? principal2account(args.principal) : '',
                username: args.type === 'principal' ? args.principal : args.account,
                banner: getRandomBanner(),
                avatar: getRandomAvatar(),
                email: '',
                bio: '',
                notification: [],
                created: [],
                favorited: [],
                time: `${Date.now() * 1e6}`,
                offersReceived: [],
                collections: [], // ? principal -> string
                collected: [],
                offersMade: [],
                followed: [], // ? principal -> string
                followers: [], // ? principal -> string
            };
            return mock;
        }
        throw new Error(key);
    });
};

export const queryProfile = async (
    identity: ConnectedIdentity,
    backend_canister_id: string,
    args: QueryProfileArgs,
): Promise<ProfileLet> => {
    const module = getModule(backend_canister_id);
    return module.queryProfile(identity, backend_canister_id, args);
};

export const queryCoreCollectionIdList = async (
    identity: ConnectedIdentity,
    backend_canister_id: string,
): Promise<string[]> => {
    const module = getModule(backend_canister_id);
    return module.queryCoreCollectionIdList(identity, backend_canister_id);
};

export const queryCoreCollectionDataList = async (
    identity: ConnectedIdentity,
    backend_canister_id: string,
): Promise<CoreCollectionData[]> => {
    const module = getModule(backend_canister_id);
    return module.queryCoreCollectionDataList(identity, backend_canister_id);
};

export const queryCoreCollectionData = async (
    identity: ConnectedIdentity,
    backend_canister_id: string,
    collection: string,
): Promise<CoreCollectionData | undefined> => {
    const module = getModule(backend_canister_id);
    return module.queryCoreCollectionData(identity, backend_canister_id, collection);
};

// export const querySingleCoreCollectionData = async (
//     backend_canister_id: string,
//     collection: string,
// ): Promise<CoreCollectionData> => {
//     const { creator } = identity;
//     const actor: _SERVICE = await creator(idlFactory, backend_canister_id);
//     const r = await actor.getCollectionData(string2principal(collection));
//     const data = unwrapOption(r);
//     if (data === undefined) throw new Error('collection not found');
//     return parseCoreCollectionData(data);
// };

export type AuctionOffer = {
    token_id: NftIdentifier;
    ttl: string; // ? bigint -> string
    status: 'expired' | 'rejected' | 'ineffect' | 'accepted' /* cspell: disable-line */;
    token: TokenInfo;
    tokenIdentifier: string; // ? token_identifier
    time: string; // ? bigint -> string
    seller: ExtUser;
    price: string; // ? bigint -> string
    offerId: string; // ? bigint -> string
    bidder: string; // ? principal -> string
};
export const queryAllAuctionOfferList = async (
    identity: ConnectedIdentity,
    backend_canister_id: string,
    principal: string,
): Promise<AuctionOffer[]> => {
    const module = getModule(backend_canister_id);
    return module.queryAllAuctionOfferList(identity, backend_canister_id, principal);
};

export const queryTokenListing = async (
    identity: ConnectedIdentity,
    backend_canister_id: string,
    token_id_list: NftIdentifier[],
): Promise<NftListingData[]> => {
    const module = getModule(backend_canister_id);
    return module.queryTokenListing(identity, backend_canister_id, token_id_list);
};

export type YukuPlatformFee = {
    account: string;
    fee: string; // ? bigint -> string
    precision: string; // ? bigint -> string
};

export const queryYukuPlatformFee = async (
    identity: ConnectedIdentity,
    backend_canister_id: string,
): Promise<YukuPlatformFee> => {
    const module = getModule(backend_canister_id);
    return module.queryYukuPlatformFee(identity, backend_canister_id);
};

export const wrapTokenInfo = (token: TokenInfo) => {
    return {
        symbol: token.symbol,
        canister: token.canister,
        decimal: string2bigint(token.decimals),
        fee: string2bigint(token.fee ?? '0'),
    };
};

export const batchListing = async (
    identity: ConnectedIdentity,
    backend_canister_id: string,
    args: {
        token_identifier: string;
        token: TokenInfo;
        price: string;
    }[],
): Promise<string[]> => {
    const module = getModule(backend_canister_id);
    return module.batchListing(identity, backend_canister_id, args);
};

export const listing = async (
    identity: ConnectedIdentity,
    backend_canister_id: string,
    args: {
        token_identifier: string;
        token: TokenInfo;
        price: string;
    },
): Promise<string> => {
    const module = getModule(backend_canister_id);
    return module.listing(identity, backend_canister_id, args);
};

export const cancelListing = async (
    identity: ConnectedIdentity,
    backend_canister_id: string,
    token_identifier: string,
): Promise<string> => {
    const module = getModule(backend_canister_id);
    return module.cancelListing(identity, backend_canister_id, token_identifier);
};

export const favoriteByCore = async (
    identity: ConnectedIdentity,
    backend_canister_id: string,
    args: {
        token_identifier: string;
        favorite: boolean;
    },
): Promise<void> => {
    const module = getModule(backend_canister_id);
    module.favoriteByCore(identity, backend_canister_id, args);
};

export type YukuBuyOrder = {
    fee: ListingFee;
    token: TokenInfo;
    tokenIdentifier: string;
    tradeType:
        | 'listing' // ? fixed ->
        | 'dutch' // ? dutchAuction ->
        | 'offer'
        | 'auction';
    memo: string; // ? bigint -> string
    time: string; // ? bigint -> string
    seller: ExtUser;
    buyer: ExtUser;
    price: string; // ? bigint -> string
};

export const createSingleBuyOrder = async (
    identity: ConnectedIdentity,
    backend_canister_id: string,
    token_identifier: string,
): Promise<YukuBuyOrder> => {
    const module = getModule(backend_canister_id);
    return module.createSingleBuyOrder(identity, backend_canister_id, token_identifier);
};

export const submittingTransferHeight = async (
    identity: ConnectedIdentity,
    backend_canister_id: string,
    args: { token_id: NftIdentifier; height: string; token: TokenInfo },
): Promise<string> => {
    const module = getModule(backend_canister_id);
    return module.submittingTransferHeight(identity, backend_canister_id, args);
};

export type BatchOrderInfo = {
    memo: string; // ? bigint -> string
    price: string; // ? bigint -> string
};

export const createBatchBuyOrder = async (
    identity: ConnectedIdentity,
    backend_canister_id: string,
    token_identifier_list: string[],
): Promise<BatchOrderInfo> => {
    const module = getModule(backend_canister_id);
    return module.createBatchBuyOrder(identity, backend_canister_id, token_identifier_list);
};

export const submittingTransferBatchHeight = async (
    identity: ConnectedIdentity,
    backend_canister_id: string,
    transfer_height: string,
    token_id_list: NftIdentifier[],
): Promise<string[]> => {
    const module = getModule(backend_canister_id);
    return module.submittingTransferBatchHeight(
        identity,
        backend_canister_id,
        transfer_height,
        token_id_list,
    );
};

export const queryShoppingCart = async (
    identity: ConnectedIdentity,
    backend_canister_id: string,
): Promise<NftIdentifier[]> => {
    const module = getModule(backend_canister_id);
    return module.queryShoppingCart(identity, backend_canister_id);
};

export const addShoppingCartItems = async (
    identity: ConnectedIdentity,
    backend_canister_id: string,
    args: {
        token_identifier: string;
        url: string;
        name: string;
    }[],
): Promise<string[]> => {
    const module = getModule(backend_canister_id);
    return module.addShoppingCartItems(identity, backend_canister_id, args);
};

export const removeShoppingCartItems = async (
    identity: ConnectedIdentity,
    backend_canister_id: string,
    token_identifier?: string,
): Promise<void> => {
    const module = getModule(backend_canister_id);
    module.removeShoppingCartItems(identity, backend_canister_id, token_identifier);
};

export const subscribeEmail = async (
    identity: ConnectedIdentity,
    backend_canister_id: string,
    email: string,
): Promise<void> => {
    const module = getModule(backend_canister_id);
    module.subscribeEmail(identity, backend_canister_id, email);
};

export const viewedNft = async (
    identity: ConnectedIdentity,
    backend_canister_id: string,
    token_identifier: string,
): Promise<void> => {
    const module = getModule(backend_canister_id);
    module.viewedNft(identity, backend_canister_id, token_identifier);
};

export const queryShikuLandsHighestOffer = async (
    identity: ConnectedIdentity,
    backend_canister_id: string,
    token_identifier: string,
): Promise<AuctionOffer | undefined> => {
    const module = getModule(backend_canister_id);
    return module.queryShikuLandsHighestOffer(identity, backend_canister_id, token_identifier);
};

export type ShikuNftDutchAuctionDealPrice = {
    token: TokenInfo;
    price: string; // ? bigint -> string
};

export const queryShikuLandsDealPrice = async (
    identity: ConnectedIdentity,
    backend_canister_id: string,
    token_identifier: string,
): Promise<ShikuNftDutchAuctionDealPrice | undefined> => {
    const module = getModule(backend_canister_id);
    return module.queryShikuLandsDealPrice(identity, backend_canister_id, token_identifier);
};

export const queryShikuLandsPayAccount = async (
    identity: ConnectedIdentity,
    backend_canister_id: string,
): Promise<string> => {
    const module = getModule(backend_canister_id);
    return module.queryShikuLandsPayAccount(identity, backend_canister_id);
};

export type ShikuLandsMakeOfferArgs = {
    seller: string; // account
    token_id: NftIdentifier;
    token: TokenInfo;
    price: string;
    ttl: string;
};

export const shikuLandsMakeOffer = async (
    identity: ConnectedIdentity,
    backend_canister_id: string,
    args: ShikuLandsMakeOfferArgs,
): Promise<string> => {
    const module = getModule(backend_canister_id);
    return module.shikuLandsMakeOffer(identity, backend_canister_id, args);
};

export const shikuLandsUpdateOffer = async (
    identity: ConnectedIdentity,
    backend_canister_id: string,
    args: {
        offer_id: string; // ? bigint -> string
        price: string;
    },
): Promise<string> => {
    const module = getModule(backend_canister_id);
    return module.shikuLandsUpdateOffer(identity, backend_canister_id, args);
};
