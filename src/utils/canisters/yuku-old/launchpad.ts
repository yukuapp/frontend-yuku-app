import * as launchpad from '@/canisters/yuku-old/yuku_launchpad';
import {
    AllLaunchpadCollections,
    LaunchpadCollectionInfo,
} from '@/canisters/yuku-old/yuku_launchpad';
import { ConnectedIdentity } from '@/types/identity';
import { anonymous } from '../../connect/anonymous';
import { getYukuLaunchpadCanisterId } from './special';

export const queryAllLaunchpadCollections = async (): Promise<LaunchpadCollectionInfo[]> => {
    const backend_canister_id = getYukuLaunchpadCanisterId();
    return launchpad.queryAllLaunchpadCollections(anonymous, backend_canister_id);
};
export const queryAllLaunchpadCollectionsWithStatus =
    async (): Promise<AllLaunchpadCollections> => {
        const backend_canister_id = getYukuLaunchpadCanisterId();
        return launchpad.queryAllLaunchpadCollectionsWithStatus(anonymous, backend_canister_id);
    };

export const querySingleLaunchpadCollectionInfo = async (
    collection: string,
): Promise<LaunchpadCollectionInfo | undefined> => {
    const backend_canister_id = getYukuLaunchpadCanisterId();
    return launchpad.querySingleLaunchpadCollectionInfo(anonymous, backend_canister_id, collection);
};

export const queryWhitelistUserRemainAmount = async (
    identity: ConnectedIdentity,
    args: {
        collection: string;
        whitelist_limit: string;
        supply: string;
        remain: string;
        whitelist_supply: string;
    },
): Promise<number> => {
    const backend_canister_id = getYukuLaunchpadCanisterId();
    return launchpad.queryWhitelistUserRemainAmount(identity, backend_canister_id, args);
};

export const queryOpenUserRemainAmount = async (
    identity: ConnectedIdentity,
    args: {
        collection: string;
        open_limit: string;
        supply: string;
        remain: string;
        open_supply: string;
    },
): Promise<number> => {
    const backend_canister_id = getYukuLaunchpadCanisterId();
    return launchpad.queryOpenUserRemainAmount(identity, backend_canister_id, args);
};

export const claimLaunchpadNFT = async (
    identity: ConnectedIdentity,
    height: string,
): Promise<number[]> => {
    const backend_canister_id = getYukuLaunchpadCanisterId();
    return launchpad.claimLaunchpadNFT(identity, backend_canister_id, height);
};

// export const launchpadAddWhitelist = async (
//     identity: ConnectedIdentity,
//     args: {
//         collection: string;
//         account_list: string[];
//     },
// ): Promise<void> => {
//     const backend_canister_id = getYukuLaunchpadCanisterId();
//     return launchpad.launchpadAddWhitelist(identity, backend_canister_id, args);
// };

export const queryLaunchpadWhitelist = async (
    identity: ConnectedIdentity,
    collection: string,
): Promise<number> => {
    const backend_canister_id = getYukuLaunchpadCanisterId();
    return launchpad.queryLaunchpadWhitelist(identity, backend_canister_id, collection);
};
