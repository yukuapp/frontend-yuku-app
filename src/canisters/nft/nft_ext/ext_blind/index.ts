import { bigint2string } from '@/common/types/bigint';
import { unwrapOption } from '@/common/types/options';
import { unwrapMotokoResultMap } from '@/common/types/results';
import { throwsBy, unwrapVariant2Map } from '@/common/types/variant';
import { ConnectedIdentity } from '@/types/identity';
import { NftTokenMetadata } from '@/types/nft';
import { parseExtTokenMetadata } from '..';
import idlFactory from './ext_blind.did';
import _SERVICE, { CommonError, Metadata } from './ext_blind.did.d';

// ===================== Query Opening Time of Blind Box =====================

export const queryBlindBoxOpenTime = async (
    identity: ConnectedIdentity,
    collection: string,
): Promise<string> => {
    const { creator } = identity;
    const actor: _SERVICE = await creator(idlFactory, collection);
    const r = await actor.getOpenTime();
    return bigint2string(r);
};

// ===================== Open Blind Box =====================

export const openBlindBox = async (
    identity: ConnectedIdentity,
    collection: string,
    token_identifier: string,
): Promise<NftTokenMetadata> => {
    const { creator } = identity;
    const actor: _SERVICE = await creator(idlFactory, collection);
    const result = await actor.open(token_identifier);
    const metadata = unwrapMotokoResultMap<Metadata, CommonError, number[] | undefined>(
        result,
        (data) => {
            return unwrapVariant2Map(
                data,
                ['fungible', throwsBy(`fungible token is not support`)],
                ['nonfungible', (n) => unwrapOption(n.metadata)],
            );
        },
        (e) => {
            if (e['InvalidToken']) throw new Error(`InvalidToken: ${e['InvalidToken']}`);
            if (e['Other']) throw new Error(`Other: ${e['Other']}`);
            throw new Error(`open blind box failed`);
        },
    );
    return parseExtTokenMetadata(collection, token_identifier, metadata);
};
