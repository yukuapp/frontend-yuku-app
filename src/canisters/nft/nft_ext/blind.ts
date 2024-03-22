import { ConnectedIdentity } from '@/types/identity';
import { NftTokenMetadata } from '@/types/nft';
import * as blind from './ext_blind';

// ===================== Query Blind Box Open Time =====================

export const queryBlindBoxOpenTime = async (
    identity: ConnectedIdentity,
    collection: string,
): Promise<string> => {
    return blind.queryBlindBoxOpenTime(identity, collection);
};

// ===================== Open Blind Box =====================

export const openBlindBox = async (
    identity: ConnectedIdentity,
    collection: string,
    token_identifier: string,
): Promise<NftTokenMetadata> => {
    return blind.openBlindBox(identity, collection, token_identifier);
};
