import _ from 'lodash';
import { array2string } from '@/common/data/arrays';
import { parse_token_identifier, parse_token_index_with_checking } from '@/common/nft/ext';
import { bigint2string } from '@/common/types/bigint';
import { unwrapOption, wrapOption } from '@/common/types/options';
import { principal2string, string2principal } from '@/common/types/principal';
import { unwrapRustResult, unwrapRustResultMap } from '@/common/types/results';
import {
    mapping_false,
    throwsBy,
    throwsVariantError,
    unwrapVariant2Map,
} from '@/common/types/variant';
import { ConnectedIdentity } from '@/types/identity';
import { NftTokenMetadata, NftTokenOwner } from '@/types/nft';
import { ExtUser } from '@/types/nft-standard/ext';
import { CoreCollectionData } from '@/types/yuku';
import idlFactory from './icnaming.did';
import _SERVICE, { TransferError as CandidTransferError } from './icnaming.did.d';

// =========================== Query all token owners of ICNAMING standard ===========================

export const queryAllTokenOwnersByIcnaming = async (
    identity: ConnectedIdentity,
    collection: string,
): Promise<NftTokenOwner[]> => {
    const { creator } = identity;
    const actor: _SERVICE = await creator(idlFactory, collection);
    const r = await actor.getRegistry();
    const rr = _.sortBy(r, [(s) => s[0]]);
    return rr.map((s) => ({
        token_id: {
            collection,
            token_identifier: parse_token_identifier(collection, s[0]),
        },
        owner: s[1],
        raw: {
            standard: 'icnaming',
            data: {
                index: s[0],
                owner: s[1],
            },
        },
    }));
};

// =========================== Query all token metadata of ICNAMING standard ===========================

const parseTokenMetadata = (
    collection: string,
    collection_data: CoreCollectionData,
    token_identifier: string,
    metadata: number[] | undefined,
): NftTokenMetadata => {
    if (metadata === undefined) throw new Error(`metadata of nonfungible token can not be none`);
    // Extract the domain from the metadata
    const domain = array2string(new Uint8Array([...metadata].splice(22, metadata.length - 22)));
    const token_index = parse_token_index_with_checking(collection, token_identifier);
    return {
        token_id: {
            collection,
            token_identifier,
        },
        metadata: {
            name: `${collection_data.info.name} #${token_index + 1}`,
            mimeType: '',
            url: `https://${collection}.raw.ic0.app/?tokenid=${token_identifier}`,
            thumb: `https://${collection}.raw.ic0.app/?type=thumbnail&tokenid=${token_identifier}`,
            description: collection_data.info.description ?? '',
            traits: [],
            onChainUrl: `https://${collection}.raw.ic0.app/?tokenid=${token_identifier}`,
            yuku_traits: [],
        },
        raw: {
            standard: 'icnaming',
            data: domain,
        },
    };
};

export const queryAllTokenMetadataByIcnaming = async (
    identity: ConnectedIdentity,
    collection: string,
    token_owners: NftTokenOwner[],
    collection_data?: CoreCollectionData,
): Promise<NftTokenMetadata[]> => {
    if (collection_data === undefined) {
        throw new Error(`collection data can not be undefined. ${collection}`);
    }

    const { creator } = identity;
    const actor: _SERVICE = await creator(idlFactory, collection);
    const r = await actor.getTokens();
    return r.map((s) => {
        const token_identifier = parse_token_identifier(collection, s[0]);
        const token = token_owners.find((t) => t.token_id.token_identifier === token_identifier);
        if (token === undefined) {
            throw new Error(
                `can not find token with id: ${s[0]} for icnaming canister id: ${collection}`,
            );
        }
        const data = s[1];
        const metadata = unwrapVariant2Map(
            data,
            ['fungible', throwsBy(`fungible token is not support`)],
            ['nonfungible', (n) => unwrapOption(n.metadata)],
        );
        return parseTokenMetadata(
            collection,
            collection_data,
            token.token_id.token_identifier,
            metadata,
        );
    });
};

// =========================== Query token metadata of a specific NFT using ICNAMING standard ===========================

export const querySingleTokenMetadataByIcnaming = async (
    identity: ConnectedIdentity,
    collection: string,
    token_identifier: string,
    collection_data?: CoreCollectionData,
): Promise<NftTokenMetadata> => {
    if (collection_data === undefined) {
        throw new Error(`collection data can not be undefined. ${collection}`);
    }

    const { creator } = identity;
    const actor: _SERVICE = await creator(idlFactory, collection);
    const result = await actor.metadata(token_identifier);
    const metadata = unwrapVariant2Map(
        unwrapRustResult(
            result,
            throwsBy((e) => `${JSON.stringify(e)}`),
        ),
        ['fungible', throwsBy(`fungible token is not support`)],
        ['nonfungible', (n) => unwrapOption(n.metadata)],
    );

    return parseTokenMetadata(collection, collection_data, token_identifier, metadata);
};

// =========================== Query the owner of a specific NFT using ICNAMING standard ===========================

export const querySingleTokenOwnerByIcnaming = async (
    identity: ConnectedIdentity,
    collection: string,
    token_identifier: string,
): Promise<string> => {
    const { creator } = identity;
    const actor: _SERVICE = await creator(idlFactory, collection);
    const result = await actor.bearer(token_identifier);
    const owner = unwrapRustResult(
        result,
        throwsBy((e) => `${JSON.stringify(e)}`),
    );
    return owner;
};

// =========================== Get the minter of a collection using ICNAMING standard ===========================

export const queryCollectionNftMinterByIcnaming = async (
    identity: ConnectedIdentity,
    collection: string,
): Promise<string> => {
    const { creator } = identity;
    const actor: _SERVICE = await creator(idlFactory, collection);
    const r = await actor.getMinter();
    return principal2string(r);
};

// =========================== Query authorization using ICNAMING standard ===========================

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
    return unwrapRustResultMap<BigInt, any, boolean>(
        result,
        (n) => bigint2string(n) === '1',
        mapping_false,
    );
};

// =========================== Authorize using ICNAMING standard ===========================

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
    const result = await actor.ext_approve({
        token: args.token_identifier,
        spender: string2principal(args.spender),
        subaccount: args.subaccount ? [args.subaccount] : [],
        allowance: BigInt(1),
    });
    return result;
};

// =========================== Transfer using ICNAMING standard ===========================

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
    const result = await actor.ext_transfer({
        token: args.token_identifier,
        from: args.from.principal
            ? { principal: string2principal(args.from.principal) }
            : { address: args.from.address! },
        to: args.to.principal
            ? { principal: string2principal(args.to.principal) }
            : { address: args.to.address! },
        subaccount: wrapOption(args.subaccount),
        memo: args.memo ?? [],
        notify: false,
        amount: BigInt(1),
    });
    return unwrapRustResultMap<bigint, CandidTransferError, boolean>(
        result,
        (n) => bigint2string(n) === '1',
        throwsVariantError,
    );
};
