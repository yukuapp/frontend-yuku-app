import { canisterQueryYukuLaunchpadCollectionsWithStatus } from '@/apis/canister-query/yuku/launchpad';
import { AllLaunchpadCollections } from '@/canisters/yuku-old/yuku_launchpad';
import { queryAllLaunchpadCollectionsWithStatus } from '../../canisters/yuku-old/launchpad';
import { getYukuLaunchpadCanisterId } from '../../canisters/yuku-old/special';

export const combinedQueryLaunchpadCollectionsWithStatus =
    async (): Promise<AllLaunchpadCollections> =>
        new Promise((resolve, reject) => {
            const backend_canister_id = getYukuLaunchpadCanisterId();
            canisterQueryYukuLaunchpadCollectionsWithStatus(backend_canister_id)
                .then(() => {
                    return queryAllLaunchpadCollectionsWithStatus();
                })
                .then(resolve)
                .catch(reject);
        });
