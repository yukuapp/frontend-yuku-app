import * as user_record from '@/canisters/yuku-old/yuku_user_record';
import { UserActivity } from '@/canisters/yuku-old/yuku_user_record';
import { anonymous } from '../../connect/anonymous';
import { getYukuUserRecordCanisterId } from './special';

export const queryAllUserActivityList = async (account: string): Promise<UserActivity[]> => {
    const backend_canister_id = getYukuUserRecordCanisterId();
    return user_record.queryAllUserActivityList(anonymous, backend_canister_id, account);
};
