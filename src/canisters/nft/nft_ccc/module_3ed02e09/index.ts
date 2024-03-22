import _ from 'lodash';
import { principal2account } from '@/common/ic/account';
import { parse_token_identifier } from '@/common/nft/ext';
import { bigint2string } from '@/common/types/bigint';
import { unwrapOption } from '@/common/types/options';
import { principal2string, string2principal } from '@/common/types/principal';
import { ConnectedIdentity } from '@/types/identity';
import { NftTokenMetadata, NftTokenOwner } from '@/types/nft';
import { CoreCollectionData } from '@/types/yuku';
import { innerParsingTransferFromResult, innerQueryAllTokenMetadataByCccLink } from '..';
import idlFactory from './ccc_3ed02e09.did';
import _SERVICE from './ccc_3ed02e09.did.d';

// =========================== Query all owners of tokens with CCC standard ===========================

export const queryAllTokenOwnersByCcc = async (
    identity: ConnectedIdentity,
    collection: string,
): Promise<NftTokenOwner[]> => {
    const { creator } = identity;
    const actor: _SERVICE = await creator(idlFactory, collection);
    const r = await actor.getRegistry();
    const rr = _.sortBy(r, [(s) => Number(s[1][0].index)]);
    return rr
        .flatMap((s) =>
            s[1].map((token) => ({
                owner: s[0],
                token,
            })),
        )
        .map((s) => {
            const index = Number(bigint2string(s.token.index));
            return {
                token_id: {
                    collection,
                    token_identifier: parse_token_identifier(collection, index),
                },
                owner: principal2account(principal2string(s.owner)),
                raw: {
                    standard: 'ccc',
                    data: {
                        owner: principal2string(s.owner),
                        other: {
                            type: collection as 'o7ehd-5qaaa-aaaah-qc2zq-cai',
                            photoLink: unwrapOption(s.token.photoLink),
                            videoLink: unwrapOption(s.token.videoLink),
                            index: bigint2string(s.token.index),
                        },
                    },
                },
            };
        });
};

// =========================== Query all token metadata with EXT standard ===========================

export const queryAllTokenMetadataByCcc = async (
    identity: ConnectedIdentity,
    collection: string,
    token_owners: NftTokenOwner[],
    collection_data?: CoreCollectionData,
): Promise<NftTokenMetadata[]> => {
    return innerQueryAllTokenMetadataByCccLink(identity, collection, token_owners, collection_data);
};

// =========================== Get the minter of CCC standard ===========================

export const queryCollectionNftMinterByCcc = async (
    identity: ConnectedIdentity,
    collection: string,
): Promise<string> => {
    const { creator } = identity;
    const actor: _SERVICE = await creator(idlFactory, collection);
    const r = await actor.getRoyaltyFeeTo();
    return principal2string(r);
};

// =========================== Transfer ===========================

export const transferFrom = async (
    identity: ConnectedIdentity,
    collection: string,
    args: {
        owner: string; // ? principal -> string
        token_index: number;
        to: string; // ? principal -> string
    },
): Promise<boolean> => {
    const { creator } = identity;
    const actor: _SERVICE = await creator(idlFactory, collection);
    const r = await actor.transferFrom(
        string2principal(args.owner),
        string2principal(args.to),
        BigInt(args.token_index),
    );
    return innerParsingTransferFromResult(args.token_index, r);
};

export default {
    queryAllTokenOwnersByCcc,
    queryAllTokenMetadataByCcc,
    queryCollectionNftMinterByCcc,
    transferFrom,
};
