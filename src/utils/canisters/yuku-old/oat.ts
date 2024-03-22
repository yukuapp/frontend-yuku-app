import * as oat from '@/canisters/yuku-old/yuku_oat';
import { OatCollectionEvent, OatProject, OatWhitelist } from '@/canisters/yuku-old/yuku_oat';
import { ConnectedIdentity } from '@/types/identity';
import { anonymous } from '../../connect/anonymous';
import { getYukuOatCanisterId } from './special';

export type OatEventStatus = 'warm-up' | 'active' | 'warm-up' | 'ended';

export const getOatEventStatus = (event: OatCollectionEvent): OatEventStatus => {
    const now = BigInt(Date.now() * 1e6);
    const { event_start, event_end, oat_release_start, oat_release_end } = event;
    if (now < BigInt(event_start)) {
        return 'warm-up';
    } else if (BigInt(oat_release_start) <= now && now < BigInt(oat_release_end)) {
        return 'active';
    } else if (BigInt(event_start) <= now && now < BigInt(event_end)) {
        return 'warm-up';
    } else if (BigInt(event_end) <= now && now < BigInt(oat_release_start)) {
        return 'warm-up';
    } else if (BigInt(oat_release_end) <= now) {
        return 'ended';
    }
    return 'ended';
};

export const queryAllOatCollectionEventList = async (): Promise<OatCollectionEvent[]> => {
    const backend_canister_id = getYukuOatCanisterId();
    return oat.queryAllOatCollectionEventList(anonymous, backend_canister_id);
};

export const queryOatCollectionEventsByEventId = async (
    event_id_list: string[],
): Promise<OatCollectionEvent[]> => {
    const backend_canister_id = getYukuOatCanisterId();
    return oat.queryOatCollectionEventsByEventId(anonymous, backend_canister_id, event_id_list);
};

export const queryOatCollectionEventsByProjectId = async (
    project_id: string,
): Promise<OatCollectionEvent[]> => {
    const backend_canister_id = getYukuOatCanisterId();
    return oat.queryOatCollectionEventsByProjectId(anonymous, backend_canister_id, project_id);
};

export const queryOatProjectsByProjectId = async (
    project_id_list: string[],
): Promise<OatProject[]> => {
    const backend_canister_id = getYukuOatCanisterId();
    return oat.queryOatProjectsByProjectId(anonymous, backend_canister_id, project_id_list);
};

export const queryClaimableByUser = async (
    identity: ConnectedIdentity,
    event_id: string,
): Promise<boolean> => {
    const backend_canister_id = getYukuOatCanisterId();
    return oat.queryClaimableByUser(identity, backend_canister_id, event_id);
};

export const claimOatNFT = async (
    identity: ConnectedIdentity,
    event_id: string,
): Promise<string> => {
    const backend_canister_id = getYukuOatCanisterId();
    return oat.claimOatNFT(identity, backend_canister_id, event_id);
};

// export const oatAddWhitelist = async (
//     identity: ConnectedIdentity,
//     args: {
//         event_id: string;
//         account_list: string[];
//     },
// ): Promise<void> => {
//     const backend_canister_id = getYukuOatCanisterId();
//     return oat.oatAddWhitelist(identity, backend_canister_id, args);
// };

export const queryOatWhitelist = async (collection: string): Promise<OatWhitelist[]> => {
    const backend_canister_id = getYukuOatCanisterId();
    return oat.queryOatWhitelist(anonymous, backend_canister_id, collection);
};
