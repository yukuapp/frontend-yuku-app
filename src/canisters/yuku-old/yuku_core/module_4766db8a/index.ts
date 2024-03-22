import { Principal } from '@dfinity/principal';
import _ from 'lodash';
import { customStringify } from '@/common/data/json';
import { parse_nft_identifier } from '@/common/nft/ext';
import { bigint2string, string2bigint } from '@/common/types/bigint';
import { unwrapOption, unwrapOptionMap, wrapOption } from '@/common/types/options';
import { principal2string, string2principal } from '@/common/types/principal';
import {
    parseMotokoResult,
    unwrapMotokoResult,
    unwrapMotokoResultMap,
} from '@/common/types/results';
import {
    mapping_true,
    throwsVariantError,
    unchanging,
    unwrapVariant2,
    unwrapVariant4Map,
    unwrapVariantKey,
} from '@/common/types/variant';
import { throwIdentity } from '@/stores/identity';
import { ConnectedIdentity } from '@/types/identity';
import { ListingFee, NftListing, NftListingData } from '@/types/listing';
import { NftIdentifier, TokenInfo } from '@/types/nft';
import { ExtUser } from '@/types/nft-standard/ext';
import {
    CollectionCreator,
    CollectionInfo,
    CollectionMetadata,
    CoreCollectionData,
} from '@/types/yuku';
import {
    AuctionOffer,
    BatchOrderInfo,
    getNewUser,
    getUserSettings,
    parseProfileLet,
    ProfileLet,
    ShikuLandsMakeOfferArgs,
    ShikuNftDutchAuctionDealPrice,
    UpdateUserSettingsArgs,
    wrapTokenInfo,
    YukuBuyOrder,
} from '..';
import { parseCollectionStandard, unwrapCollectionLinks } from '../../types';
import idlFactory from './core_4766db8a.did';
import {
    _SERVICE,
    Auction as CandidAuction,
    CollectionData as CandidCollectionData,
    DutchAuction as CandidDutchAuction,
    Fee as CandidFee,
    Fixed as CandidFixed,
    CollectionCreatorData,
    CollectionInfo__1,
    /* cspell: disable-next-line */
    CollectionStatsImmut,
    Err,
    Err__1,
    Offer,
    Order,
    TokenSpec__2,
    User__1,
} from './core_4766db8a.did.d';

export const registerUser = async (
    identity: ConnectedIdentity,
    backend_canister_id: string,
    principal: string,
): Promise<boolean> => {
    const { creator } = identity;
    const actor: _SERVICE = await creator(idlFactory, backend_canister_id);
    const r = await actor.createProfile(getNewUser(principal));
    // console.debug(`🚀 ~ file: index.ts:82 ~ r:`, r);
    const mapped = parseMotokoResult(r, mapping_true, (err) => err);
    return unwrapMotokoResult(mapped, (e) => {
        if (e['alreadyCreate'] !== undefined) return false;
        throw new Error(`${unwrapVariantKey(e)}`);
    });
};

export const updateUserSettings = async (
    identity: ConnectedIdentity,
    backend_canister_id: string,
    args: UpdateUserSettingsArgs,
): Promise<boolean> => {
    const { creator } = identity;
    const actor: _SERVICE = await creator(idlFactory, backend_canister_id);
    const r = await actor.updateProfile(getUserSettings(args));
    return r;
};

export const queryProfile = async (
    identity: ConnectedIdentity,
    backend_canister_id: string,
    args: { type: 'address'; account: string } | { type: 'principal'; principal: string },
): Promise<ProfileLet> => {
    const { creator } = identity;
    const actor: _SERVICE = await creator(idlFactory, backend_canister_id);
    const r = await actor.findProfileWho(
        args.type === 'address'
            ? { address: args.account }
            : { principal: string2principal(args.principal) },
    );
    return parseProfileLet(args, r);
};

export const queryCoreCollectionIdList = async (
    identity: ConnectedIdentity,
    backend_canister_id: string,
): Promise<string[]> => {
    const { creator } = identity;
    const actor: _SERVICE = await creator(idlFactory, backend_canister_id);
    const r = await actor.listCollections();
    return _.uniq(r);
    return r;
};

export const parseCollectionInfo = (info: CollectionInfo__1): CollectionInfo => {
    return {
        collection: principal2string(info.canisterId), // ? principal -> string
        url: unwrapOption(info.url),
        creator: principal2string(info.creator), // ? principal -> string
        featured: unwrapOption(info.featured),
        logo: unwrapOption(info.logo),
        name: info.name,
        banner: unwrapOption(info.banner),
        description: unwrapOption(info.description),
        links: unwrapCollectionLinks(info.links),
        isVisible: info.isVisible,
        royalties: `${Number(info.royalties.rate) / 10 ** (Number(info.royalties.precision) - 2)}`,
        category: unwrapOption(info.category),
        standard: parseCollectionStandard(info.standard),
        releaseTime: unwrapOptionMap(info.releaseTime, bigint2string),
    };
};
const parseCollectionCreator = (
    creator: [] | [CollectionCreatorData],
): CollectionCreator | undefined =>
    unwrapOptionMap(creator, (o) => ({
        bio: o.bio,
        username: o.userName,
        userId: principal2string(o.userId), // ? principal -> string
        time: bigint2string(o.time),
        avatar: o.avatar,
    }));
const parseCollectionMetadata = (
    stats: [] | [CollectionStatsImmut] /* cspell: disable-line */,
): CollectionMetadata | undefined =>
    unwrapOptionMap(stats, (s) => ({
        listings: s.listings.map((l) => ({
            tokenIdentifier: l.tokenIdentifier,
            price: bigint2string(l.price),
        })),
        tradeCount: bigint2string(s.tradeCount),
        createTime: bigint2string(s.createTime),
        floorPrice: bigint2string(s.floorPrice), // ? bigint -> string
        volumeTrade: bigint2string(s.volumeTrade),
    }));

const parseCoreCollectionData = (d: CandidCollectionData): CoreCollectionData => {
    const info: CollectionInfo = parseCollectionInfo(d.info);
    const creator: CollectionCreator | undefined = parseCollectionCreator(d.creator);
    const metadata: CollectionMetadata | undefined = parseCollectionMetadata(d.stats);
    const data: CoreCollectionData = { info };
    if (creator !== undefined) data.creator = creator;
    if (metadata !== undefined) data.metadata = metadata;
    return data;
};
export const queryCoreCollectionDataList = async (
    identity: ConnectedIdentity,
    backend_canister_id: string,
): Promise<CoreCollectionData[]> => {
    const { creator } = identity;
    const actor: _SERVICE = await creator(idlFactory, backend_canister_id);
    const r = await actor.listCollections2([]);
    const results = r.map(parseCoreCollectionData);
    return _.uniqBy(results, (item) => item.info.collection);
    return results;
};

export const queryCoreCollectionData = async (
    identity: ConnectedIdentity,
    backend_canister_id: string,
    collection: string,
): Promise<CoreCollectionData | undefined> => {
    const { creator } = identity;
    const actor: _SERVICE = await creator(idlFactory, backend_canister_id);
    const r = await actor.getCollectionData(string2principal(collection));
    return unwrapOptionMap(r, parseCoreCollectionData);
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

const unwrapExtUser = (u: User__1): ExtUser =>
    unwrapVariant2<Principal, string, string, string>(
        u,
        ['principal', principal2string],
        ['address', unchanging],
    ) as ExtUser;

const unwrapTokenInfo = (token: TokenSpec__2): TokenInfo => {
    return {
        symbol: token.symbol,
        canister: token.canister,
        standard: { type: 'Ledger' },
        decimals: bigint2string(token.decimal),
        fee: bigint2string(token.fee),
    };
};

const unwrapAuctionOffer = (d: Offer): AuctionOffer => {
    return {
        token_id: {
            collection: parse_nft_identifier(d.tokenIdentifier).collection,
            token_identifier: d.tokenIdentifier,
        },
        ttl: bigint2string(d.ttl),
        status: unwrapVariantKey(d.status),
        token: unwrapTokenInfo(d.token),
        tokenIdentifier: d.tokenIdentifier,
        time: bigint2string(d.time),
        seller: unwrapExtUser(d.seller),
        price: bigint2string(d.price),
        offerId: bigint2string(d.offerId),
        bidder: principal2string(d.bidder),
    };
};
export const queryAllAuctionOfferList = async (
    identity: ConnectedIdentity,
    backend_canister_id: string,
    principal: string,
): Promise<AuctionOffer[]> => {
    const { creator } = identity;
    const actor: _SERVICE = await creator(idlFactory, backend_canister_id);
    const r = await actor.listOfferMade(string2principal(principal));

    return r.map(unwrapAuctionOffer);
};

const parseListingFee = (fee: CandidFee): ListingFee => {
    return {
        platform: bigint2string(fee.platform),
        royalties: bigint2string(fee.royalties),
    };
};

export const queryTokenListing = async (
    identity: ConnectedIdentity,
    backend_canister_id: string,
    token_id_list: NftIdentifier[],
): Promise<NftListingData[]> => {
    const { creator } = identity;
    const actor: _SERVICE = await creator(idlFactory, backend_canister_id);
    const r = await actor.nftInfos(token_id_list.map((token_id) => token_id.token_identifier));

    return r.map((d, i) => {
        const token_id = token_id_list[i];

        let latest_price: string | undefined = bigint2string(d.lastPrice);
        if (latest_price === '0') latest_price = undefined;

        const time = unwrapOptionMap(d.listTime, bigint2string);
        /* cspell: disable-next-line */
        if (d.listing['unlist'] === undefined && time === undefined) {
            console.error(`listing time can not be undefiled when listing status`);
        }

        return {
            token_id,
            views: bigint2string(d.views),
            favorited: d.favoriters.map(principal2string) /* cspell: disable-line */,
            latest_price,
            listing: unwrapVariant4Map<
                null,
                CandidFixed,
                CandidAuction,
                CandidDutchAuction,
                NftListing
            >(
                d.listing,
                ['unlist', () => ({ type: 'holding' })] /* cspell: disable-line */,
                [
                    'fixed',
                    (fixed) => ({
                        type: 'listing',
                        time: time!,
                        token: unwrapTokenInfo(fixed.token),
                        price: bigint2string(fixed.price),
                        raw: {
                            type: 'yuku',
                            token_identifier: (() => {
                                if (fixed.tokenIdentifier !== token_id.token_identifier)
                                    throw new Error(`token identifier must be same`);
                                return token_id.token_identifier;
                            })(),
                            seller: principal2string(fixed.seller),
                            fee: parseListingFee(fixed.fee),
                        },
                    }),
                ],
                [
                    'auction',
                    (auction) => ({
                        type: 'auction',
                        time: time!,
                        token_identifier: (() => {
                            if (auction.tokenIdentifier !== token_id.token_identifier)
                                throw new Error(`token identifier must be same`);
                            return token_id.token_identifier;
                        })(),
                        seller: principal2string(auction.seller),
                        fee: parseListingFee(auction.fee),
                        auction: {
                            ttl: bigint2string(auction.ttl),
                            start: bigint2string(auction.startPrice),
                            abort: unwrapOptionMap(
                                auction.resevePrice /* cspell: disable-line */,
                                bigint2string,
                            ),
                            highest: (() => {
                                const price = unwrapOptionMap(auction.highestPrice, bigint2string);
                                const bidder = unwrapOptionMap(
                                    auction.highestBidder,
                                    principal2string,
                                );
                                if (price === undefined || bidder === undefined) return undefined;
                                return {
                                    price,
                                    bidder,
                                };
                            })(),
                        },
                    }),
                ],
                [
                    'dutchAuction',
                    (dutch) => ({
                        type: 'dutch',
                        time: time!,
                        token_identifier: (() => {
                            if (dutch.tokenIdentifier !== token_id.token_identifier)
                                throw new Error(`token identifier must be same`);
                            return token_id.token_identifier;
                        })(),
                        seller: principal2string(dutch.seller),
                        token: unwrapTokenInfo(dutch.token),
                        fee: parseListingFee(dutch.fee), // ? principal -> string
                        auction: {
                            time: {
                                start: bigint2string(dutch.startTime),
                                end: bigint2string(dutch.endTime),
                                reduce: bigint2string(dutch.reduceTime),
                            },
                            price: {
                                start: bigint2string(dutch.startPrice),
                                floor: bigint2string(dutch.floorPrice),
                                reduce: bigint2string(dutch.reducePrice),
                            },
                            payee: unwrapVariant2<Principal, string, string, string>(
                                dutch.payee,
                                ['principal', principal2string],
                                ['address', unchanging],
                            ) as ExtUser,
                        },
                    }),
                ],
            ),
            raw: customStringify(d),
        };
    });
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
    const { creator } = identity;
    const actor: _SERVICE = await creator(idlFactory, backend_canister_id);
    const r = await actor.queryPlatformFee();
    return {
        account: r.account,
        fee: bigint2string(r.fee),
        precision: bigint2string(r.precision),
    };
};

const formatError1 = (e: Err__1): string => {
    const key = unwrapVariantKey(e);
    switch (key) {
        case 'other':
            return `listing failed: ${e['other'][1]}`;
    }
    return `unknown error: ${key}`;
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
    const { creator } = identity;
    const actor: _SERVICE = await creator(idlFactory, backend_canister_id);
    const r = await actor.batchSell(
        args.map((args) => ({
            tokenIdentifier: args.token_identifier,
            token: wrapTokenInfo(args.token),
            price: string2bigint(args.price),
        })),
    );
    return r.map((r) =>
        unwrapMotokoResultMap<string, Err__1, string>(
            r,
            unchanging, // token_identifier
            formatError1,
        ),
    );
};

const throwErr__1 = (e: Err__1) => {
    const key = unwrapVariantKey(e);
    switch (key) {
        case 'other':
            throw new Error(`listing failed: ${e['other'][1]}`);
    }
    throw new Error(`unknown error: ${key}`);
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
    const { creator } = identity;
    const actor: _SERVICE = await creator(idlFactory, backend_canister_id);
    const r = await actor.sell({
        tokenIdentifier: args.token_identifier,
        token: {
            symbol: args.token.symbol,
            canister: args.token.canister,
            decimal: string2bigint(args.token.decimals),
            fee: string2bigint(args.token.fee ?? '0'),
        },
        price: string2bigint(args.price),
    });
    return unwrapMotokoResultMap<string, Err__1, string>(
        r,
        unchanging, // token_identifier
        throwErr__1,
    );
};

export const cancelListing = async (
    identity: ConnectedIdentity,
    backend_canister_id: string,
    token_identifier: string,
): Promise<string> => {
    const { creator } = identity;
    const actor: _SERVICE = await creator(idlFactory, backend_canister_id);
    const r = await actor.unSell(token_identifier);
    return unwrapMotokoResultMap<string, Err__1, string>(
        r,
        unchanging, // token_identifier
        throwErr__1,
    );
};

export const favoriteByCore = async (
    identity: ConnectedIdentity,
    backend_canister_id: string,
    args: {
        token_identifier: string;
        favorite: boolean;
    },
): Promise<void> => {
    const { creator } = identity;
    const actor: _SERVICE = await creator(idlFactory, backend_canister_id);
    args.favorite
        ? await actor.favorite(args.token_identifier)
        : await actor.unfavorite(args.token_identifier);
};

export const createSingleBuyOrder = async (
    identity: ConnectedIdentity,
    backend_canister_id: string,
    token_identifier: string,
): Promise<YukuBuyOrder> => {
    const { creator } = identity;
    const actor: _SERVICE = await creator(idlFactory, backend_canister_id);
    const r = await actor.buyNow(token_identifier);
    return unwrapMotokoResultMap<Order, Err__1, YukuBuyOrder>(
        r,
        (o) => ({
            fee: parseListingFee({ platform: o.fee.platform.fee, royalties: o.fee.royalties.fee }),
            token: unwrapTokenInfo(o.token),
            tokenIdentifier: o.tokenIdentifier,
            tradeType: unwrapVariantKey(o.tradeType),
            memo: bigint2string(o.memo),
            time: bigint2string(o.time),
            seller: unwrapExtUser(o.seller),
            buyer: unwrapExtUser(o.buyer),
            price: bigint2string(o.price),
        }),
        throwErr__1,
    );
};

const throwErr = (e: Err) => {
    const key = unwrapVariantKey(e);
    switch (key) {
        case 'Other':
            throw new Error(`submit height failed: ${e['Other'][1]}`);
    }
    if (key) throw new Error(`submit height failed: ${key}`);
    throw new Error(`unknown error: ${key}`);
};

export const submittingTransferHeight = async (
    identity: ConnectedIdentity,
    backend_canister_id: string,
    args: {
        token_id: NftIdentifier;
        height: string;
        token: TokenInfo;
    },
): Promise<string> => {
    const { creator } = identity;
    const actor: _SERVICE = await creator(idlFactory, backend_canister_id);
    const r = await actor.verifyTxWithMemo(string2bigint(args.height), wrapTokenInfo(args.token));
    return unwrapMotokoResultMap<string, Err, string>(r, unchanging, (e: Err) => {
        if (e['DuplicateHeight'] === null) return args.token_id.token_identifier;
        return throwErr(e);
    });
};

export const createBatchBuyOrder = async (
    identity: ConnectedIdentity,
    backend_canister_id: string,
    token_identifier_list: string[],
): Promise<BatchOrderInfo> => {
    const { creator } = identity;
    const actor: _SERVICE = await creator(idlFactory, backend_canister_id);
    const r = await actor.batchBuyNow(token_identifier_list);
    return unwrapMotokoResultMap<{ Memo: bigint; Price: bigint }, Err__1, BatchOrderInfo>(
        r,
        (o) => ({
            memo: bigint2string(o.Memo),
            price: bigint2string(o.Price),
        }),
        throwErr__1,
    );
};

export const submittingTransferBatchHeight = async (
    identity: ConnectedIdentity,
    backend_canister_id: string,
    transfer_height: string,
    token_id_list: NftIdentifier[],
): Promise<string[]> => {
    const { creator } = identity;
    const actor: _SERVICE = await creator(idlFactory, backend_canister_id);
    const r = await actor.batchVerifyTx(string2bigint(transfer_height));
    return unwrapMotokoResultMap<string[], Err, string[]>(r, unchanging, (e: Err) => {
        if (e['DuplicateHeight'] === null) return token_id_list.map((t) => t.token_identifier);
        return throwErr(e);
    });
};

export const queryShoppingCart = async (
    identity: ConnectedIdentity,
    backend_canister_id: string,
): Promise<NftIdentifier[]> => {
    const { creator } = identity;
    const actor: _SERVICE = await creator(idlFactory, backend_canister_id);
    const r = await actor.showCart();
    return r.map((c) => parse_nft_identifier(c.tokenIdentifier));
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
    const { creator } = identity;
    const actor: _SERVICE = await creator(idlFactory, backend_canister_id);
    const r = await actor.addCarts(
        args.map((a) => ({
            tokenIdentifier: a.token_identifier,
            nftUrl: a.url,
            nftName: a.name,
        })),
    );
    return r.map((c) =>
        unwrapMotokoResultMap<string, any, string>(c, unchanging, ([token_identifier, message]) => {
            return `${token_identifier} ${message}`;
        }),
    );
};

export const removeShoppingCartItems = async (
    identity: ConnectedIdentity,
    backend_canister_id: string,
    token_identifier?: string,
): Promise<void> => {
    const { creator } = identity;
    const actor: _SERVICE = await creator(idlFactory, backend_canister_id);
    await actor.removeCarts(wrapOption(token_identifier));
};

export const subscribeEmail = async (
    identity: ConnectedIdentity,
    backend_canister_id: string,
    email: string,
): Promise<void> => {
    const { creator } = identity;
    const actor: _SERVICE = await creator(idlFactory, backend_canister_id);
    await actor.subscribe(email);
};

export const viewedNft = async (
    identity: ConnectedIdentity,
    backend_canister_id: string,
    token_identifier: string,
): Promise<void> => {
    const { creator } = identity;
    const actor: _SERVICE = await creator(idlFactory, backend_canister_id);
    await actor.view(token_identifier);
};

export const queryShikuLandsHighestOffer = async (
    identity: ConnectedIdentity,
    backend_canister_id: string,
    token_identifier: string,
): Promise<AuctionOffer | undefined> => {
    const { creator } = identity;
    const actor: _SERVICE = await creator(idlFactory, backend_canister_id);
    const r = await actor.findHighOfferByNft(token_identifier);
    return unwrapOptionMap(r, unwrapAuctionOffer);
};

export const queryShikuLandsDealPrice = async (
    identity: ConnectedIdentity,
    backend_canister_id: string,
    token_identifier: string,
): Promise<ShikuNftDutchAuctionDealPrice | undefined> => {
    const { creator } = identity;
    const actor: _SERVICE = await creator(idlFactory, backend_canister_id);
    const r = await actor.getPriceOfAuction(token_identifier);
    return unwrapOptionMap(r, (d) => ({
        token: unwrapTokenInfo(d.token),
        price: bigint2string(d.price),
    }));
};

export const queryShikuLandsPayAccount = async (
    identity: ConnectedIdentity,
    backend_canister_id: string,
): Promise<string> => {
    const { creator } = identity;
    const actor: _SERVICE = await creator(idlFactory, backend_canister_id);
    const r = await actor.getPayAddress();
    return r;
};

export const shikuLandsMakeOffer = async (
    identity: ConnectedIdentity,
    backend_canister_id: string,
    args: ShikuLandsMakeOfferArgs,
): Promise<string> => {
    const { creator } = identity;
    const actor: _SERVICE = await creator(idlFactory, backend_canister_id);
    throwIdentity(identity);
    const r = await actor.makeOffer({
        seller: { address: args.seller },
        tokenIdentifier: args.token_id.token_identifier,
        token: wrapTokenInfo(args.token),
        price: string2bigint(args.price),
        bidder: string2principal(identity.principal!),
        ttl: string2bigint(args.ttl),
    });
    return unwrapMotokoResultMap(r, bigint2string, throwsVariantError);
};

export const shikuLandsUpdateOffer = async (
    identity: ConnectedIdentity,
    backend_canister_id: string,
    args: {
        offer_id: string; // ? bigint -> string
        price: string;
    },
): Promise<string> => {
    const { creator } = identity;
    const actor: _SERVICE = await creator(idlFactory, backend_canister_id);
    const r = await actor.updateOffer(string2bigint(args.offer_id), string2bigint(args.price));
    return unwrapMotokoResultMap(r, bigint2string, throwsVariantError);
};

export default {
    registerUser,
    updateUserSettings,
    queryProfile,
    queryCoreCollectionIdList,
    parseCollectionInfo,
    queryCoreCollectionDataList,
    queryCoreCollectionData,
    queryAllAuctionOfferList,
    queryTokenListing,
    queryYukuPlatformFee,
    batchListing,
    listing,
    cancelListing,
    favoriteByCore,
    createSingleBuyOrder,
    submittingTransferHeight,
    createBatchBuyOrder,
    submittingTransferBatchHeight,
    queryShoppingCart,
    addShoppingCartItems,
    removeShoppingCartItems,
    subscribeEmail,
    viewedNft,
    queryShikuLandsHighestOffer,
    queryShikuLandsDealPrice,
    queryShikuLandsPayAccount,
    shikuLandsMakeOffer,
    shikuLandsUpdateOffer,
};
