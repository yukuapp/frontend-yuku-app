import { AllLaunchpadCollections } from '@/canisters/yuku-old/yuku_launchpad';
import { CANISTER_QUERY_HOST } from '../host';
import { canister_query } from '../query';

export const canisterQueryYukuLaunchpadCollectionsWithStatus = async (
    backend_canister_id: string,
): Promise<AllLaunchpadCollections | undefined> =>
    canister_query(
        `${CANISTER_QUERY_HOST}/yuku/launchpad/${backend_canister_id}/collections/status`,
    );
