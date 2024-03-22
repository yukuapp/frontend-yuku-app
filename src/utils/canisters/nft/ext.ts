import * as ext from '@/canisters/nft/ext';
import * as blind from '@/canisters/nft/nft_ext/blind';
import { ConnectedIdentity } from '@/types/identity';
import { ExtUser } from '@/types/nft-standard/ext';
import { anonymous } from '../../connect/anonymous';

export const allowance = async (
    collection: string,
    args: {
        token_identifier: string;
        owner: ExtUser;
        spender: string;
    },
): Promise<boolean> => {
    return ext.allowance(anonymous, collection, args);
};

export const approve = async (
    identity: ConnectedIdentity,
    collection: string,
    args: {
        token_identifier: string;
        spender: string;
        subaccount?: number[];
    },
): Promise<boolean> => {
    return ext.approve(identity, collection, args);
};

export const transferFrom = async (
    identity: ConnectedIdentity,
    collection: string,
    args: {
        token_identifier: string;
        from: ExtUser;
        to: ExtUser;
        subaccount?: number[];
        memo?: number[];
    },
): Promise<boolean> => {
    return ext.transferFrom(identity, collection, args);
};

export const queryBlindBoxOpenTime = async (collection: string): Promise<string> => {
    return blind.queryBlindBoxOpenTime(anonymous, collection);
};
