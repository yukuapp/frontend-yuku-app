import { Principal } from '@dfinity/principal';
import _ from 'lodash';
import { customStringify } from '@/common/data/json';
import { canister_module_hash_and_time } from '@/common/ic/status';
import { bigint2string } from '@/common/types/bigint';
import { unwrapOption, unwrapOptionMap } from '@/common/types/options';
import { principal2string } from '@/common/types/principal';
import {
    unchanging,
    unwrapVariant2Map,
    unwrapVariant4Map,
    unwrapVariant5Map,
    unwrapVariant6Map,
    unwrapVariantKey,
} from '@/common/types/variant';
import { ConnectedIdentity } from '@/types/identity';
import { NftListing, NftListingData } from '@/types/listing';
import { NftIdentifier, NftTokenMetadata, NftTokenOwner, TokenInfo } from '@/types/nft';
import { OgyCandyValue_2f2a0ab9, OgyCandyValue_47a7c018 } from '@/types/nft-standard/ogy-candy';
import { CoreCollectionData } from '@/types/yuku';
import { NFT_OGY_BUTTERFLY } from '../special';
import {
    unwrapCandyValue_2f2a0ab9,
    unwrapCandyValue_47a7c018,
    unwrapCandyValue_243d1642,
} from './candy';
import module_2f2a0ab9 from './module_2f2a0ab9';
import { CollectionInfo as CollectionInfo_2f2a0ab9 } from './module_2f2a0ab9/ogy_2f2a0ab9.did.d';
import module_47a7c018 from './module_47a7c018';
import {
    AuctionConfig as AuctionConfig_47a7c018,
    AuctionStateShared as AuctionStateShared_47a7c018,
    CollectionInfo as CollectionInfo_47a7c018,
    ICTokenSpec as ICTokenSpec_47a7c018,
} from './module_47a7c018/ogy_47a7c018.did.d';
import module_243d1642 from './module_243d1642';
import { CollectionInfo as CollectionInfo_243d1642 } from './module_243d1642/ogy_243d1642.did.d';
import { AuctionStateShared as AuctionStateStable_243d1642 } from './module_243d1642/ogy_243d1642.did.d';
import module_568a07bb from './module_568a07bb';
import module_9293bd34 from './module_9293bd34';
import module_b99da57c from './module_b99da57c';
import module_be8972b0 from './module_be8972b0';
import {
    AuctionConfig as AuctionConfig_be8972b0,
    AuctionStateStable as AuctionStateStable_be8972b0,
    CollectionInfo as CollectionInfo_be8972b0,
    ICTokenSpec as ICTokenSpec_be8972b0,
} from './module_be8972b0/ogy_be8972b0.did.d';
import module_db6f76c6 from './module_db6f76c6';
import {
    AuctionConfig as AuctionConfig_db6f76c6,
    AuctionStateStable as AuctionStateStable_db6f76c6,
    DutchStateStable as DutchStateStable_db6f76c6,
    ICTokenSpec as ICTokenSpec_db6f76c6,
    NiftyStateStable as NiftyStateStable_db6f76c6,
} from './module_db6f76c6/ogy_db6f76c6.did.d';

const MAPPING_MODULES = {
    ['db6f76c6af70df9e0a0ff7d2e42fc98e4ae1613b288cac8e4b923ec5bb3f256f']: module_db6f76c6,
    ['be8972b0c80cfb53461767e93b5156eec9a5bce39c4b00847a56041edee1df18']: module_be8972b0,
    ['b99da57c816845e912e5a89ab93922db7a2875afdf1d3c60e7d63aa5833ee4b1']: module_b99da57c,
    ['2f2a0ab9f5d2f78e6aee2bb2c704be6b18e8cdfc1869bbb7ca56bd18598ccaa7']: module_2f2a0ab9,
    ['568a07bba024f17fc2c71ba912218dbc7de7662eaa6742c312618b454e2b4e05']: module_568a07bb,
    ['9293bd3455eceb221f9968ff5ecb0dda8556b9209aa8a0c9963a5a63aa994f8c']: module_9293bd34,
    ['47a7c018dffb00a609c2ab0caffb909335756f82253f6510f5de07affc312e55']: module_47a7c018,
    ['243d164214b17363967d52697b1685531b2ab3960b72c89655e353c608fc0545']: module_243d1642,
};

const MAPPING_CANISTERS: Record<
    string,
    | 'db6f76c6af70df9e0a0ff7d2e42fc98e4ae1613b288cac8e4b923ec5bb3f256f'
    | 'be8972b0c80cfb53461767e93b5156eec9a5bce39c4b00847a56041edee1df18'
    | 'b99da57c816845e912e5a89ab93922db7a2875afdf1d3c60e7d63aa5833ee4b1'
    | '2f2a0ab9f5d2f78e6aee2bb2c704be6b18e8cdfc1869bbb7ca56bd18598ccaa7'
    | '568a07bba024f17fc2c71ba912218dbc7de7662eaa6742c312618b454e2b4e05'
    | '9293bd3455eceb221f9968ff5ecb0dda8556b9209aa8a0c9963a5a63aa994f8c'
    | '47a7c018dffb00a609c2ab0caffb909335756f82253f6510f5de07affc312e55'
    | '243d164214b17363967d52697b1685531b2ab3960b72c89655e353c608fc0545'
> = {
    // OGY
    // ! Production environment
    ['j2zek-uqaaa-aaaal-acoxa-cai']:
        'db6f76c6af70df9e0a0ff7d2e42fc98e4ae1613b288cac8e4b923ec5bb3f256f',
    // ! Production environment
    ['s5eo5-gqaaa-aaaag-qa3za-cai']:
        'be8972b0c80cfb53461767e93b5156eec9a5bce39c4b00847a56041edee1df18',
    // ? Test environment
    ['2l7gd-5aaaa-aaaak-qcfvq-cai']:
        'b99da57c816845e912e5a89ab93922db7a2875afdf1d3c60e7d63aa5833ee4b1',
    // origyn art
    // ! Production environment level 1
    ['2htsr-ziaaa-aaaaj-azrkq-cai']:
        '2f2a0ab9f5d2f78e6aee2bb2c704be6b18e8cdfc1869bbb7ca56bd18598ccaa7',
    // ! Production environment level 2
    ['2oqzn-paaaa-aaaaj-azrla-cai']:
        '2f2a0ab9f5d2f78e6aee2bb2c704be6b18e8cdfc1869bbb7ca56bd18598ccaa7',
    // * Pre-production environment level 1
    ['3d65d-aiaaa-aaaaj-azrmq-cai']:
        '568a07bba024f17fc2c71ba912218dbc7de7662eaa6742c312618b454e2b4e05',
    // * Pre-production environment level 2
    ['3e73x-nqaaa-aaaaj-azrma-cai']:
        '9293bd3455eceb221f9968ff5ecb0dda8556b9209aa8a0c9963a5a63aa994f8c',
    // ? Test environment level 1
    ['zkpdr-hqaaa-aaaak-ac4lq-cai']:
        '9293bd3455eceb221f9968ff5ecb0dda8556b9209aa8a0c9963a5a63aa994f8c',
    // ? Test environment level 2
    ['lcaww-uyaaa-aaaag-aaylq-cai']:
        '9293bd3455eceb221f9968ff5ecb0dda8556b9209aa8a0c9963a5a63aa994f8c',
    // gold
    // ! Production environment
    ['io7gn-vyaaa-aaaak-qcbiq-cai']:
        '243d164214b17363967d52697b1685531b2ab3960b72c89655e353c608fc0545',
    // ! Production environment
    ['sy3ra-iqaaa-aaaao-aixda-cai']:
        '243d164214b17363967d52697b1685531b2ab3960b72c89655e353c608fc0545',
    // ! Production environment
    ['zhfjc-liaaa-aaaal-acgja-cai']:
        '243d164214b17363967d52697b1685531b2ab3960b72c89655e353c608fc0545',
    // ! Production environment
    ['7i7jl-6qaaa-aaaam-abjma-cai']:
        '243d164214b17363967d52697b1685531b2ab3960b72c89655e353c608fc0545',
    // * Pre-production environment and test environment are the same
    ['himny-aiaaa-aaaak-aepca-cai']:
        '47a7c018dffb00a609c2ab0caffb909335756f82253f6510f5de07affc312e55',
    // * Pre-production environment and test environment are the same
    ['yf3vu-uqaaa-aaaam-abfra-cai']:
        'db6f76c6af70df9e0a0ff7d2e42fc98e4ae1613b288cac8e4b923ec5bb3f256f',
    // "cc09947456a344bd3c8f6a56b3e06bbfd754668d3e6246c00f2b6aa5c8e089a4" // This canister has upgraded code
};

// Check if the module of each canister has changed and notify if it has
export const checkOgyCanisterModule = async () => {
    for (const canister_id of _.uniq(NFT_OGY_BUTTERFLY)) {
        const r = await canister_module_hash_and_time(canister_id, import.meta.env.CONNECT_HOST);
        const current = MAPPING_CANISTERS[canister_id];
        if (r.module_hash !== current) {
            console.error(
                'OGY canister module is changed',
                canister_id,
                current,
                '->',
                r.module_hash,
            );
        }
    }
};

// Runtime check, throw an error if the corresponding module is not implemented
for (const key of Object.keys(MAPPING_CANISTERS)) {
    const module = MAPPING_CANISTERS[key];
    if (!MAPPING_MODULES[module]) {
        console.error('OGY canister is not implemented', key, module);
    }
}

const getModule = (collection: string) => {
    const module_hex = MAPPING_CANISTERS[collection];
    if (module_hex === undefined) throw new Error(`unknown ogy canister id: ${collection}`);
    const module = MAPPING_MODULES[module_hex];
    if (module === undefined) throw new Error(`unknown ogy canister id: ${collection}`);
    return module;
};

// =========================== Query OGY Collection Information ===========================

export type OgyCollectionInfo_2f2a0ab9<T> = {
    name?: string;
    logo?: string;
    symbol?: string;
    network?: string; // ? principal -> string
    metadata?: T;
    fields?: [
        string,
        string | undefined, // ? bigint -> string
        string | undefined, // ? bigint -> string
    ][];

    created_at?: string; // ? bigint -> string
    upgraded_at?: string; // ? bigint -> string

    owner?: string; // ? principal -> string
    managers?: string[]; // ? principal -> string

    total_supply?: string; // ? bigint -> string
    token_ids?: string[];
    token_ids_count?: string; // ? bigint -> string

    unique_holders?: string; // ? bigint -> string
    transaction_count?: string; // ? bigint -> string

    allocated_storage?: string; // ? bigint -> string
    available_space?: string; // ? bigint -> string

    multi_canister?: string[]; // ? principal -> string
    multi_canister_count?: string; // ? bigint -> string
};

export const parseOgyCollectionInfo_2f2a0ab9 = (
    info: CollectionInfo_2f2a0ab9,
): OgyCollectionInfo_2f2a0ab9<OgyCandyValue_2f2a0ab9> => {
    return {
        name: unwrapOption(info.name),
        logo: unwrapOption(info.logo),
        symbol: unwrapOption(info.symbol),
        network: unwrapOptionMap(info.network, principal2string),
        metadata: unwrapOptionMap(info.metadata, (metadata) => unwrapCandyValue_2f2a0ab9(metadata)),
        fields: unwrapOptionMap(info.fields, (fields) =>
            fields.map((f) => [
                f[0],
                unwrapOptionMap(f[1], bigint2string),
                unwrapOptionMap(f[1], bigint2string),
            ]),
        ),

        created_at: unwrapOptionMap(info.created_at, bigint2string),
        upgraded_at: unwrapOptionMap(info.upgraded_at, bigint2string),

        owner: unwrapOptionMap(info.owner, principal2string),
        managers: unwrapOptionMap(info.multi_canister, (s) => s.map(principal2string)),

        total_supply: unwrapOptionMap(info.total_supply, bigint2string),
        token_ids: unwrapOption(info.token_ids),
        token_ids_count: unwrapOptionMap(info.token_ids_count, bigint2string),

        unique_holders: unwrapOptionMap(info.unique_holders, bigint2string),
        transaction_count: unwrapOptionMap(info.transaction_count, bigint2string),

        allocated_storage: unwrapOptionMap(info.allocated_storage, bigint2string),
        available_space: unwrapOptionMap(info.available_space, bigint2string),

        multi_canister: unwrapOptionMap(info.multi_canister, (s) => s.map(principal2string)),
        multi_canister_count: unwrapOptionMap(info.multi_canister_count, bigint2string),
    };
};

export const parseOgyCollectionInfo_47a7c018 = (
    info: CollectionInfo_47a7c018,
): OgyCollectionInfo_2f2a0ab9<OgyCandyValue_47a7c018> => {
    return {
        name: unwrapOption(info.name),
        logo: unwrapOption(info.logo),
        symbol: unwrapOption(info.symbol),
        network: unwrapOptionMap(info.network, principal2string),
        metadata: unwrapOptionMap(info.metadata, (metadata) => unwrapCandyValue_47a7c018(metadata)),
        fields: unwrapOptionMap(info.fields, (fields) =>
            fields.map((f) => [
                f[0],
                unwrapOptionMap(f[1], bigint2string),
                unwrapOptionMap(f[1], bigint2string),
            ]),
        ),

        created_at: unwrapOptionMap(info.created_at, bigint2string),
        upgraded_at: unwrapOptionMap(info.upgraded_at, bigint2string),

        owner: unwrapOptionMap(info.owner, principal2string),
        managers: unwrapOptionMap(info.multi_canister, (s) => s.map(principal2string)),

        total_supply: unwrapOptionMap(info.total_supply, bigint2string),
        token_ids: unwrapOption(info.token_ids),
        token_ids_count: unwrapOptionMap(info.token_ids_count, bigint2string),

        unique_holders: unwrapOptionMap(info.unique_holders, bigint2string),
        transaction_count: unwrapOptionMap(info.transaction_count, bigint2string),

        allocated_storage: unwrapOptionMap(info.allocated_storage, bigint2string),
        available_space: unwrapOptionMap(info.available_space, bigint2string),

        multi_canister: unwrapOptionMap(info.multi_canister, (s) => s.map(principal2string)),
        multi_canister_count: unwrapOptionMap(info.multi_canister_count, bigint2string),
    };
};

export const parseOgyCollectionInfo_243d1642 = (
    info: CollectionInfo_243d1642,
): OgyCollectionInfo_2f2a0ab9<OgyCandyValue_47a7c018> => {
    return {
        name: unwrapOption(info.name),
        logo: unwrapOption(info.logo),
        symbol: unwrapOption(info.symbol),
        network: unwrapOptionMap(info.network, principal2string),
        metadata: unwrapOptionMap(info.metadata, (metadata) => unwrapCandyValue_243d1642(metadata)),
        fields: unwrapOptionMap(info.fields, (fields) =>
            fields.map((f) => [
                f[0],
                unwrapOptionMap(f[1], bigint2string),
                unwrapOptionMap(f[1], bigint2string),
            ]),
        ),

        created_at: unwrapOptionMap(info.created_at, bigint2string),
        upgraded_at: unwrapOptionMap(info.upgraded_at, bigint2string),

        owner: unwrapOptionMap(info.owner, principal2string),
        managers: unwrapOptionMap(info.multi_canister, (s) => s.map(principal2string)),

        total_supply: unwrapOptionMap(info.total_supply, bigint2string),
        token_ids: unwrapOption(info.token_ids),
        token_ids_count: unwrapOptionMap(info.token_ids_count, bigint2string),

        unique_holders: unwrapOptionMap(info.unique_holders, bigint2string),
        transaction_count: unwrapOptionMap(info.transaction_count, bigint2string),

        allocated_storage: unwrapOptionMap(info.allocated_storage, bigint2string),
        available_space: unwrapOptionMap(info.available_space, bigint2string),

        multi_canister: unwrapOptionMap(info.multi_canister, (s) => s.map(principal2string)),
        multi_canister_count: unwrapOptionMap(info.multi_canister_count, bigint2string),
    };
};

export type OgyCollectionInfo_be8972b0<T> = {
    name?: string;
    logo?: string;
    symbol?: string;
    network?: string; // ? principal -> string
    metadata?: T;
    fields?: [
        string,
        string | undefined, // ? bigint -> string
        string | undefined, // ? bigint -> string
    ][];

    owner?: string; // ? principal -> string
    managers?: string[]; // ? principal -> string

    total_supply?: string; // ? bigint -> string
    token_ids?: string[];
    token_ids_count?: string; // ? bigint -> string

    allocated_storage?: string; // ? bigint -> string
    available_space?: string; // ? bigint -> string

    multi_canister?: string[]; // ? principal -> string
    multi_canister_count?: string; // ? bigint -> string
};

export const parseOgyCollectionInfo_be8972b0 = (
    info: CollectionInfo_be8972b0,
): OgyCollectionInfo_be8972b0<OgyCandyValue_2f2a0ab9> => {
    return {
        name: unwrapOption(info.name),
        logo: unwrapOption(info.logo),
        symbol: unwrapOption(info.symbol),
        network: unwrapOptionMap(info.network, principal2string),
        metadata: unwrapOptionMap(info.metadata, (metadata) => unwrapCandyValue_2f2a0ab9(metadata)),
        fields: unwrapOptionMap(info.fields, (fields) =>
            fields.map((f) => [
                f[0],
                unwrapOptionMap(f[1], bigint2string),
                unwrapOptionMap(f[1], bigint2string),
            ]),
        ),

        owner: unwrapOptionMap(info.owner, principal2string),
        managers: unwrapOptionMap(info.multi_canister, (s) => s.map(principal2string)),

        total_supply: unwrapOptionMap(info.total_supply, bigint2string),
        token_ids: unwrapOption(info.token_ids),
        token_ids_count: unwrapOptionMap(info.token_ids_count, bigint2string),

        allocated_storage: unwrapOptionMap(info.allocated_storage, bigint2string),
        available_space: unwrapOptionMap(info.available_space, bigint2string),

        multi_canister: unwrapOptionMap(info.multi_canister, (s) => s.map(principal2string)),
        multi_canister_count: unwrapOptionMap(info.multi_canister_count, bigint2string),
    };
};

export const queryCollectionInfoByOgy = async (
    identity: ConnectedIdentity,
    collection: string,
): Promise<
    | OgyCollectionInfo_2f2a0ab9<OgyCandyValue_2f2a0ab9>
    | OgyCollectionInfo_2f2a0ab9<OgyCandyValue_47a7c018>
    | OgyCollectionInfo_be8972b0<OgyCandyValue_2f2a0ab9>
> => {
    const module = getModule(collection);
    return module.queryCollectionInfoByOgy(identity, collection);
};

// =========================== Query all token owners of OGY standard ===========================

export const queryAllTokenOwnersByIdList = async (
    identity: ConnectedIdentity,
    collection: string,
    id_list: string[] | undefined,
): Promise<NftTokenOwner[]> => {
    const module = getModule(collection);
    return module.queryAllTokenOwnersByIdList(identity, collection, id_list);
};

// =========================== Query all token owners of OGY standard ===========================

export const queryAllTokenOwnersByOgy = async (
    identity: ConnectedIdentity,
    collection: string,
): Promise<NftTokenOwner[]> => {
    const module = getModule(collection);
    return module.queryAllTokenOwnersByOgy(identity, collection);
};

// =========================== Query all token metadata of OGY standard ===========================

export const queryAllTokenMetadataByOgy = async (
    collection: string,
    token_owners: NftTokenOwner[],
    _collection_data?: CoreCollectionData,
): Promise<NftTokenMetadata[]> => {
    // Direct concatenation
    return token_owners.map((token) => {
        return {
            token_id: {
                collection,
                token_identifier: token.token_id.token_identifier,
            },
            metadata: {
                name: token.token_id.token_identifier,
                mimeType: '',
                url: `https://prptl.io/-/${collection}/-/${token.token_id.token_identifier}`,
                thumb: `https://prptl.io/-/${collection}/-/${token.token_id.token_identifier}/preview`,
                description: '',
                traits: [],
                onChainUrl: `https://prptl.io/-/${collection}/-/${token.token_id.token_identifier}`,
                yuku_traits: [],
            },
            raw: { ...token.raw, data: customStringify(token.raw.data) },
        };
    });
};

// =========================== Query specified token metadata for OGY standard ===========================

export const querySingleTokenMetadataByOgy = async (
    collection: string,
    token_identifier: string,
    _collection_data?: CoreCollectionData,
): Promise<NftTokenMetadata> => {
    // Direct concatenation
    return {
        token_id: {
            collection,
            token_identifier,
        },
        metadata: {
            name: token_identifier,
            mimeType: '',
            url: `https://prptl.io/-/${collection}/-/${token_identifier}`,
            thumb: `https://prptl.io/-/${collection}/-/${token_identifier}/preview`,
            description: '',
            traits: [],
            onChainUrl: `https://prptl.io/-/${collection}/-/${token_identifier}`,
            yuku_traits: [],
        },
        raw: {
            standard: 'ogy',
            data: customStringify({ token_id: token_identifier }),
        },
    };
};

// =========================== Query owner of specified NFT for OGY standard ===========================

export const querySingleTokenOwnerByOgy = async (
    identity: ConnectedIdentity,
    collection: string,
    token_identifier: string,
): Promise<string> => {
    const module = getModule(collection);
    return module.querySingleTokenOwnerByOgy(identity, collection, token_identifier);
};

// =========================== Remove NFT from listing for OGY standard ===========================

export const retrieveNftFromListingByOgy = async (
    identity: ConnectedIdentity,
    collection: string,
    token_identifier: string,
): Promise<boolean> => {
    const module = getModule(collection);
    return module.retrieveNftFromListingByOgy(identity, collection, token_identifier);
};

// =========================== List NFT for OGY standard ===========================

export const listingByOgy = async (
    identity: ConnectedIdentity,
    collection: string,
    args: {
        broker_id?: string; // Broker ID
        token_identifier: string;
        token: TokenInfo; // Token information
        price: string; // Price multiplied by unit precision
        allow_list?: string[]; // Whitelist for repurchase
    },
): Promise<boolean> => {
    const module = getModule(collection);
    return module.listingByOgy(identity, collection, args);
};

// =========================== Query listing information of specified NFT for OGY standard ===========================

export const parseOgyNiftyToNftListing_db6f76c6 = (
    _nifty: NiftyStateStable_db6f76c6,
): NftListing => {
    // TODO Unknown
    // console.error(`nifty type is not supported`);
    // return { type: 'holding' };
    throw new Error('nifty type is not supported');
};
export const parseOgyAuctionToNftListing_db6f76c6 = (
    sale_id: string,
    auction: AuctionStateStable_db6f76c6,
    yuku_ogy_broker: string,
): NftListing => {
    // Convert to fixed price sale
    const status = unwrapVariantKey(auction.status);
    if (['closed', 'not_started'].includes(status)) return { type: 'holding' };
    const winner = unwrapOption(auction.winner);
    if (winner !== undefined) return { type: 'holding' };

    // Check broker, if not yuku, it is not listed
    const broker = unwrapOptionMap(auction.current_broker_id, principal2string);
    if (broker !== yuku_ogy_broker) return { type: 'holding' }; // Broker is not yuku, not listed

    // Read buy now and token directly
    // Error handling
    const throwError = (config_key: string) => {
        throw new Error(`module_db6f76c6 config type is not supported: ${config_key}`);
    };
    const config_auction = unwrapVariant6Map<
        any,
        any,
        any,
        any,
        AuctionConfig_db6f76c6,
        any,
        AuctionConfig_db6f76c6
    >(
        auction.config,
        ['flat', () => throwError('flat')],
        ['extensible', () => throwError('extensible')],
        ['instant', () => throwError('instant')],
        ['nifty', () => throwError('nifty')],
        ['auction', unchanging],
        ['dutch', () => throwError('dutch')],
    );
    const time = bigint2string(config_auction.start_date);
    // Token information specified by the seller
    const token = unwrapVariant2Map<ICTokenSpec_db6f76c6, any, TokenInfo>(
        config_auction.token,
        [
            'ic',
            (token: ICTokenSpec_db6f76c6) => {
                const token_info: TokenInfo = {
                    id: unwrapOptionMap(token.id, bigint2string),
                    symbol: token.symbol,
                    canister: principal2string(token.canister),
                    standard: (() => {
                        const key = unwrapVariantKey(token.standard);
                        switch (key) {
                            case 'Ledger':
                            case 'ICRC1':
                            case 'DIP20':
                            case 'EXTFungible':
                                return { type: key };
                            case 'Other':
                                return {
                                    type: 'Other',
                                    raw: customStringify(token.standard['Other']),
                                };
                        }
                        throw new Error(`module_db6f76c6 unknown token standard: ${key}`);
                    })(),
                    decimals: bigint2string(token.decimals),
                    fee: unwrapOptionMap(token.fee, bigint2string),
                };
                return token_info;
            },
        ],
        [
            'extensible',
            () => {
                throw new Error(`module_db6f76c6 token type is not supported: extensible`);
            },
        ],
    );
    // Sale price // bigint -> string
    const price = unwrapOptionMap(config_auction.buy_now, bigint2string);
    if (price === undefined) return { type: 'holding' }; // Broker is not yuku, not listed
    return {
        type: 'listing',
        time,
        token,
        price,
        raw: {
            type: 'ogy',
            sale_id,
            raw: customStringify(auction),
        },
    };
};
export const parseOgyAuctionToNftListing_243d1642 = (
    sale_id: string,
    auction: AuctionStateStable_243d1642,
    yuku_ogy_broker: string,
): NftListing => {
    // Convert to fixed price sale
    const status = unwrapVariantKey(auction.status);
    if (['closed', 'not_started'].includes(status)) return { type: 'holding' };
    const winner = unwrapOption(auction.winner);
    if (winner !== undefined) return { type: 'holding' };

    // Check broker, if not yuku, it is not listed
    const broker = unwrapOptionMap(auction.current_broker_id, principal2string);
    if (broker !== yuku_ogy_broker) return { type: 'holding' }; // Broker is not yuku, not listed

    // Read buy now and token directly
    // Error handling
    const throwError = (config_key: string) => {
        throw new Error(`module_db6f76c6 config type is not supported: ${config_key}`);
    };
    const config_auction = unwrapVariant6Map<
        any,
        any,
        any,
        any,
        AuctionConfig_db6f76c6,
        any,
        AuctionConfig_db6f76c6
    >(
        auction.config,
        ['flat', () => throwError('flat')],
        ['extensible', () => throwError('extensible')],
        ['instant', () => throwError('instant')],
        ['nifty', () => throwError('nifty')],
        ['auction', unchanging],
        ['dutch', () => throwError('dutch')],
    );
    const time = bigint2string(config_auction.start_date);
    // Token information specified by the seller
    const token = unwrapVariant2Map<ICTokenSpec_db6f76c6, any, TokenInfo>(
        config_auction.token,
        [
            'ic',
            (token: ICTokenSpec_db6f76c6) => {
                const token_info: TokenInfo = {
                    id: unwrapOptionMap(token.id, bigint2string),
                    symbol: token.symbol,
                    canister: principal2string(token.canister),
                    standard: (() => {
                        const key = unwrapVariantKey(token.standard);
                        switch (key) {
                            case 'Ledger':
                            case 'ICRC1':
                            case 'DIP20':
                            case 'EXTFungible':
                                return { type: key };
                            case 'Other':
                                return {
                                    type: 'Other',
                                    raw: customStringify(token.standard['Other']),
                                };
                        }
                        throw new Error(`module_db6f76c6 unknown token standard: ${key}`);
                    })(),
                    decimals: bigint2string(token.decimals),
                    fee: unwrapOptionMap(token.fee, bigint2string),
                };
                return token_info;
            },
        ],
        [
            'extensible',
            () => {
                throw new Error(`module_db6f76c6 token type is not supported: extensible`);
            },
        ],
    );
    // Sale price // bigint -> string
    const price = unwrapOptionMap(config_auction.buy_now, bigint2string);
    if (price === undefined) return { type: 'holding' }; // Broker is not yuku, not listed
    return {
        type: 'listing',
        time,
        token,
        price,
        raw: {
            type: 'ogy',
            sale_id,
            raw: customStringify(auction),
        },
    };
};
export const parseOgyDutchAuctionToNftListing_db6f76c6 = (
    _dutch: DutchStateStable_db6f76c6,
): NftListing => {
    // console.error(`dutch type is not supported`);
    // return { type: 'holding' };
    // TODO Convert to Dutch auction
    throw new Error('dutch type is not supported');
};

export const parseOgyAuctionToNftListing_be8972b0 = (
    sale_id: string,
    auction: AuctionStateStable_be8972b0,
    yuku_ogy_broker: string,
): NftListing => {
    // Convert to fixed price sale
    const status = unwrapVariantKey(auction.status);
    if (['closed', 'not_started'].includes(status)) return { type: 'holding' };
    const winner = unwrapOption(auction.winner);
    if (winner !== undefined) return { type: 'holding' };

    // Check broker, if not yuku, it is not listed
    const broker = unwrapOptionMap(auction.current_broker_id, principal2string);
    if (broker !== yuku_ogy_broker) return { type: 'holding' }; // Broker is not yuku, not listed

    // Read buy now and token directly
    // Error handling
    const throwError = (config_key: string) => {
        throw new Error(`module_be8972b0 config type is not supported: ${config_key}`);
    };
    const config_auction = unwrapVariant5Map<
        any,
        any,
        any,
        AuctionConfig_be8972b0,
        any,
        AuctionConfig_be8972b0
    >(
        auction.config,
        ['flat', () => throwError('flat')],
        ['extensible', () => throwError('extensible')],
        ['instant', () => throwError('instant')],
        ['auction', unchanging],
        ['dutch', () => throwError('dutch')],
    );
    const time = bigint2string(config_auction.start_date);
    // Token information specified by the seller
    const token = unwrapVariant2Map<ICTokenSpec_be8972b0, any, TokenInfo>(
        config_auction.token,
        [
            'ic',
            (token: ICTokenSpec_be8972b0) => {
                const token_info: TokenInfo = {
                    symbol: token.symbol,
                    canister: principal2string(token.canister),
                    standard: (() => {
                        const key = unwrapVariantKey(token.standard);
                        switch (key) {
                            case 'Ledger':
                            case 'ICRC1':
                            case 'DIP20':
                            case 'EXTFungible':
                                return { type: key };
                        }
                        throw new Error(`module_be8972b0 unknown token standard: ${key}`);
                    })(),
                    decimals: bigint2string(token.decimals),
                    fee: bigint2string(token.fee),
                };
                return token_info;
            },
        ],
        [
            'extensible',
            () => {
                throw new Error(`module_be8972b0 token type is not supported: extensible`);
            },
        ],
    );
    // Sale price // bigint -> string
    const price = unwrapOptionMap(config_auction.buy_now, bigint2string);
    if (price === undefined) return { type: 'holding' }; // Broker is not yuku, not listed
    return {
        type: 'listing',
        time,
        token,
        price,
        raw: {
            type: 'ogy',
            sale_id,
            raw: customStringify(auction),
        },
    };
};

export const parseOgyAuctionToNftListing_47a7c018 = (
    sale_id: string,
    auction: AuctionStateShared_47a7c018,
    yuku_ogy_broker: string,
): NftListing => {
    // Convert to fixed price sale
    const status = unwrapVariantKey(auction.status);
    if (['closed', 'not_started'].includes(status)) return { type: 'holding' };
    const winner = unwrapOption(auction.winner);
    if (winner !== undefined) return { type: 'holding' };

    // Check the broker, if it's not yuku, it's not listed
    const broker = unwrapOptionMap(auction.current_broker_id, principal2string);
    if (broker !== yuku_ogy_broker) return { type: 'holding' };

    // Read the buy now and token directly
    // Error handling
    const throwError = (config_key: string) => {
        throw new Error(`module_47a7c018 config type is not supported: ${config_key}`);
    };
    const config_auction = unwrapVariant4Map<
        any,
        any,
        any,
        AuctionConfig_47a7c018,
        AuctionConfig_47a7c018
    >(
        auction.config,
        ['ask', () => throwError('ask')],
        ['extensible', () => throwError('extensible')],
        ['instant', () => throwError('instant')],
        ['auction', unchanging],
    );
    const time = bigint2string(config_auction.start_date);
    // Token information specified by the seller
    const token = unwrapVariant2Map<ICTokenSpec_47a7c018, any, TokenInfo>(
        config_auction.token,
        [
            'ic',
            (token: ICTokenSpec_47a7c018) => {
                const token_info: TokenInfo = {
                    id: unwrapOptionMap(token.id, bigint2string),
                    symbol: token.symbol,
                    canister: principal2string(token.canister),
                    standard: (() => {
                        const key = unwrapVariantKey(token.standard);
                        switch (key) {
                            case 'Ledger':
                            case 'ICRC1':
                            case 'DIP20':
                            case 'EXTFungible':
                                return { type: key };
                            case 'Other':
                                return {
                                    type: 'Other',
                                    raw: customStringify(token.standard['Other']),
                                };
                        }
                        throw new Error(`module_47a7c018 unknown token standard: ${key}`);
                    })(),
                    decimals: bigint2string(token.decimals),
                    fee: unwrapOptionMap(token.fee, bigint2string),
                };
                return token_info;
            },
        ],
        [
            'extensible',
            () => {
                throw new Error(`module_47a7c018 token type is not supported: extensible`);
            },
        ],
    );
    // Sale price // bigint -> string
    const price = unwrapOptionMap(config_auction.buy_now, bigint2string);
    if (price === undefined) return { type: 'holding' };
    return {
        type: 'listing',
        time,
        token,
        price,
        raw: {
            type: 'ogy',
            sale_id,
            raw: customStringify(auction),
        },
    };
};

export const queryTokenListingByOgy = async (
    identity: ConnectedIdentity,
    collection: string,
    token_id_list: NftIdentifier[],
    yuku_ogy_broker: string,
): Promise<NftListingData[]> => {
    const module = getModule(collection);
    return module.queryTokenListingByOgy(identity, collection, token_id_list, yuku_ogy_broker);
};

// =========================== OGY Query Recharge Account ===========================

export const queryRechargeAccountByOgy = async (
    identity: ConnectedIdentity,
    collection: string,
    principal: string, // Who wants to purchase
): Promise<string> => {
    const module = getModule(collection);
    return module.queryRechargeAccountByOgy(identity, collection, principal);
};

// =========================== OGY Purchase ===========================

export type BidNftArg = {
    sale_id: string;
    broker_id?: string; // Broker's id
    token_identifier: string;
    seller: string; // principal -> string
    buyer: string; // principal -> string
    token: TokenInfo; // Set token information
    amount: string; // Amount of tokens used
};

export const bidNftByOgy = async (
    identity: ConnectedIdentity,
    collection: string,
    args: BidNftArg,
): Promise<NftIdentifier> => {
    const module = getModule(collection);
    return module.bidNftByOgy(identity, collection, args);
};

// =========================== OGY Batch Purchase ===========================

export const batchBidNftByOgy = async (
    identity: ConnectedIdentity,
    collection: string,
    args: BidNftArg[],
): Promise<NftIdentifier[]> => {
    const module = getModule(collection);
    return module.batchBidNftByOgy(identity, collection, args);
};

// =========================== OGY Query Active Tokens ===========================

interface SaleStatusStable {
    token_id: string;
    sale_type: any; // Too many types, unified as string
    broker_id: [] | [Principal];
    original_broker_id: [] | [Principal];
    sale_id: string;
}
export type OgyTokenSale = {
    token_id: string;
    sale_type: string; // auction | nifty | dutch // Textualized
    broker_id?: string; // ? principal -> string
    original_broker_id?: string; // ? principal -> string
    sale_id: string;
};
type OgyTokenStatus =
    | {
          name: 'unminted'; // Not sure what it means, content is empty
          sale?: undefined;
      }
    | {
          name: string;
          sale?: OgyTokenSale;
      };

export type OgyTokenActive = {
    eof: boolean;
    count: string; // ? bigint -> string
    records: OgyTokenStatus[];
};

export const unwrapActiveRecords = (active: {
    eof: boolean;
    records: Array<[string, [] | [SaleStatusStable]]>;
    count: bigint;
}): OgyTokenActive => {
    return {
        eof: active.eof,
        count: bigint2string(active.count),
        records: active.records.map((item) => ({
            name: item[0],
            sale: unwrapOptionMap(item[1], (stable) => {
                return {
                    token_id: stable.token_id,
                    sale_type: customStringify(stable.sale_type),
                    broker_id: unwrapOptionMap(stable.broker_id, principal2string),
                    original_broker_id: unwrapOptionMap(
                        stable.original_broker_id,
                        principal2string,
                    ),
                    sale_id: stable.sale_id,
                };
            }),
        })),
    };
};

export const queryTokenActiveRecordsByOgy = async (
    identity: ConnectedIdentity,
    collection: string,
): Promise<OgyTokenActive> => {
    const module = getModule(collection);
    return module.queryTokenActiveRecordsByOgy(identity, collection);
};

// =========================== OGY Query Historical Records ===========================

export type OgyTokenHistory = {
    eof: boolean;
    count: string; // ? bigint -> string
    records: OgyTokenSale[];
};

export const unwrapHistoryRecords = (active: {
    eof: boolean;
    records: Array<[] | [SaleStatusStable]>;
    count: bigint;
}): OgyTokenHistory => {
    return {
        eof: active.eof,
        count: bigint2string(active.count),
        records: active.records
            .map((item) =>
                unwrapOptionMap(item, (stable) => {
                    return {
                        token_id: stable.token_id,
                        sale_type: customStringify(stable.sale_type),
                        broker_id: unwrapOptionMap(stable.broker_id, principal2string),
                        original_broker_id: unwrapOptionMap(
                            stable.original_broker_id,
                            principal2string,
                        ),
                        sale_id: stable.sale_id,
                    };
                }),
            )
            .filter((item) => item) as OgyTokenSale[],
    };
};

export const queryTokenHistoryRecordsByOgy = async (
    identity: ConnectedIdentity,
    collection: string,
): Promise<OgyTokenHistory> => {
    const module = getModule(collection);
    return module.queryTokenHistoryRecordsByOgy(identity, collection);
};

// =========================== OGY Standard Get Minter ===========================

export const queryCollectionNftMinterByOgy = async (
    identity: ConnectedIdentity,
    collection: string,
    token_identifier: string,
): Promise<string> => {
    const module = getModule(collection);
    return module.queryCollectionNftMinterByOgy(identity, collection, token_identifier);
};
