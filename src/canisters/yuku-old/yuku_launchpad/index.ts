import { bigint2string, string2bigint } from '@/common/types/bigint';
import { unwrapOptionMap } from '@/common/types/options';
import { principal2string, string2principal } from '@/common/types/principal';
import { unwrapMotokoResultMap } from '@/common/types/results';
import { throwsVariantError } from '@/common/types/variant';
import { ConnectedIdentity } from '@/types/identity';
import { CollectionLinks, CollectionStandard } from '@/types/yuku';
import { parseCollectionStandard, unwrapCollectionLinks } from '../types';
import idlFactory from './launchpad.did';
import _SERVICE, { CollectionInfo as CandidCollectionInfo } from './launchpad.did';

export type LaunchpadCollectionStatus = 'upcoming' | 'whitelist' | 'open' | 'expired' | 'unknown';

export const getLaunchpadCollectionStatus = (
    info: LaunchpadCollectionInfo,
): LaunchpadCollectionStatus => {
    const now = BigInt(new Date().getTime() * 1e6);

    const whitelist_start = BigInt(info.whitelist_start);
    const whitelist_end = BigInt(info.whitelist_end);
    const open_start = BigInt(info.open_start);
    const open_end = BigInt(info.open_end);

    if (now < whitelist_start) return 'upcoming';
    if (whitelist_start <= now && now < whitelist_end) return 'whitelist';

    if (open_start <= now && now < open_end) return 'open';
    if (open_end <= now) return 'expired';

    return 'unknown';
};
export const getLaunchpadTimeRemain = (info: LaunchpadCollectionInfo): string => {
    const status = getLaunchpadCollectionStatus(info);
    const now = BigInt(Date.now() * 1e6);

    const whitelist_start = BigInt(info.whitelist_start);
    const whitelist_end = BigInt(info.whitelist_end);
    // const open_start = BigInt(info.open_start);
    const open_end = BigInt(info.open_end);

    switch (status) {
        case 'upcoming':
            return bigint2string(whitelist_start - now);
        case 'whitelist':
            return bigint2string(whitelist_end - now);
        case 'open':
            return bigint2string(open_end - now);
        case 'expired':
            return '0';
        default:
            return '0';
    }
};
export type LaunchpadCollectionInfo = {
    index: string; // ? bigint -> string
    collection: string; // ? principal -> string // id
    created: string; // ? bigint -> string // addTime

    featured: string;
    featured_mobile: string;

    name: string;
    banner: string;
    description: string;
    links?: CollectionLinks;

    standard: CollectionStandard;

    team: string;
    teamImages: string[]; // teamImage

    supply: string; // ? bigint -> string // totalSupply

    whitelist_start: string; // ? bigint -> string // whitelistTimeStart //
    whitelist_end: string; // ? bigint -> string // whitelistTimeEnd //
    whitelist_price: string; // ? bigint -> string // whitelistPrice
    whitelist_limit: string; // ? bigint -> string // whitelistPerCount // whitelist per wallet account
    whitelist_supply: string; // ? bigint -> string // whitelistCount

    remain: string; // ? bigint -> string // avaliable /* cspell: disable-line */

    open_start: string; // ? bigint -> string // starTime
    open_end: string; // ? bigint -> string // endTime
    open_price: string; // ? bigint -> string // price
    open_limit?: string; // ? bigint -> string // normalPerCount // public per wallet account
    open_supply: string; // ? bigint -> string // normalCount

    typical: {
        token_index: number; //
        name: string;
        collection: string; // ? principal -> string
        url: string;
    }[];

    production: string;

    faq: { question: string; answer: string }[];
};

export type AllLaunchpadCollections = {
    upcoming: LaunchpadCollectionInfo[];
    whitelist: LaunchpadCollectionInfo[];
    open: LaunchpadCollectionInfo[];
    expired: LaunchpadCollectionInfo[];
};

const parseLaunchpadCollectionInfo = (d: CandidCollectionInfo): LaunchpadCollectionInfo => {
    return {
        index: bigint2string(d.index),
        collection: principal2string(d.id),
        created: bigint2string(d.addTime),
        featured: d.featured,
        featured_mobile: d.featured_mobile,
        name: d.name,
        banner: d.banner,
        description: d.description,
        links: unwrapCollectionLinks(d.links),
        standard: parseCollectionStandard(d.standard),
        team: d.team,
        teamImages: d.teamImage,
        supply: bigint2string(d.totalSupply),
        whitelist_start: bigint2string(d.whitelistTimeStart),
        whitelist_end: bigint2string(d.whitelistTimeEnd),
        whitelist_price: bigint2string(d.whitelistPrice),
        whitelist_limit: bigint2string(d.whitelistPerCount),
        whitelist_supply: bigint2string(d.whitelistCount),
        remain: bigint2string(d.avaliable) /* cspell: disable-line */,
        open_start: bigint2string(d.starTime),
        open_end: bigint2string(d.endTime),
        open_price: bigint2string(d.price),
        open_limit: unwrapOptionMap(d.normalPerCount, bigint2string),
        open_supply: bigint2string(d.normalCount),
        typical: d.typicalNFTs.map((n) => ({
            token_index: n.TokenIndex,
            name: n.NFTName,
            collection: principal2string(n.Canister),
            url: n.NFTUrl,
        })),
        production: d.production,
        faq: d.faq.map((a) => ({ question: a.Question, answer: a.Answer })),
    };
};

export const queryAllLaunchpadCollections = async (
    identity: ConnectedIdentity,
    backend_canister_id: string,
): Promise<LaunchpadCollectionInfo[]> => {
    const { creator } = identity;
    const actor: _SERVICE = await creator(idlFactory, backend_canister_id);
    const r = await actor.listCollections();
    return r.map(parseLaunchpadCollectionInfo);
};

export const queryAllLaunchpadCollectionsWithStatus = async (
    identity: ConnectedIdentity,
    backend_canister_id: string,
): Promise<AllLaunchpadCollections> => {
    const list = await queryAllLaunchpadCollections(identity, backend_canister_id);

    const now = BigInt(new Date().getTime() * 1e6);

    const compare =
        (map: (info: LaunchpadCollectionInfo) => number) =>
        (a: LaunchpadCollectionInfo, b: LaunchpadCollectionInfo) =>
            map(a) - map(b);

    // filter and sort
    const upcoming = list
        .filter((info) => now < BigInt(info.whitelist_start))
        .sort(compare((info) => -Number(info.created)));
    const whitelist = list
        .filter((info) => BigInt(info.whitelist_start) <= now && now < BigInt(info.whitelist_end))
        .sort(compare((info) => -Number(info.created)));
    const open = list
        .filter((info) => BigInt(info.open_start) <= now && now < BigInt(info.open_end))
        .sort(compare((info) => -Number(info.created)));
    const expired = list
        .filter((info) => BigInt(info.open_end) < now)
        .sort(compare((info) => Number(now) - Number(info.open_end)));

    return {
        upcoming,
        whitelist,
        open,
        expired,
    };
};

export const querySingleLaunchpadCollectionInfo = async (
    identity: ConnectedIdentity,
    backend_canister_id: string,
    collection: string,
): Promise<LaunchpadCollectionInfo | undefined> => {
    const { creator } = identity;
    const actor: _SERVICE = await creator(idlFactory, backend_canister_id);
    const r = await actor.getCollection(string2principal(collection));
    return unwrapOptionMap(r, parseLaunchpadCollectionInfo);
};

export const queryWhitelistUserRemainAmount = async (
    identity: ConnectedIdentity,
    backend_canister_id: string,
    args: {
        collection: string;
        whitelist_limit: string;
        supply: string;
        remain: string;
        whitelist_supply: string;
    },
): Promise<number> => {
    const { creator } = identity;
    const actor: _SERVICE = await creator(idlFactory, backend_canister_id);
    const r = await actor.isWhitelist(string2principal(args.collection));
    return unwrapMotokoResultMap<bigint, string, number>(
        r,
        (a) => Math.min(Math.max(0, Number(args.whitelist_limit) - Number(a)), Number(args.remain)),

        () => 0,
    );
};

export const queryOpenUserRemainAmount = async (
    identity: ConnectedIdentity,
    backend_canister_id: string,
    args: {
        collection: string;
        open_limit: string;
        supply: string;
        remain: string;
        open_supply: string;
    },
): Promise<number> => {
    const { creator } = identity;
    const actor: _SERVICE = await creator(idlFactory, backend_canister_id);
    const r = await actor.listBought(string2principal(args.collection));
    const account = identity.account;
    const bought = r.filter((item) => item[0] === account).length;
    return Math.min(Math.max(0, Number(args.open_limit) - Number(bought)), Number(args.remain));
};

export const claimLaunchpadNFT = async (
    identity: ConnectedIdentity,
    backend_canister_id: string,
    height: string,
): Promise<number[]> => {
    const { creator } = identity;
    const actor: _SERVICE = await creator(idlFactory, backend_canister_id);
    const r = await actor.claimWithHeight(string2bigint(height));
    return unwrapMotokoResultMap<bigint[], any, number[]>(
        r,
        (list) => list.map(Number),
        throwsVariantError,
    );
};

// export const launchpadAddWhitelist = async (
//     identity: ConnectedIdentity,
//     backend_canister_id: string,
//     args: {
//         collection: string;
//         account_list: string[];
//     },
// ): Promise<void> => {
//     const { creator } = identity;
//     const actor: _SERVICE = await creator(idlFactory, backend_canister_id);
//     await actor.addWhitelist(string2principal(args.collection), args.account_list);
// };

export const queryLaunchpadWhitelist = async (
    identity: ConnectedIdentity,
    backend_canister_id: string,
    collection: string,
): Promise<number> => {
    const { creator } = identity;
    const actor: _SERVICE = await creator(idlFactory, backend_canister_id);
    const r = await actor.isWhitelist(string2principal(collection));
    return unwrapMotokoResultMap<bigint, string, number>(
        r,
        (a) => Number(a),
        (e) => {
            throw new Error(e);
        },
    );
};
