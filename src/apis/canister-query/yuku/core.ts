import { YukuPlatformFee } from '@/canisters/yuku-old/yuku_core';
import { CoreCollectionData } from '@/types/yuku';
import { CANISTER_QUERY_HOST } from '../host';
import { canister_query } from '../query';

export const canisterQueryYukuCoreCollectionIdList = async (
    backend_canister_id: string,
): Promise<string[] | undefined> =>
    canister_query(`${CANISTER_QUERY_HOST}/yuku/core/${backend_canister_id}/collection_id`);

export const canisterQueryYukuCoreCollectionDataList = async (
    backend_canister_id: string,
): Promise<CoreCollectionData[] | undefined> =>
    canister_query(`${CANISTER_QUERY_HOST}/yuku/core/${backend_canister_id}/collection_data`);

export const canisterQueryYukuCorePlatformFee = async (
    backend_canister_id: string,
): Promise<YukuPlatformFee | undefined> =>
    canister_query(`${CANISTER_QUERY_HOST}/yuku/core/${backend_canister_id}/platform_fee`);
