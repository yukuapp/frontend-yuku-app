import { parse_token_identifier } from '@/common/nft/ext';
import { bigint2string } from '@/common/types/bigint';
import { unwrapOptionMap } from '@/common/types/options';
import { principal2string, string2principal } from '@/common/types/principal';
import { unwrapMotokoResultMap } from '@/common/types/results';
import { mapping_true, throwsVariantError, unwrapVariantKey } from '@/common/types/variant';
import { ConnectedIdentity } from '@/types/identity';
import { CccProxyNft } from '@/types/nft-standard/ccc';
import idlFactory from './ccc_proxy.did';
import _SERVICE, { FillDepositErr, ReserveDepositErr } from './ccc_proxy.did.d';

export const queryNftDepositor = async (
    identity: ConnectedIdentity,
    backend_canister_id: string,
    args: { collection: string; index: number },
): Promise<string | undefined> => {
    const { creator } = identity;
    const actor: _SERVICE = await creator(idlFactory, backend_canister_id);
    const r = await actor.getDeposit(string2principal(args.collection), args.index);
    return unwrapOptionMap(r, (info) => {
        if (!info.status) return undefined;
        return principal2string(info.deposit);
    });
};

export const beforeDepositingNft = async (
    identity: ConnectedIdentity,
    backend_canister_id: string,
    args: { collection: string; token_index: number },
): Promise<boolean> => {
    const { creator } = identity;
    const actor: _SERVICE = await creator(idlFactory, backend_canister_id);
    const r = await actor.reserveDeposit(string2principal(args.collection), args.token_index);
    return unwrapMotokoResultMap<null, ReserveDepositErr, boolean>(r, mapping_true, (e) => {
        throw new Error(`can not store nft owner: ${unwrapVariantKey(e)}`);
    });
};

export const afterDepositingNft = async (
    identity: ConnectedIdentity,
    backend_canister_id: string,
    args: { collection: string; token_index: number },
): Promise<boolean> => {
    const { creator } = identity;
    const actor: _SERVICE = await creator(idlFactory, backend_canister_id);
    const r = await actor.fillDeposit(string2principal(args.collection), args.token_index);
    return unwrapMotokoResultMap<null, FillDepositErr, boolean>(r, mapping_true, (e) => {
        throw new Error(`can not fill nft owner: ${JSON.stringify(e)}`);
    });
};

export const getAllCccProxyNfts = async (
    identity: ConnectedIdentity,
    backend_canister_id: string,
): Promise<CccProxyNft[]> => {
    const { creator } = identity;
    const actor: _SERVICE = await creator(idlFactory, backend_canister_id);
    const r = await actor.getAllDeposit();
    return r.map((d) => ({
        token_id: {
            collection: d[0],
            token_identifier: parse_token_identifier(d[0], d[1]),
        },
        owner: principal2string(d[2]),
    }));
};

export const retrieveCccNft = async (
    identity: ConnectedIdentity,
    backend_canister_id: string,
    token_identifier: string,
): Promise<boolean> => {
    const { creator } = identity;
    const actor: _SERVICE = await creator(idlFactory, backend_canister_id);
    const r = await actor.withdraw(token_identifier);
    return unwrapMotokoResultMap(r, (n) => bigint2string(n) === '1', throwsVariantError);
};
