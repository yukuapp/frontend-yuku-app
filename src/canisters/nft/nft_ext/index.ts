import _ from 'lodash';
import { array2string } from '@/common/data/arrays';
import { principal2account } from '@/common/ic/account';
import { parse_token_identifier, parse_token_index_with_checking } from '@/common/nft/ext';
import { isSameNftByTokenId } from '@/common/nft/identifier';
import { execute_and_join } from '@/common/tasks';
import { bigint2string } from '@/common/types/bigint';
import { unwrapOption, wrapOption } from '@/common/types/options';
import { principal2string, string2principal } from '@/common/types/principal';
import {
    parseMotokoResult,
    unwrapMotokoResult,
    unwrapMotokoResultMap,
} from '@/common/types/results';
import {
    mapping_false,
    throwsBy,
    throwsVariantError,
    unwrapVariant2Map,
} from '@/common/types/variant';
import { ConnectedIdentity } from '@/types/identity';
import {
    NftMetadataTrait,
    NftTokenMetadata,
    NftTokenOwner,
    NftTokenScore,
    SupportedNftStandard,
} from '@/types/nft';
import { CccProxyNft } from '@/types/nft-standard/ccc';
import { ExtUser, NftTokenOwnerMetadataExt } from '@/types/nft-standard/ext';
import { CoreCollectionData } from '@/types/yuku';
import { NFT_EXT_WITHOUT_APPROVE } from '../special';
import idlFactory from './ext.did';
import _SERVICE, {
    ExtCommonError,
    ExtListing,
    ExtTokenMetadata,
    ExtTransferError,
} from './ext.did.d';

// =========================== Query all token owners of the EXT standard ===========================

export const queryAllTokenOwnersByExt = async (
    identity: ConnectedIdentity,
    collection: string,
    fetchProxyNftList: () => Promise<CccProxyNft[]>,
): Promise<NftTokenOwner[]> => {
    const { creator } = identity;
    const actor: _SERVICE = await creator(idlFactory, collection);

    // ! Special handling for the test environment canister, not sure what it does
    if (collection === 'ezo5a-taaaa-aaaah-abkfa-cai') {
        // This canister does not have the getRegistry method
        const r = await actor.getTokens();
        return r.map((s) => {
            const data = s[1];
            const metadata = unwrapVariant2Map(
                data,
                ['fungible', throwsBy(`fungible token is not support`)],
                ['nonfungible', (n) => unwrapOption(n.metadata)],
            );
            if (metadata === undefined)
                throw new Error(`metadata of nonfungible token can not be none`);
            const json = array2string(new Uint8Array(metadata));
            const raw = JSON.parse(json); // ! Parse as JSON
            return {
                token_id: {
                    collection,
                    token_identifier: parse_token_identifier(collection, s[0]),
                },
                owner: principal2account(raw.owner),
                raw: {
                    standard: 'ext',
                    data: {
                        index: s[0],
                        owner: principal2account(raw.owner),
                    },
                },
            };
        });
    }

    const r = await actor.getRegistry();

    const rr = _.sortBy(r, [(s) => s[0]]);

    const result: NftTokenOwner[] = rr.map((s) => ({
        token_id: {
            collection,
            token_identifier: parse_token_identifier(collection, s[0]),
        },
        owner: s[1],
        raw: {
            standard: 'ext',
            data: {
                index: s[0],
                owner: s[1],
            },
        },
    }));

    if (NFT_EXT_WITHOUT_APPROVE.includes(collection)) {
        // Some NFTs may be proxied, so we need to correct the owner
        const proxy_nfts = await fetchProxyNftList();
        result.forEach((token) => {
            const nft = proxy_nfts.find((n) => isSameNftByTokenId(n, token));
            if (nft !== undefined) {
                (token.raw.data as NftTokenOwnerMetadataExt).proxy = token.owner; // Record the proxy address
                const owner = principal2account(nft.owner);
                (token.raw.data as NftTokenOwnerMetadataExt).owner = owner; // ! Replace with the actual owner
                token.owner = owner; // ! Replace with the actual owner
            }
        });
    }

    return result;
};

// =========================== Query all token metadata of the EXT standard ===========================

const parseTraits = (traits: any, key = 'trait_type'): NftMetadataTrait[] => {
    if (!traits) return [];
    if (traits.length === undefined) return [];
    return traits
        .filter((a: any) => a[key] && a.value !== undefined) // Metadata properties of NFT
        .map((a: any) => ({ name: a[key], value: `${a.value}` }));
};

const CANISTER_METADATA_TIMES: Record<string, number> = {
    // ! Split into 2 batches of queries
    'pvu3q-aqaaa-aaaap-aamaq-cai': 2,
    'v5mzt-tqaaa-aaaah-abjoa-cai': 2,
    '47moi-iqaaa-aaaap-aa3tq-cai': 2,
    '3hzxy-fyaaa-aaaap-aaiiq-cai': 2,
    'jezzy-xqaaa-aaaap-aaybq-cai': 2,
    'fab4i-diaaa-aaaah-acr2q-cai': 2,
    'qv3zw-kqaaa-aaaap-aa27q-cai': 2,
    'doscv-wyaaa-aaaap-aaksq-cai': 2, // * Pre-release environment
    'cg5fv-5yaaa-aaaap-aagzq-cai': 2, // * Pre-release environment
    // ! Split into 3 batches of queries
    'fnzxe-niaaa-aaaap-aa6qq-cai': 3,
    'uwiqe-caaaa-aaaap-aa2eq-cai': 3, // * Pre-release environment
    '4diuz-7qaaa-aaaap-aa3rq-cai': 3, // * Pre-release environment
    '6qlam-vaaaa-aaaah-abddq-cai': 3, // ? Test environment
    '52b2m-tyaaa-aaaai-qpbpa-cai': 3,
    '7h4ue-aqaaa-aaaai-qpbaq-cai': 3, // TODO This canister is dynamic, it won't need to be set here after deploying other code
    // ! Split into 4 batches of queries
    'm7vrl-xaaaa-aaaap-aah3a-cai': 4,
    // ! Split into 7 batches of queries
    'ah2fs-fqaaa-aaaak-aalya-cai': 7,
    'cr2rc-vaaaa-aaaap-aakwa-cai': 7,
};
export const parseExtTokenMetadata = (
    collection: string,
    token_identifier: string,
    metadata: number[] | undefined,
): NftTokenMetadata => {
    const token_index = parse_token_index_with_checking(collection, token_identifier);
    let name: string = '';
    let mimeType: string = '';
    let url: string = '';
    let thumb: string = '';
    let description: string = '';
    let traits: NftMetadataTrait[] = [];
    let onChainUrl: string = '';
    let yuku_traits: NftMetadataTrait[] = [];
    let json: string;
    if (metadata === undefined) {
        // console.error(
        //     `metadata of nonfungible token can not be none: ${collection} #${token_index}`,
        // );
        json = '{}'; // Set to empty if there is no data
    } else {
        json = array2string(new Uint8Array(metadata));
    }

    let raw: Record<string, any>;
    try {
        raw = JSON.parse(json.replace(/\n/g, '\\n').replace(/\r/g, '\\r')); // ! Treat as JSON
    } catch (e) {
        console.error('parse metadata json failed', collection, token_index, json, e);
        raw = {};
    }
    name = raw.name ?? '';
    mimeType = raw.mimeType ?? '';
    url = raw.url ?? `https://${collection}.raw.ic0.app/?tokenid=${token_identifier}`;
    thumb =
        raw.thumb ??
        `https://${collection}.raw.ic0.app/?tokenid=${token_identifier}&type=thumbnail`;

    description = raw.description ?? '';
    traits = parseTraits(raw.attributes);
    onChainUrl = `https://${collection}.raw.ic0.app/?tokenid=${token_identifier}`;
    yuku_traits = parseTraits(raw.yuku_traits, 'name');
    return {
        token_id: {
            collection,
            token_identifier,
        },
        metadata: { name, mimeType, url, thumb, description, traits, onChainUrl, yuku_traits },
        raw: {
            standard: 'ext',
            data: JSON.stringify(raw),
        },
    };
};
export const queryAllTokenMetadataByExt = async (
    identity: ConnectedIdentity,
    collection: string,
    token_owners: NftTokenOwner[],
    collection_data?: CoreCollectionData,
): Promise<NftTokenMetadata[]> => {
    const { creator } = identity;
    const actor: _SERVICE = await creator(idlFactory, collection);
    let r: [number, ExtTokenMetadata][];
    if (CANISTER_METADATA_TIMES[collection]) {
        r = await execute_and_join(
            token_owners.map((t) =>
                parse_token_index_with_checking(collection, t.token_id.token_identifier),
            ),
            actor.getTokensByIds,
            CANISTER_METADATA_TIMES[collection], // ! Split into multiple batches of queries
        );
    } else {
        r = await actor.getTokens();
    }
    // ? ======================== ↓↓↓ Special handling ↓↓↓ ========================
    if (collection === 'n46fk-6qaaa-aaaai-ackxa-cai') {
        if (collection_data === undefined) {
            throw new Error(`collection data can not be undefined. ${collection}`);
        }
        return r.map((s) => {
            const data = s[1];
            const metadata = unwrapVariant2Map(
                data,
                ['fungible', throwsBy(`fungible token is not support`)],
                ['nonfungible', (n) => unwrapOption(n.metadata)],
            );
            if (metadata === undefined)
                throw new Error(`metadata of nonfungible token can not be none`);
            const json = array2string(new Uint8Array(metadata));
            const token_identifier = parse_token_identifier(collection, s[0]);
            return {
                token_id: {
                    collection,
                    token_identifier,
                },
                metadata: {
                    name: `${collection_data.info.name} #${s[0] + 1}`,
                    mimeType: '',
                    url: json, // * This canister is directly a URL
                    thumb: json,
                    description: collection_data.info.description ?? '',
                    traits: [],
                    onChainUrl: `https://${collection}.raw.ic0.app/?tokenid=${token_identifier}`,
                    yuku_traits: [],
                },
                raw: {
                    standard: 'ext',
                    data: json,
                },
            };
        });
    }
    if (collection === 'mfhqa-iyaaa-aaaai-abona-cai') {
        if (collection_data === undefined) {
            throw new Error(`collection data can not be undefined. ${collection}`);
        }
        // ic love canister
        return r.map((s) => {
            const data = s[1];
            const metadata = unwrapVariant2Map(
                data,
                ['fungible', throwsBy(`fungible token is not support`)],
                ['nonfungible', (n) => unwrapOption(n.metadata)],
            );
            let json: string;
            if (metadata === undefined) {
                // console.log(`metadata of nonfungible token can not be none: ${collection} #${s[0]}`);
                json = '{}'; // Set to empty if there is no data
            } else {
                json = array2string(new Uint8Array(metadata));
            }
            const token_identifier = parse_token_identifier(collection, s[0]);
            return {
                token_id: {
                    collection,
                    token_identifier,
                },
                metadata: {
                    name: `${collection_data.info.name} #${s[0] + 1}`,
                    mimeType: '',
                    url: `https://${collection}.raw.ic0.app/?type=thumbnail&tokenid=${token_identifier}`,
                    thumb: `https://${collection}.raw.ic0.app/?type=thumbnail&tokenid=${token_identifier}`,
                    description: collection_data.info.description ?? '',
                    traits: [],
                    onChainUrl: `https://${collection}.raw.ic0.app/?tokenid=${token_identifier}`,
                    yuku_traits: [],
                },
                raw: {
                    standard: 'ext',
                    data: json,
                },
            };
        });
    }
    // ? ======================== ↑↑↑ Special handling ↑↑↑ ========================
    return r.map((s) => {
        const data = s[1];
        const metadata = unwrapVariant2Map(
            data,
            ['fungible', throwsBy(`fungible token is not support`)],
            ['nonfungible', (n) => unwrapOption(n.metadata)],
        );
        return parseExtTokenMetadata(
            collection,
            parse_token_identifier(collection, s[0]),
            metadata,
        );
    });
};

// =========================== Query the rarity of all tokens of the standard ===========================

// Each standard requires a different method
export const queryAllTokenScoresByExt = async (
    identity: ConnectedIdentity,
    collection: string,
): Promise<NftTokenScore[]> => {
    const { creator } = identity;
    const actor: _SERVICE = await creator(idlFactory, collection);
    const r = await actor.getScore();
    if (r.length === 0) return [];
    const scores = r.map((s) => ({
        token_id: {
            collection,
            token_identifier: parse_token_identifier(collection, s[0]),
        },
        score: {
            value: s[1],
            order: 0,
        },
        raw: {
            standard: 'ext' as SupportedNftStandard,
        },
    }));
    const orders = _.sortBy(scores, [(s) => -s.score.value]); // Sort by score value, from largest to smallest
    const record: Record<string, number> = {};
    for (let i = 0; i < orders.length; i++) {
        const score = `${orders[i].score.value}`;
        if (record[score] === undefined) record[score] = i + 1;
        orders[i].score.order = record[score];
    }
    return scores;
};

// =========================== Query the token metadata of the EXT standard for a specific owner ===========================

export const queryOwnerTokenMetadataByExt = async (
    identity: ConnectedIdentity,
    collection: string,
    account: string,
    collection_data?: CoreCollectionData,
): Promise<NftTokenMetadata[]> => {
    const { creator } = identity;
    const actor: _SERVICE = await creator(idlFactory, collection);
    const result = await actor.tokens_ext(account);
    const r = unwrapMotokoResult(
        parseMotokoResult<
            Array<[number, [] | [ExtListing], [] | [Array<number>]]>,
            ExtCommonError,
            Array<[number, [] | [Array<number>]]>,
            ExtCommonError
        >(
            result,
            (ok) => ok.map((o) => [o[0], o[2]]),
            (e) => e,
        ),
        (e) => {
            if (e['Other'] === 'No tokens') return [];
            throw new Error(`${JSON.stringify(e)}`);
        },
    );

    // ? ======================== ↓↓↓ Special handling ↓↓↓ ========================
    if (collection === 'n46fk-6qaaa-aaaai-ackxa-cai') {
        if (collection_data === undefined) {
            throw new Error(`collection data can not be undefined. ${collection}`);
        }
        return r.map((s) => {
            const data = s[1];
            const metadata = unwrapOption(data);
            if (metadata === undefined)
                throw new Error(`metadata of nonfungible token can not be none`);
            const json = array2string(new Uint8Array(metadata));
            const token_identifier = parse_token_identifier(collection, s[0]);
            return {
                token_id: {
                    collection,
                    token_identifier,
                },
                metadata: {
                    name: `${collection_data.info.name} #${s[0] + 1}`,
                    mimeType: '',
                    url: json, // * This canister is directly a URL
                    thumb: json,
                    description: collection_data.info.description ?? '',
                    traits: [],
                    onChainUrl: `https://${collection}.raw.ic0.app/?tokenid=${token_identifier}`,
                    yuku_traits: [],
                },
                raw: {
                    standard: 'ext',
                    data: json,
                },
            };
        });
    }
    if (collection === 'mfhqa-iyaaa-aaaai-abona-cai') {
        if (collection_data === undefined) {
            throw new Error(`collection data can not be undefined. ${collection}`);
        }
        // ic love canister
        return r.map((s) => {
            const data = s[1];
            const metadata = unwrapOption(data);
            let json: string;
            if (metadata === undefined) {
                // console.log(`metadata of nonfungible token can not be none: ${collection} #${s[0]}`);
                json = '{}'; // Set to empty if there is no data
            } else {
                json = array2string(new Uint8Array(metadata));
            }
            const token_identifier = parse_token_identifier(collection, s[0]);
            return {
                token_id: {
                    collection,
                    token_identifier,
                },
                metadata: {
                    name: `${collection_data.info.name} #${s[0] + 1}`,
                    mimeType: '',
                    url: `https://${collection}.raw.ic0.app/?type=thumbnail&tokenid=${token_identifier}`,
                    thumb: `https://${collection}.raw.ic0.app/?type=thumbnail&tokenid=${token_identifier}`,
                    description: collection_data.info.description ?? '',
                    traits: [],
                    onChainUrl: `https://${collection}.raw.ic0.app/?tokenid=${token_identifier}`,
                    yuku_traits: [],
                },
                raw: {
                    standard: 'ext',
                    data: json,
                },
            };
        });
    }
    // ? ======================== ↑↑↑ Special handling ↑↑↑ ========================
    return r.map((s) =>
        parseExtTokenMetadata(
            collection,
            parse_token_identifier(collection, s[0]),
            unwrapOption(s[1]),
        ),
    );
};

// =========================== Query the token metadata of the EXT standard for a specific NFT ===========================
export const querySingleTokenMetadataByExt = async (
    identity: ConnectedIdentity,
    collection: string,
    token_identifier: string,
    collection_data?: CoreCollectionData,
): Promise<NftTokenMetadata> => {
    const { creator } = identity;
    const actor: _SERVICE = await creator(idlFactory, collection);
    const result = await actor.metadata(token_identifier);
    const metadata = unwrapVariant2Map(
        unwrapMotokoResult<ExtTokenMetadata, ExtCommonError>(
            result,
            throwsBy((e) => `${JSON.stringify(e)}`),
        ),
        ['fungible', throwsBy(`fungible token is not supported`)],
        ['nonfungible', (n) => unwrapOption(n.metadata)],
    );

    // ? ======================== ↓↓↓ Special Handling ↓↓↓ ========================
    if (collection === 'n46fk-6qaaa-aaaai-ackxa-cai') {
        if (collection_data === undefined) {
            throw new Error(`collection data cannot be undefined. ${collection}`);
        }
        if (metadata === undefined) throw new Error(`metadata of nonfungible token cannot be none`);
        const json = array2string(new Uint8Array(metadata));
        const token_index = parse_token_index_with_checking(collection, token_identifier);
        return {
            token_id: {
                collection,
                token_identifier,
            },
            metadata: {
                name: `${collection_data.info.name} #${token_index + 1}`,
                mimeType: '',
                url: json, // * This canister is just a URL
                thumb: json,
                description: collection_data.info.description ?? '',
                traits: [],
                onChainUrl: `https://${collection}.raw.ic0.app/?tokenid=${token_identifier}`,
                yuku_traits: [],
            },
            raw: {
                standard: 'ext',
                data: json,
            },
        };
    }
    if (collection === 'mfhqa-iyaaa-aaaai-abona-cai') {
        if (collection_data === undefined) {
            throw new Error(`collection data cannot be undefined. ${collection}`);
        }
        // ic love canister
        let json: string;
        if (metadata === undefined) {
            // console.log(`metadata of nonfungible token cannot be none: ${collection} #${s[0]}`);
            json = '{}'; // Set to empty if there is no data
        } else {
            json = array2string(new Uint8Array(metadata));
        }
        const token_index = parse_token_index_with_checking(collection, token_identifier);
        return {
            token_id: {
                collection,
                token_identifier,
            },
            metadata: {
                name: `${collection_data.info.name} #${token_index + 1}`,
                mimeType: '',
                url: `https://${collection}.raw.ic0.app/?type=thumbnail&tokenid=${token_identifier}`,
                thumb: `https://${collection}.raw.ic0.app/?type=thumbnail&tokenid=${token_identifier}`,
                description: collection_data.info.description ?? '',
                traits: [],
                onChainUrl: `https://${collection}.raw.ic0.app/?tokenid=${token_identifier}`,
                yuku_traits: [],
            },
            raw: {
                standard: 'ext',
                data: json,
            },
        };
    }
    // ? ======================== ↑↑↑ Special Handling ↑↑↑ ========================

    return parseExtTokenMetadata(collection, token_identifier, metadata);
};

// =========================== Query the owner of a specific NFT of the EXT standard ===========================

export const querySingleTokenOwnerByExt = async (
    identity: ConnectedIdentity,
    collection: string,
    token_identifier: string,
): Promise<string> => {
    const { creator } = identity;
    const actor: _SERVICE = await creator(idlFactory, collection);
    const result = await actor.bearer(token_identifier);
    const owner = unwrapMotokoResult(
        result,
        throwsBy((e) => `${JSON.stringify(e)}`),
    );
    return owner;
};

// =========================== EXT Standard Get Minter ===========================

export const queryCollectionNftMinterByExt = async (
    identity: ConnectedIdentity,
    collection: string,
): Promise<string> => {
    const { creator } = identity;
    const actor: _SERVICE = await creator(idlFactory, collection);
    const r = await actor.getMinter();
    return principal2string(r);
};

// =========================== EXT Standard Allowance Query ===========================

export const allowance = async (
    identity: ConnectedIdentity,
    collection: string,
    args: {
        token_identifier: string;
        owner: ExtUser;
        spender: string;
    },
): Promise<boolean> => {
    const { creator } = identity;
    const actor: _SERVICE = await creator(idlFactory, collection);
    const result = await actor.allowance({
        owner: args.owner.principal
            ? { principal: string2principal(args.owner.principal) }
            : { address: args.owner.address! },
        token: args.token_identifier,
        spender: string2principal(args.spender),
    });
    return unwrapMotokoResultMap<BigInt, any, boolean>(
        result,
        (n) => bigint2string(n) === '1',
        mapping_false,
    );
};

// =========================== EXT Standard Approval ===========================

export const approve = async (
    identity: ConnectedIdentity,
    collection: string,
    args: {
        token_identifier: string;
        spender: string;
        subaccount?: number[];
    },
): Promise<boolean> => {
    const { creator } = identity;
    const actor: _SERVICE = await creator(idlFactory, collection);
    const result = await actor.approve({
        token: args.token_identifier,
        spender: string2principal(args.spender),
        subaccount: args.subaccount ? [args.subaccount] : [],
        allowance: BigInt(1),
    });
    return result;
};

// =========================== EXT Standard Transfer ===========================

export const transferFrom = async (
    identity: ConnectedIdentity,
    collection: string,
    args: {
        token_identifier: string;
        from: ExtUser;
        to: ExtUser;
        subaccount?: number[];
        memo?: number[];
    },
): Promise<boolean> => {
    const { creator } = identity;
    const actor: _SERVICE = await creator(idlFactory, collection);
    const result = await actor.transfer({
        token: args.token_identifier,
        from: args.from.principal
            ? { principal: string2principal(args.from.principal) }
            : { address: args.from.address! },
        to: args.to.principal
            ? { principal: string2principal(args.to.principal) }
            : { address: args.to.address! },
        subaccount: wrapOption(args.subaccount),
        memo: args.memo ?? [],
        // ! Default to false, cannot be changed to true
        notify: false,
        amount: BigInt(1),
    });
    return unwrapMotokoResultMap<bigint, ExtTransferError, boolean>(
        result,
        (n) => bigint2string(n) === '1',
        throwsVariantError,
    );
};
