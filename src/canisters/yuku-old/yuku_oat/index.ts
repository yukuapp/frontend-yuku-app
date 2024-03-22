import { bigint2string, string2bigint } from '@/common/types/bigint';
import { unwrapOption } from '@/common/types/options';
import { principal2string, string2principal } from '@/common/types/principal';
import { unwrapMotokoResultMap } from '@/common/types/results';
import { throwsVariantError, unchanging, unwrapVariant2Map } from '@/common/types/variant';
import { ConnectedIdentity } from '@/types/identity';
import { CollectionLinks } from '@/types/yuku';
import idlFactory from './oat.did';
import _SERVICE, { OatEvent as CandidOatEvent, Project as CandidProject } from './oat.did.d';

export type OatCollectionEvent = {
    id: string; // ? bigint -> string
    projectId: string; // ? bigint -> string
    collection: string; // ? principal -> string // canister
    name: string;
    description: string;
    featured: string;
    link: string;
    supply: string; // ? bigint -> string // camp
    claimed: string; // ? bigint -> string
    permission: 'whitelist' | 'not_whitelist';
    event_start: string; // ? bigint -> string // eventStartTime
    event_end: string; // ? bigint -> string // eventEndTime
    oat_release_start: string; // ? bigint -> string // oatReleaseStartTime
    oat_release_end: string; // ? bigint -> string // oatReleaseEndTime
    status: 'not_start' | 'ended'; // eventType
};

const parseOatCollectionEvent = (d: CandidOatEvent): OatCollectionEvent => {
    return {
        id: bigint2string(d.id),
        projectId: bigint2string(d.projectId),
        collection: principal2string(d.canister),
        name: d.name,
        description: d.description,
        featured: d.featured,
        link: d.link,
        supply: bigint2string(d.camp),
        claimed: bigint2string(d.claimed),
        permission: unwrapVariant2Map(
            d.permisson /* cspell: disable-line */,
            ['wl', () => 'whitelist'],
            ['nowl', () => 'not_whitelist'] /* cspell: disable-line */,
        ),
        event_start: bigint2string(d.eventStartTime),
        event_end: bigint2string(d.eventEndTime),
        oat_release_start: bigint2string(d.oatReleaseStartTime),
        oat_release_end: bigint2string(d.oatReleaseEndTime),
        status: unwrapVariant2Map(
            d.eventType,
            ['notStart', () => 'not_start'],
            ['ended', () => 'ended'],
        ),
    };
};

export const queryAllOatCollectionEventList = async (
    identity: ConnectedIdentity,
    backend_canister_id: string,
): Promise<OatCollectionEvent[]> => {
    const { creator } = identity;
    const actor: _SERVICE = await creator(idlFactory, backend_canister_id);
    const r = await actor.getEvents();
    return r.map(parseOatCollectionEvent);
};

export const queryOatCollectionEventsByEventId = async (
    identity: ConnectedIdentity,
    backend_canister_id: string,
    event_id_list: string[],
): Promise<OatCollectionEvent[]> => {
    const { creator } = identity;
    const actor: _SERVICE = await creator(idlFactory, backend_canister_id);
    const r = await actor.getEventsByEventId(event_id_list.map(string2bigint));
    return r.map(parseOatCollectionEvent);
};

export const queryOatCollectionEventsByProjectId = async (
    identity: ConnectedIdentity,
    backend_canister_id: string,
    project_id: string,
): Promise<OatCollectionEvent[]> => {
    const { creator } = identity;
    const actor: _SERVICE = await creator(idlFactory, backend_canister_id);
    const r = await actor.getEventsByProjectId(string2bigint(project_id));
    return r.map(parseOatCollectionEvent);
};

export type OatProject = {
    id: string; // ? bigint -> string
    owner: string; // ? principal -> string
    name: string;
    logo: string;
    banner: string;
    description: string;
    events: string[]; // ? bigint -> string
    links: CollectionLinks;
};

const parseOatProject = (d: CandidProject): OatProject => {
    return {
        id: bigint2string(d.id),
        owner: principal2string(d.owner),
        name: d.name,
        logo: d.logo,
        banner: d.banner,
        description: d.description,
        events: d.events.map(bigint2string),
        links: {
            twitter: unwrapOption(d.twitter),
            instagram: unwrapOption(d.instagram),
            discord: unwrapOption(d.discord),
            website: unwrapOption(d.website),
            telegram: unwrapOption(d.telegram),
            medium: unwrapOption(d.medium),
        },
    };
};

export const queryOatProjectsByProjectId = async (
    identity: ConnectedIdentity,
    backend_canister_id: string,
    project_id_list: string[],
): Promise<OatProject[]> => {
    const { creator } = identity;
    const actor: _SERVICE = await creator(idlFactory, backend_canister_id);
    const r = await actor.getProjectsByProjectId(project_id_list.map(string2bigint));
    return r.map(parseOatProject);
};

export const queryClaimableByUser = async (
    identity: ConnectedIdentity,
    backend_canister_id: string,
    event_id: string,
): Promise<boolean> => {
    const { creator } = identity;
    const actor: _SERVICE = await creator(idlFactory, backend_canister_id);
    const r = await actor.canClaim(string2bigint(event_id));

    return r;
};

export const claimOatNFT = async (
    identity: ConnectedIdentity,
    backend_canister_id: string,
    event_id: string,
): Promise<string> => {
    const { creator } = identity;
    const actor: _SERVICE = await creator(idlFactory, backend_canister_id);
    const r = await actor.claim(string2bigint(event_id));

    return unwrapMotokoResultMap<string, any, string>(r, unchanging, throwsVariantError);
};

// export const oatAddWhitelist = async (
//     identity: ConnectedIdentity,
//     backend_canister_id: string,
//     args: {
//         event_id: string;
//         account_list: string[];
//     },
// ): Promise<void> => {
//     const { creator } = identity;
//     const actor: _SERVICE = await creator(idlFactory, backend_canister_id);
//     await actor.addWhitelist(string2bigint(args.event_id), args.account_list);
// };

export type OatWhitelist = {
    account: string;
    bought: string;
};

export const queryOatWhitelist = async (
    identity: ConnectedIdentity,
    backend_canister_id: string,
    collection: string,
): Promise<OatWhitelist[]> => {
    const { creator } = identity;
    const actor: _SERVICE = await creator(idlFactory, backend_canister_id);
    const r = await actor.listWhitelist(string2principal(collection));
    return r.map((d) => ({ account: d[0], bought: bigint2string(d[1]) }));
};
