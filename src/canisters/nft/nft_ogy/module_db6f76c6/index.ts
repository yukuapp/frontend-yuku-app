import { Principal } from '@dfinity/principal';
import { MILLISECONDS_DAY, MILLISECONDS_YEAR } from '@/common/data/dates';
import { customStringify } from '@/common/data/json';
import { principal2account } from '@/common/ic/account';
import { string2bigint } from '@/common/types/bigint';
import { unwrapOption, wrapOptionMap } from '@/common/types/options';
import { principal2string, string2principal } from '@/common/types/principal';
import { unwrapMotokoResult, unwrapMotokoResultMap } from '@/common/types/results';
import {
    throwsBy,
    unchanging,
    unwrapVariant,
    unwrapVariant3Map,
    unwrapVariant4,
    unwrapVariant4Map,
    unwrapVariantKey,
} from '@/common/types/variant';
import { ConnectedIdentity } from '@/types/identity';
import { NftListing, NftListingData } from '@/types/listing';
import { NftIdentifier, NftTokenOwner, TokenInfo } from '@/types/nft';
import { OgyCandyValue_47a7c018 } from '@/types/nft-standard/ogy-candy';
import {
    BidNftArg,
    OgyCollectionInfo_2f2a0ab9,
    OgyTokenActive,
    OgyTokenHistory,
    parseOgyAuctionToNftListing_db6f76c6,
    parseOgyCollectionInfo_47a7c018,
    parseOgyDutchAuctionToNftListing_db6f76c6,
    parseOgyNiftyToNftListing_db6f76c6,
    unwrapActiveRecords,
    unwrapHistoryRecords,
} from '..';
import idlFactory from './ogy_db6f76c6.did';
import _SERVICE, {
    AuctionStateStable,
    BidResponse,
    CandyShared,
    CollectionInfo,
    DutchStateStable,
    ManageSaleResponse,
    /* cspell: disable-next-line */
    MarketTransferRequestReponse as MarketTransferRequestResponse,
    NFTInfoStable,
    NiftyStateStable,
    OrigynError,
    PropertyShared,
    SaleInfoResponse,
    SaleStatusStable,
    SubAccountInfo,
} from './ogy_db6f76c6.did.d';

// =========================== Query OGY Collection Info ===========================

export const queryCollectionInfoByOgy = async (
    identity: ConnectedIdentity,
    collection: string,
): Promise<OgyCollectionInfo_2f2a0ab9<OgyCandyValue_47a7c018>> => {
    const { creator } = identity;
    const actor: _SERVICE = await creator(idlFactory, collection);
    const r = await actor.collection_nft_origyn([]);
    return unwrapMotokoResultMap<
        CollectionInfo,
        OrigynError,
        OgyCollectionInfo_2f2a0ab9<OgyCandyValue_47a7c018>
    >(r, parseOgyCollectionInfo_47a7c018, throwsBy(`can not query ogy info: ${collection}`));
};

// =========================== Query Owners of All Tokens by ID List ===========================

export const queryAllTokenOwnersByIdList = async (
    identity: ConnectedIdentity,
    collection: string,
    id_list: string[] | undefined,
): Promise<NftTokenOwner[]> => {
    const { creator } = identity;
    const actor: _SERVICE = await creator(idlFactory, collection);
    if (id_list === undefined) return [];
    const r = await actor.bearer_batch_nft_origyn(id_list);
    return r
        .map((s, index) =>
            unwrapMotokoResult(
                s,
                throwsBy(`can not query bearer info: ${collection} ${id_list[index]}`),
            ),
        )
        .map((s, index) => ({
            token_id: {
                collection,
                token_identifier: id_list[index],
            },
            owner: unwrapVariant4Map(
                s,
                ['account_id', unchanging],
                ['principal', (p: Principal) => principal2account(principal2string(p))],
                [
                    'extensible',
                    (s: CandyShared) => {
                        // There is a principal inside
                        if (s['Principal']) return principal2string(s['Principal']);
                        throw new Error(`do not know how to transform candy shared to account`);
                    },
                ],
                [
                    'account',
                    (s: { owner: Principal; sub_account: [] | [Array<number>] }) =>
                        principal2account(principal2string(s.owner), unwrapOption(s.sub_account)),
                ],
            ),
            raw: {
                standard: 'ogy',
                data: {
                    token_id: id_list[index],
                    account: unwrapVariant4(
                        s,
                        ['account_id', unchanging],
                        ['principal', principal2string],
                        ['extensible', (s: CandyShared) => customStringify(s)],
                        [
                            'account',
                            (s: { owner: Principal; sub_account: [] | [Array<number>] }) => ({
                                owner: principal2string(s.owner),
                                sub_account: unwrapOption(s.sub_account),
                            }),
                        ],
                    ) as any,
                },
            },
        }));
};

// =========================== Query Owners of All Tokens by OGY Collection ===========================

export const queryAllTokenOwnersByOgy = async (
    identity: ConnectedIdentity,
    collection: string,
): Promise<NftTokenOwner[]> => {
    const r = await queryCollectionInfoByOgy(identity, collection);
    return queryAllTokenOwnersByIdList(identity, collection, r.token_ids);
};

// =========================== Query Owner of a Specific NFT by OGY Collection ===========================

export const querySingleTokenOwnerByOgy = async (
    identity: ConnectedIdentity,
    collection: string,
    token_identifier: string,
): Promise<string> => {
    const { creator } = identity;
    const actor: _SERVICE = await creator(idlFactory, collection);
    const results = await actor.bearer_batch_nft_origyn([token_identifier]);
    const account = unwrapMotokoResult(
        results[0],
        throwsBy((e) => `${JSON.stringify(e)}`),
    );
    return unwrapVariant4Map(
        account,
        ['account_id', unchanging],
        ['principal', (p: Principal) => principal2account(principal2string(p))],
        [
            'extensible',
            (s: CandyShared) => {
                // There is a principal inside
                if (s['Principal']) return principal2string(s['Principal']);
                throw new Error(`do not know how to transform candy shared to account`);
            },
        ],
        [
            'account',
            (s: { owner: Principal; sub_account: [] | [Array<number>] }) =>
                principal2account(principal2string(s.owner), unwrapOption(s.sub_account)),
        ],
    );
};

// =========================== Get NFT Minter by OGY Collection ===========================

export const queryCollectionNftMinterByOgy = async (
    identity: ConnectedIdentity,
    collection: string,
    token_identifier: string,
): Promise<string> => {
    const { creator } = identity;
    const actor: _SERVICE = await creator(idlFactory, collection);
    const r = await actor.nft_origyn(token_identifier);
    return unwrapMotokoResultMap<NFTInfoStable, OrigynError, string>(
        r,
        (d: NFTInfoStable) => {
            const metadata = d.metadata;
            if (metadata['Class']) {
                for (const s of metadata['Class'] as PropertyShared[]) {
                    if (s.name === '__system' && s.value['Class']) {
                        for (const ss of s.value['Class'] as PropertyShared[]) {
                            if (ss.name === 'com.origyn.originator') {
                                return principal2string(ss.value['Principal'] as Principal);
                            }
                        }
                    }
                }
            }
            throw new Error(`query collection nft minter failed`);
        },
        throwsBy(`query collection nft minter failed`),
    );
};

// =========================== Query Listing Info of Specific NFT by OGY Collection ===========================

export const queryTokenListingByOgy = async (
    identity: ConnectedIdentity,
    collection: string,
    token_id_list: NftIdentifier[],
    yuku_ogy_broker: string,
): Promise<NftListingData[]> => {
    const { creator } = identity;
    const actor: _SERVICE = await creator(idlFactory, collection);
    const result = await actor.nft_batch_origyn(
        token_id_list.map((token_id) => token_id.token_identifier),
    );
    const list = result.map((r, index) => {
        return unwrapMotokoResultMap<NFTInfoStable, any, NFTInfoStable>(
            r,
            unchanging,
            throwsBy(
                (e) =>
                    `can not get nft_batch_origyn for ${collection}/${token_id_list[index].token_identifier}: ${e}`,
            ),
        );
    });
    return list.map((d, index) => {
        const listing_data: NftListingData = {
            token_id: token_id_list[index],
            listing: { type: 'holding' },
            raw: customStringify(d),
        };
        // Convert data to NftListingData
        const current_sale = unwrapOption(d.current_sale);
        if (current_sale === undefined) return listing_data; // If there is no sale information, it is considered not listed
        listing_data.listing = unwrapVariant3Map<
            NiftyStateStable,
            AuctionStateStable,
            DutchStateStable,
            NftListing
        >(
            current_sale.sale_type,
            ['nifty', parseOgyNiftyToNftListing_db6f76c6],
            [
                'auction',
                (a) =>
                    parseOgyAuctionToNftListing_db6f76c6(current_sale.sale_id, a, yuku_ogy_broker),
            ],
            ['dutch', parseOgyDutchAuctionToNftListing_db6f76c6],
        );
        return listing_data;
    });
};

// =========================== Remove NFT from Listing by OGY Collection ===========================

export const retrieveNftFromListingByOgy = async (
    identity: ConnectedIdentity,
    collection: string,
    token_identifier: string,
): Promise<boolean> => {
    const { creator } = identity;
    const actor: _SERVICE = await creator(idlFactory, collection);
    const result = await actor.sale_nft_origyn({ end_sale: token_identifier });
    console.error('retrieveNftFromListingByOgy', collection, token_identifier, result);
    const r = unwrapMotokoResultMap<ManageSaleResponse, OrigynError, ManageSaleResponse>(
        result,
        unchanging,
        throwsBy(`cancel ogy nft sell failed`),
    );
    const end_sale = r['end_sale'];
    if (end_sale === undefined) throw new Error(`cancel ogy nft sell failed`);
    const txn_type = end_sale['txn_type'];
    return !!txn_type['sale_ended'];
};

// =========================== List NFT by OGY Collection ===========================

export const listingByOgy = async (
    identity: ConnectedIdentity,
    collection: string,
    args: {
        broker_id?: string; // Broker ID
        token_identifier: string;
        token: TokenInfo; // Token information
        price: string; // Price (already multiplied by unit precision)
        allow_list?: string[]; // Whitelist for repurchase
    },
): Promise<boolean> => {
    const { creator } = identity;
    const actor: _SERVICE = await creator(idlFactory, collection);
    const result = await actor.market_transfer_nft_origyn({
        token_id: args.token_identifier,
        sales_config: {
            broker_id: wrapOptionMap(args.broker_id, string2principal),
            pricing: {
                auction: {
                    token: {
                        ic: {
                            id: wrapOptionMap(args.token.id, string2bigint),
                            symbol: args.token.symbol,
                            canister: string2principal(args.token.canister),
                            standard: {
                                [args.token.standard.type]: args.token.standard.raw ?? null,
                            } as any,
                            decimals: string2bigint(args.token.decimals),
                            fee: wrapOptionMap(args.token.fee, string2bigint),
                        },
                    },
                    reserve: [], // ? Unknown purpose
                    min_increase: { amount: BigInt(0) },
                    allow_list: wrapOptionMap(args.allow_list, (s) => s.map(string2principal)),
                    start_price: string2bigint(args.price), // start_price and buy_now are the same for immediate purchase
                    buy_now: [string2bigint(args.price)], // User-defined
                    start_date: BigInt(Date.now() * 1e6),
                    ending: {
                        date: BigInt(
                            (Date.now() +
                                (args.allow_list ? MILLISECONDS_DAY : MILLISECONDS_YEAR * 30)) *
                                1e6,
                        ), // 24 hours if there is repurchase, 30 years if not
                    },
                },
            },
            escrow_receipt: [], // ? Escrow receipt
        },
    });
    console.error('listingByOgy', collection, args, result);
    unwrapMotokoResultMap<
        MarketTransferRequestResponse,
        OrigynError,
        MarketTransferRequestResponse
    >(result, unchanging, throwsBy(`listing ogy nft failed`));
    return true;
};

// =========================== Query Recharge Account for OGY Purchase ===========================

export const queryRechargeAccountByOgy = async (
    identity: ConnectedIdentity,
    collection: string,
    principal: string, // Who wants to make the purchase
): Promise<string> => {
    const { creator } = identity;
    const actor: _SERVICE = await creator(idlFactory, collection);
    const result = await actor.sale_info_nft_origyn({
        deposit_info: [{ principal: string2principal(principal) }],
    });
    return unwrapMotokoResultMap<SaleInfoResponse, OrigynError, string>(
        result,
        (d: SaleInfoResponse) => {
            const r = unwrapVariant<SubAccountInfo>(d, 'deposit_info');
            if (r) return r.account_id_text;
            throw new Error(`query recharge address failed`);
        },
        throwsBy(`query recharge address failed`),
    );
};

// =========================== OGY Purchase ===========================

const parseSaleArg = (args: BidNftArg) => {
    return {
        bid: {
            broker_id: wrapOptionMap(args.broker_id, string2principal),
            escrow_receipt: {
                token: {
                    ic: {
                        id: wrapOptionMap(args.token.id, string2bigint),
                        symbol: args.token.symbol,
                        canister: string2principal(args.token.canister),
                        standard: {
                            [args.token.standard.type]: args.token.standard.raw ?? null,
                        } as any,
                        decimals: string2bigint(args.token.decimals),
                        fee: wrapOptionMap(args.token.fee, string2bigint),
                    },
                },
                token_id: args.token_identifier,
                seller: { principal: string2principal(args.seller) },
                buyer: { principal: string2principal(args.buyer) },
                amount: string2bigint(args.amount),
            },
            sale_id: args.sale_id,
        },
    };
};

const parseSaleResult = (collection: string, result: ManageSaleResponse): NftIdentifier => {
    const key = unwrapVariantKey(result);
    if (key !== 'bid') throw new Error('bid ogy nft failed');
    const r = result['bid'] as BidResponse;
    const tx = r.txn_type;
    const type = unwrapVariantKey(tx);
    if (type !== 'sale_ended') throw new Error('bid ogy nft failed');
    return { collection, token_identifier: r.token_id };
};

export const bidNftByOgy = async (
    identity: ConnectedIdentity,
    collection: string,
    args: BidNftArg,
): Promise<NftIdentifier> => {
    const { creator } = identity;
    const actor: _SERVICE = await creator(idlFactory, collection);
    const result = await actor.sale_nft_origyn(parseSaleArg(args));
    console.error('bidNftByOgy', collection, args, result);
    const r = unwrapMotokoResultMap<ManageSaleResponse, OrigynError, ManageSaleResponse>(
        result,
        unchanging,
        throwsBy(`bid ogy nft failed`),
    );
    return parseSaleResult(collection, r);
};

// =========================== Batch Purchase OGY NFTs ===========================

export const batchBidNftByOgy = async (
    identity: ConnectedIdentity,
    collection: string,
    args: BidNftArg[],
): Promise<NftIdentifier[]> => {
    const { creator } = identity;
    const actor: _SERVICE = await creator(idlFactory, collection);
    const result = await actor.sale_batch_nft_origyn(args.map(parseSaleArg));
    console.error('batchBidNftByOgy', collection, args, result);
    return result
        .map((r, index) => {
            return unwrapMotokoResultMap<
                ManageSaleResponse,
                OrigynError,
                ManageSaleResponse | undefined
            >(r, unchanging, (e) => {
                console.error(`batchBidNftByOgy failed`, index, args[index], e);
                return undefined;
            });
        })
        .map((r, index) => {
            if (r === undefined) return undefined;
            try {
                return parseSaleResult(collection, r);
            } catch (e) {
                console.error(`batchBidNftByOgy failed`, index, args[index], e);
                return undefined;
            }
        })
        .filter((r) => r !== undefined) as NftIdentifier[];
};

// =========================== Query Active Tokens by OGY Collection ===========================

export const queryTokenActiveRecordsByOgy = async (
    identity: ConnectedIdentity,
    collection: string,
): Promise<OgyTokenActive> => {
    const { creator } = identity;
    const actor: _SERVICE = await creator(idlFactory, collection);
    const result = await actor.sale_info_nft_origyn({ active: [] });
    return unwrapMotokoResultMap<SaleInfoResponse, OrigynError, OgyTokenActive>(
        result,
        (d: SaleInfoResponse) => {
            const r = unwrapVariant<{
                eof: boolean;
                records: Array<[string, [] | [SaleStatusStable]]>;
                count: bigint;
            }>(d, 'active');
            if (r) return unwrapActiveRecords(r);
            throw new Error(`query active tokens failed`);
        },
        throwsBy(`query active tokens failed`),
    );
};

// =========================== Query All Token History Records by OGY Collection ===========================

export const queryTokenHistoryRecordsByOgy = async (
    identity: ConnectedIdentity,
    collection: string,
): Promise<OgyTokenHistory> => {
    const { creator } = identity;
    const actor: _SERVICE = await creator(idlFactory, collection);
    const result = await actor.sale_info_nft_origyn({ history: [] });
    return unwrapMotokoResultMap<SaleInfoResponse, OrigynError, OgyTokenHistory>(
        result,
        (d: SaleInfoResponse) => {
            const r = unwrapVariant<{
                eof: boolean;
                records: Array<[] | [SaleStatusStable]>;
                count: bigint;
            }>(d, 'history');
            if (r) return unwrapHistoryRecords(r);
            throw new Error(`query all tokens history failed`);
        },
        throwsBy(`query all tokens history failed`),
    );
};

export default {
    queryCollectionInfoByOgy,
    queryAllTokenOwnersByIdList,
    queryAllTokenOwnersByOgy,
    querySingleTokenOwnerByOgy,
    queryCollectionNftMinterByOgy,
    queryTokenListingByOgy,
    retrieveNftFromListingByOgy,
    listingByOgy,
    queryRechargeAccountByOgy,
    bidNftByOgy,
    batchBidNftByOgy,
    queryTokenActiveRecordsByOgy,
    queryTokenHistoryRecordsByOgy,
};
