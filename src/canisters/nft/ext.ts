import { parse_token_index_with_checking } from '@/common/nft/ext';
import { ConnectedIdentity } from '@/types/identity';
import { ExtUser } from '@/types/nft-standard/ext';
import * as ccc from './nft_ccc';
import * as ext from './nft_ext';
import * as icnaming from './nft_icnaming';
import { NFT_CCC, NFT_EXT_WITHOUT_APPROVE, NFT_ICNAMING } from './special';

// =========================== Authorization Verification ===========================
// Each standard requires a different method
export const allowance = async (
    identity: ConnectedIdentity,
    collection: string,
    args: {
        token_identifier: string;
        owner: ExtUser;
        spender: string;
    },
): Promise<boolean> => {
    try {
        // If it is the CCC standard
        if (NFT_CCC.includes(collection)) {
            throw new Error("ccc nft has no method 'allowance'");
        }
        // If it is the ICNAMING standard
        if (NFT_ICNAMING.includes(collection)) {
            return await icnaming.allowance(identity, collection, args);
        }

        // If it is the EXT standard, but does not have the allowance method
        if (NFT_EXT_WITHOUT_APPROVE.includes(collection)) {
            throw new Error("ext nft but has no method 'allowance'");
        }

        // Use the EXT standard by default
        return await ext.allowance(identity, collection, args);
    } catch (e) {
        throw new Error(`allowance,${collection},${args},e: ${e}`);
    }
};

// =========================== Authorization ===========================

// Each standard requires a different method
export const approve = async (
    identity: ConnectedIdentity,
    collection: string,
    args: {
        token_identifier: string;
        spender: string;
        subaccount?: number[];
    },
): Promise<boolean> => {
    try {
        // If it is the CCC standard
        if (NFT_CCC.includes(collection)) {
            throw new Error("ccc nft has no method 'approve'");
        }
        // If it is the ICNAMING standard
        if (NFT_ICNAMING.includes(collection)) {
            return await icnaming.approve(identity, collection, args);
        }

        // If it is the EXT standard, but does not have the approve method
        if (NFT_EXT_WITHOUT_APPROVE.includes(collection)) {
            throw new Error("ext nft but has no method 'approve'");
        }

        // Use the EXT standard by default
        return await ext.approve(identity, collection, args);
    } catch (e) {
        throw new Error(`'approve: ', ${JSON.stringify({ collection, args, e })}`);
    }
};

// =========================== Transfer ===========================

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
    try {
        // If it is the CCC standard
        if (NFT_CCC.includes(collection)) {
            if (args.from.principal === undefined) {
                throw new Error(`ccc NFT must be principal`);
            }
            if (args.to.principal === undefined) {
                throw new Error(`ccc NFT must be principal`);
            }
            return await ccc.transferFrom(identity, collection, {
                owner: args.from.principal,
                token_index: parse_token_index_with_checking(collection, args.token_identifier),
                to: args.to.principal,
            });
        }
        // If it is the ICNAMING standard
        if (NFT_ICNAMING.includes(collection)) {
            return await icnaming.transferFrom(identity, collection, args);
        }

        // Use the EXT standard by default
        return await ext.transferFrom(identity, collection, args);
    } catch (e) {
        throw new Error(`transferFrom, ${collection}, ${args}, ${e}`);
    }
};
