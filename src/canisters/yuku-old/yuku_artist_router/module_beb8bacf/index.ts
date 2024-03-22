import { Principal } from '@dfinity/principal';
import _ from 'lodash';
import { string2array } from '@/common/data/arrays';
import { isAccountHex } from '@/common/ic/account';
import { isPrincipalText } from '@/common/ic/principals';
import { parse_nft_identifier, parse_token_identifier } from '@/common/nft/ext';
import { bigint2string, string2bigint } from '@/common/types/bigint';
import { unwrapOptionMap, wrapOption, wrapOptionMap } from '@/common/types/options';
import { principal2string, string2principal } from '@/common/types/principal';
import { unwrapMotokoResultMap } from '@/common/types/results';
import { throwsBy, unchanging, unwrapVariantKey } from '@/common/types/variant';
import { ConnectedIdentity } from '@/types/identity';
import { NftIdentifier } from '@/types/nft';
import { ArtistCollectionData, CollectionInfo } from '@/types/yuku';
import { ArtistCollectionArgs, ArtistNotice, MintingNFT } from '..';
import { wrapCollectionLinks } from '../../types';
import { parseCollectionInfo } from '../../yuku_core/module_4766db8a';
import idlFactory from './artist_router_beb8bacf.did';
import _SERVICE from './artist_router_beb8bacf.did';

// =========================== Query the list of supported NFT collection IDs by the backend ===========================

export const queryArtistCollectionIdList = async (
    identity: ConnectedIdentity,
    backend_canister_id: string,
): Promise<string[]> => {
    const { creator } = identity;
    const actor: _SERVICE = await creator(idlFactory, backend_canister_id);
    const r = await actor.listCollections();
    return _.uniq(r); // ! The backend data is unreliable, so we remove duplicates
    return r;
};

// =========================== Query the list and detailed information of supported NFT collections by the backend ===========================

export const queryArtistCollectionDataList = async (
    identity: ConnectedIdentity,
    backend_canister_id: string,
): Promise<ArtistCollectionData[]> => {
    const { creator } = identity;
    const actor: _SERVICE = await creator(idlFactory, backend_canister_id);
    const r = await actor.getCollectionInfos();
    // Process the results
    const results = r.map((d) => {
        const info: CollectionInfo = parseCollectionInfo(d);
        const data: ArtistCollectionData = { info };
        return data;
    });
    return _.uniqBy(results, (item) => item.info.collection); // ! The backend data is unreliable, so we remove duplicates
    return results;
};

// =========================== Query the list of all Art NFTs ===========================

export const queryAllArtistNftTokenIdList = async (
    identity: ConnectedIdentity,
    backend_canister_id: string,
): Promise<NftIdentifier[]> => {
    const { creator } = identity;
    const actor: _SERVICE = await creator(idlFactory, backend_canister_id);
    const r = await actor.listNFT();
    return r.map(parse_nft_identifier);
};

// =========================== Query the accounts with permission to create NFTs ===========================

export const getAllArtists = async (
    identity: ConnectedIdentity,
    backend_canister_id: string,
): Promise<string[]> => {
    const { creator } = identity;
    const actor: _SERVICE = await creator(idlFactory, backend_canister_id);
    const r = await actor.getArtists();
    return r.map(principal2string);
};

// =========================== Query the cost of creating an NFT ===========================

export const queryMintingFee = async (
    identity: ConnectedIdentity,
    backend_canister_id: string,
): Promise<string> => {
    const { creator } = identity;
    const actor: _SERVICE = await creator(idlFactory, backend_canister_id);
    const r = await actor.getNFTCost();
    return bigint2string(r);
};

// =========================== Query the Artist collection of a specific user ===========================

export const queryUserArtistCollection = async (
    identity: ConnectedIdentity,
    backend_canister_id: string,
    principal: string,
): Promise<string | undefined> => {
    const { creator } = identity;
    const actor: _SERVICE = await creator(idlFactory, backend_canister_id);
    const r = await actor.getCollectionByPid(string2principal(principal));
    return unwrapOptionMap(r, principal2string);
};
// =========================== User creates an Artist collection ===========================

export const createArtistCollection = async (
    identity: ConnectedIdentity,
    backend_canister_id: string,
    args: ArtistCollectionArgs,
): Promise<string> => {
    const { creator } = identity;
    const actor: _SERVICE = await creator(idlFactory, backend_canister_id);
    const r = await actor.createCollection({
        standard: { ext: null },
        royalties: { rate: string2bigint(args.royalties ?? '0'), precision: string2bigint('2') },
        isVisible: args.isVisible ?? false,
        name: wrapOption(args.name),
        category: wrapOption(args.category),
        description: wrapOption(args.description),
        featured: wrapOption(args.featured),
        logo: wrapOption(args.logo),
        banner: wrapOption(args.banner),
        links: wrapCollectionLinks(args.links),

        releaseTime: wrapOptionMap(args.releaseTime, string2bigint),
        openTime: wrapOptionMap(args.openTime, string2bigint),

        url: wrapOption(args.url),
    });
    return unwrapMotokoResultMap<Principal, string, string>(
        r,
        principal2string,
        throwsBy<string>(unchanging),
    );
};

// =========================== Query the accounts with permission to create NFTs ===========================

export const mintArtistNFT = async (
    identity: ConnectedIdentity,
    backend_canister_id: string,
    args: {
        collection: string;
        to: string; // principal or account_hex
        metadata?: MintingNFT;
        height: string; // Payment height
    },
): Promise<NftIdentifier> => {
    const { creator } = identity;
    const actor: _SERVICE = await creator(idlFactory, backend_canister_id);
    const r = await actor.mintNFTWithICP(string2bigint(args.height), args.collection, {
        to: (() => {
            if (isPrincipalText(args.to)) return { principal: string2principal(args.to) };
            if (isAccountHex(args.to)) return { address: args.to };
            throw new Error('invalid args.to');
        })(),
        metadata: wrapOptionMap(args.metadata, (m) => string2array(JSON.stringify(m))),
    });
    return unwrapMotokoResultMap<number, string, NftIdentifier>(
        r,
        (token_index) => ({
            collection: args.collection,
            token_identifier: parse_token_identifier(args.collection, token_index),
        }),
        throwsBy<string>(unchanging),
    );
};

// =========================== Query notification messages ===========================

export const queryNoticeList = async (
    identity: ConnectedIdentity,
    backend_canister_id: string,
): Promise<ArtistNotice[]> => {
    const { creator } = identity;
    const actor: _SERVICE = await creator(idlFactory, backend_canister_id);
    const r = await actor.getNotice();
    return r.map((d) => ({
        id: bigint2string(d.id),
        status: (() => {
            const key = unwrapVariantKey(d.status);
            switch (key) {
                case 'readed' /* cspell: disable-line */:
                    return 'read';
                case 'unreaded' /* cspell: disable-line */:
                    return 'unread';
            }
            throw new Error(`wrong status`);
        })(),
        minter: d.minter,
        timestamp: bigint2string(d.timestamp),
        result: d.result,
    }));
};

// =========================== Set notifications as read ===========================

export const readNotices = async (
    identity: ConnectedIdentity,
    backend_canister_id: string,
    args: string[],
): Promise<void> => {
    const { creator } = identity;
    const actor: _SERVICE = await creator(idlFactory, backend_canister_id);
    await actor.setNoticesReaded(args.map(string2bigint)); /* cspell: disable-line */
};

export default {
    queryArtistCollectionIdList,
    queryArtistCollectionDataList,
    queryAllArtistNftTokenIdList,
    getAllArtists,
    queryMintingFee,
    queryUserArtistCollection,
    createArtistCollection,
    mintArtistNFT,
    queryNoticeList,
    readNotices,
};
