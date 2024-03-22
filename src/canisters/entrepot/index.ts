import { parse_token_identifier } from '@/common/nft/ext';
import { bigint2string, string2bigint } from '@/common/types/bigint';
import { unwrapMotokoResult } from '@/common/types/results';
import { throwsBy } from '@/common/types/variant';
import { throwIdentity } from '@/stores/identity';
import { ConnectedIdentity } from '@/types/identity';
import { NftIdentifier } from '@/types/nft';
import { Listings } from '@/types/yuku';
import { string2array } from '../../common/data/arrays';
import idlFactory from './index.did';
import { _SERVICE, CommonError, Listing, Metadata } from './index.did.d';

const parseEntrepotListings = (
    collection: string,
    listings: [number, Listing, Metadata][],
): Listings[] => {
    return (
        listings
            // Remove locked listings
            .filter(([_, listing]) => !listing.locked[0])
            .map(([id, listing, _]) => {
                return {
                    tokenIdentifier: parse_token_identifier(collection, id),
                    price: bigint2string(listing.price),
                };
            })
    );
};
// ===================== Get listing information for entrepot corresponding to nft =====================
export const queryListings = async (
    identity: ConnectedIdentity,
    collection: string,
): Promise<Listings[]> => {
    const { creator } = identity;
    const actor: _SERVICE = await creator(idlFactory, collection);
    const r = await actor.listings();
    return parseEntrepotListings(collection, r);
};

// ===================== Lock order =====================
export const lockOrder = async (
    identity: ConnectedIdentity,
    args: {
        token_id: NftIdentifier;
        price: string;
    },
): Promise<string> => {
    const { creator } = identity;
    const actor: _SERVICE = await creator(idlFactory, args.token_id.collection);
    throwIdentity(identity);
    const r = await actor.lock(
        args.token_id.token_identifier,
        string2bigint(args.price),
        identity.account!,
        string2array(identity.account!),
    );
    return unwrapMotokoResult<string, CommonError>(
        r,
        throwsBy((e) => `${JSON.stringify(e)}`),
    );
};

// ===================== Trigger nft transfer =====================
export const settleOrder = async (
    identity: ConnectedIdentity,
    args: {
        token_id: NftIdentifier;
    },
): Promise<boolean> => {
    const { creator } = identity;
    const actor: _SERVICE = await creator(idlFactory, args.token_id.collection);
    const r = await actor.settle(args.token_id.token_identifier);
    return !unwrapMotokoResult<null, CommonError>(
        r,
        throwsBy((e) => `${JSON.stringify(e)}`),
    );
};
