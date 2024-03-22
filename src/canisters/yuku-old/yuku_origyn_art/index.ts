import { ConnectedIdentity } from '@/types/identity';
import { TokenInfo } from '@/types/nft';
import module_6a35faf5 from './module_6a35faf5';
import module_1335f1e9 from './module_1335f1e9';
import { CollectionMetadata } from './module_1335f1e9/origyn_art_1335f1e9.did.d';

const MAPPING_MODULES = {
    ['6a35faf529f935f18bec0142d6c4ba117ccd82f13817fca458eb059f8cbf084f']: module_6a35faf5,
    ['1335f1e979640d0ef06d6c7efbac4a2c335a03ed79785bbd10d1ae47cab1c5e7']: module_1335f1e9,
};

const MAPPING_CANISTERS: Record<
    string,
    | '6a35faf529f935f18bec0142d6c4ba117ccd82f13817fca458eb059f8cbf084f'
    | '6a35faf529f935f18bec0142d6c4ba117ccd82f13817fca458eb059f8cbf084f'
    | '1335f1e979640d0ef06d6c7efbac4a2c335a03ed79785bbd10d1ae47cab1c5e7'
> = {
    ['od7d3-vaaaa-aaaap-aamfq-cai']:
        '6a35faf529f935f18bec0142d6c4ba117ccd82f13817fca458eb059f8cbf084f',

    ['owysw-uiaaa-aaaap-aamga-cai']:
        '6a35faf529f935f18bec0142d6c4ba117ccd82f13817fca458eb059f8cbf084f',

    ['patk5-byaaa-aaaap-aamda-cai']:
        '1335f1e979640d0ef06d6c7efbac4a2c335a03ed79785bbd10d1ae47cab1c5e7',
};

for (const key of Object.keys(MAPPING_CANISTERS)) {
    const module = MAPPING_CANISTERS[key];
    if (!MAPPING_MODULES[module]) {
        console.error('Yuku origyn art canister is not implement', key, module);
    }
}
const getModule = (collection: string) => {
    const module_hex = MAPPING_CANISTERS[collection];
    if (module_hex === undefined)
        throw new Error(`unknown Yuku origyn art canister id: ${collection}`);
    const module = MAPPING_MODULES[module_hex];
    if (module === undefined) throw new Error(`unknown Yuku origyn art canister id: ${collection}`);
    return module;
};

export const queryOrigynArtCollectionIdList = async (
    identity: ConnectedIdentity,
    backend_canister_id: string,
): Promise<string[]> => {
    const module = getModule(backend_canister_id);
    return module.queryOrigynArtCollectionIdList(identity, backend_canister_id);
};

export const queryOrigynArtSupportedTokens = async (
    identity: ConnectedIdentity,
    backend_canister_id: string,
): Promise<TokenInfo[]> => {
    const module = getModule(backend_canister_id);
    return module.queryOrigynArtSupportedTokens(identity, backend_canister_id);
};

export const queryOrigynArtMarketCollectionIdList = async (
    identity: ConnectedIdentity,
    backend_canister_id: string,
): Promise<string[]> => {
    const module = getModule(backend_canister_id);
    return module.queryOrigynArtMarketCollectionIdList(identity, backend_canister_id);
};

export type OrigynArtCollectionData = {
    collection: string;
    metadata: CollectionMetadata;
};

export const queryOrigynArtMarketCollectionDataList = async (
    identity: ConnectedIdentity,
    backend_canister_id: string,
): Promise<OrigynArtCollectionData[]> => {
    const module = getModule(backend_canister_id);
    return module.queryOrigynArtCollectionDataList(identity, backend_canister_id);
};
