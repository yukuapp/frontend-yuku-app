import {
    canisterQueryYukuCoreCollectionDataList,
    canisterQueryYukuCoreCollectionIdList,
    canisterQueryYukuCorePlatformFee,
} from '@/apis/canister-query/yuku/core';
import { YukuPlatformFee } from '@/canisters/yuku-old/yuku_core';
import { CoreCollectionData } from '@/types/yuku';
import {
    queryCoreCollectionDataListByBackend,
    queryCoreCollectionIdListByBackend,
    queryYukuPlatformFeeByBackend,
} from '../../canisters/yuku-old/core';
import { getYukuCoreCanisterId } from '../../canisters/yuku-old/special';

export const combinedQueryCoreCollectionIdList = async (
    backend_canister_id: string,
): Promise<string[]> =>
    new Promise((resolve, reject) => {
        canisterQueryYukuCoreCollectionIdList(backend_canister_id)
            .then((d) => {
                if (d) return d;
                return queryCoreCollectionIdListByBackend(backend_canister_id);
            })
            .then(resolve)
            .catch(reject);
    });

export const combinedQueryCoreCollectionDataList = async (
    backend_canister_id: string,
): Promise<CoreCollectionData[]> =>
    new Promise((resolve, reject) => {
        canisterQueryYukuCoreCollectionDataList(backend_canister_id)
            .then((d) => {
                if (d) return d;
                return queryCoreCollectionDataListByBackend(backend_canister_id);
            })
            .then(resolve)
            .catch(reject);
    });

export const combinedQueryCorePlatformFee = async (): Promise<YukuPlatformFee> =>
    new Promise((resolve, reject) => {
        const backend_canister_id = getYukuCoreCanisterId();
        canisterQueryYukuCorePlatformFee(backend_canister_id)
            .then((d) => {
                if (d) return d;
                return queryYukuPlatformFeeByBackend(backend_canister_id);
            })
            .then(resolve)
            .catch(reject);
    });
