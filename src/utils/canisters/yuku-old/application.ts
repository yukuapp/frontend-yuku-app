import * as application from '@/canisters/yuku-old/yuku_application';
import { AppAnnouncement, Apply2ArtistFormData } from '@/canisters/yuku-old/yuku_application';
import { ConnectedIdentity } from '@/types/identity';
import { anonymous } from '../../connect/anonymous';
import { getYukuApplicationCanisterId } from './special';

export const queryBucketId = async (): Promise<string> => {
    const backend_canister_id = getYukuApplicationCanisterId();
    return application.queryBucketId(anonymous, backend_canister_id);
};

export const apply2Artist = async (
    identity: ConnectedIdentity,
    args: Apply2ArtistFormData,
): Promise<boolean> => {
    const backend_canister_id = getYukuApplicationCanisterId();
    return application.apply2Artist(identity, backend_canister_id, args);
};

export const queryAnnouncementList = async (): Promise<AppAnnouncement[]> => {
    const backend_canister_id = getYukuApplicationCanisterId();
    return application.queryAnnouncementList(anonymous, backend_canister_id);
};
