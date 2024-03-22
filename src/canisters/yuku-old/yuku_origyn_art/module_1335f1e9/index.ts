import { bigint2string } from '@/common/types/bigint';
import { unwrapOptionMap } from '@/common/types/options';
import { principal2string } from '@/common/types/principal';
import { unwrapVariantKey } from '@/common/types/variant';
import { ConnectedIdentity } from '@/types/identity';
import { TokenInfo, TokenStandard } from '@/types/nft';
import { OrigynArtCollectionData } from '..';
import idlFactory from './origyn_art_1335f1e9.did';
import _SERVICE from './origyn_art_1335f1e9.did';

export const queryOrigynArtCollectionIdList = async (
    identity: ConnectedIdentity,
    backend_canister_id: string,
): Promise<string[]> => {
    const { creator } = identity;
    const actor: _SERVICE = await creator(idlFactory, backend_canister_id);
    const r = await actor.listPrimarySale();
    return r.flatMap((p) => [
        principal2string(p.egg_canister),
        principal2string(p.fraction_canister),
    ]);
};

export const queryOrigynArtSupportedTokens = async (
    identity: ConnectedIdentity,
    backend_canister_id: string,
): Promise<TokenInfo[]> => {
    const { creator } = identity;
    const actor: _SERVICE = await creator(idlFactory, backend_canister_id);
    const r = await actor.listSupportedTokens();

    return r.map((d) => ({
        id: unwrapOptionMap(d.id, bigint2string), // ? bigint -> string
        symbol: d.symbol,
        canister: principal2string(d.canister), // ? principal -> string
        standard: { type: unwrapVariantKey(d.standard) } as TokenStandard,
        decimals: bigint2string(d.decimals), // ? bigint -> string
        fee: unwrapOptionMap(d.fee, bigint2string), // ? bigint -> string
    }));
};

export const queryOrigynArtMarketCollectionIdList = async (
    identity: ConnectedIdentity,
    backend_canister_id: string,
): Promise<string[]> => {
    const { creator } = identity;
    const actor: _SERVICE = await creator(idlFactory, backend_canister_id);
    const r = await actor.listOgyCanisters();

    return r.map(principal2string);
};

export const queryOrigynArtCollectionDataList = async (
    identity: ConnectedIdentity,
    backend_canister_id: string,
): Promise<OrigynArtCollectionData[]> => {
    const { creator } = identity;
    const actor: _SERVICE = await creator(idlFactory, backend_canister_id);
    const r = await actor.listCollections();

    return r.map((d) => ({
        collection: principal2string(d[0]),
        metadata: d[1],
    }));
};

export default {
    queryOrigynArtCollectionIdList,
    queryOrigynArtSupportedTokens,
    queryOrigynArtMarketCollectionIdList,
    queryOrigynArtCollectionDataList,
};
