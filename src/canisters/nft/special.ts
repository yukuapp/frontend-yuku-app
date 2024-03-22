import { parse_nft_identifier } from '@/common/nft/ext';
import { parseTokenIndex } from '@/common/nft/identifier';
import { NftTokenMetadata } from '@/types/nft';

export const NFT_ICNAMING = [
    'ft6xr-taaaa-aaaam-aafmq-cai', // Production environment
    'ecujo-liaaa-aaaam-aafja-cai', // ? Test environment
];

export const NFT_CCC = [
    'bjcsj-rqaaa-aaaah-qcxqq-cai', // ! Production environment
    'ml2cx-yqaaa-aaaah-qc2xq-cai', // ! Production environment
    'o7ehd-5qaaa-aaaah-qc2zq-cai', // ! Production environment
    'nusra-3iaaa-aaaah-qc2ta-cai', // ! Production environment DMail
];

// ! entrepot has not implemented the approve method for some standards, so we need to follow the proxy of the ccc standard
export const NFT_EXT_WITHOUT_APPROVE = [
    'oeee4-qaaaa-aaaak-qaaeq-cai',
    'pk6rk-6aaaa-aaaae-qaazq-cai',
    'bzsui-sqaaa-aaaah-qce2a-cai',
    'dhiaa-ryaaa-aaaae-qabva-cai',
    'skjpp-haaaa-aaaae-qac7q-cai',
    'rw623-hyaaa-aaaah-qctcq-cai',
    'bxdf4-baaaa-aaaah-qaruq-cai',
    'e3izy-jiaaa-aaaah-qacbq-cai',
    'yrdz3-2yaaa-aaaah-qcvpa-cai',
    '3mttv-dqaaa-aaaah-qcn6q-cai',
    'gtb2b-tiaaa-aaaah-qcxca-cai',
    '5movr-diaaa-aaaak-aaftq-cai',
    '3vdxu-laaaa-aaaah-abqxa-cai',
    '4ggk4-mqaaa-aaaae-qad6q-cai',
    'j3dqa-byaaa-aaaah-qcwfa-cai',
    'txr2a-fqaaa-aaaah-qcmkq-cai',
    '3bqt5-gyaaa-aaaah-qcvha-cai',
    'rw7qm-eiaaa-aaaak-aaiqq-cai',
    '4fcza-biaaa-aaaah-abi4q-cai',
    'jv55j-riaaa-aaaal-abvnq-cai',
    '6wih6-siaaa-aaaah-qczva-cai',
    'er7d4-6iaaa-aaaaj-qac2q-cai',
    'zvycl-fyaaa-aaaah-qckmq-cai',
    't2mog-myaaa-aaaal-aas7q-cai',
    '2glp2-eqaaa-aaaak-aajoa-cai',
    '2v5zm-uaaaa-aaaae-qaewa-cai',
    'unssi-hiaaa-aaaah-qcmya-cai',
    'sr4qi-vaaaa-aaaah-qcaaq-cai',
    'mk3kn-pyaaa-aaaah-qcoda-cai',
    'u2kyg-aaaaa-aaaag-qc5ja-cai',
    'nbg4r-saaaa-aaaah-qap7a-cai',
    '2l7rh-eiaaa-aaaah-qcvaa-cai',
    't2mog-myaaa-aaaal-aas7q-cai',
    'jeghr-iaaaa-aaaah-qco7q-cai',
    'gevsk-tqaaa-aaaah-qaoca-cai',
    'q6hjz-kyaaa-aaaah-qcama-cai',
    'umqto-nyaaa-aaaah-abwoa-cai',
    'z7mqv-liaaa-aaaah-qcnqa-cai',
    'n6bj5-ryaaa-aaaan-qaaqq-cai',
    '2wucc-5yaaa-aaaal-qb4xa-cai',
    '6km5p-fiaaa-aaaah-qczxa-cai',
    'ri5pt-5iaaa-aaaan-qactq-cai',
    'erpx2-pyaaa-aaaah-qcqsq-cai',
    'qbc6i-daaaa-aaaah-qcywq-cai',
    'bx6pk-jqaaa-aaaag-qbjpa-cai',
    'rqiax-3iaaa-aaaah-qcyta-cai',
    'jntyp-yiaaa-aaaah-qcr3q-cai',
    'po6n2-uiaaa-aaaaj-qaiua-cai',
    'bapzn-kiaaa-aaaam-qaiva-cai',
    'x4oqm-bqaaa-aaaam-qahaq-cai',
    'hihui-daaaa-aaaag-qbckq-cai',
    'qjwjm-eaaaa-aaaah-qctga-cai',
    't555s-uyaaa-aaaal-qbjsa-cai',
    'k5osr-jyaaa-aaaam-qaoxq-cai',
    'xcep7-sqaaa-aaaah-qcukq-cai',
    'cxlb5-5qaaa-aaaam-qaxya-cai',
    'xphpx-xyaaa-aaaah-qcmta-cai',
    'poyn6-dyaaa-aaaah-qcfzq-cai',
    'k4p2l-6qaaa-aaaam-qa2da-cai',
    'sjybn-raaaa-aaaah-qcy2q-cai',
    'ahl3d-xqaaa-aaaaj-qacca-cai',
    'eejma-naaaa-aaaak-aalda-cai',
    'xzxhy-oiaaa-aaaah-qclnq-cai',
    'gikg4-eaaaa-aaaam-qaieq-cai',
    '3cjkh-tqaaa-aaaam-qan6a-cai',
    'y3b7h-siaaa-aaaah-qcnwa-cai',
    'y2ga5-lyaaa-aaaae-qae2q-cai',
    'owuqd-dyaaa-aaaah-qapxq-cai',
    'ehr7n-3yaaa-aaaam-qaiia-cai',
    'uu6bm-5qaaa-aaaag-qccnq-cai',
    'i5a2q-4yaaa-aaaam-qafla-cai',
    'cchps-gaaaa-aaaak-qasaa-cai',
    '3ifmd-wqaaa-aaaah-qckda-cai',
    'tde7l-3qaaa-aaaah-qansa-cai',
    'gyuaf-kqaaa-aaaah-qceka-cai',
    'ctt6t-faaaa-aaaah-qcpbq-cai',
    '7gvfz-3iaaa-aaaah-qcsbq-cai',
    'lcgbg-kaaaa-aaaam-qaota-cai',
    'v3b6z-ziaaa-aaaam-qam4q-cai',
    '527xj-ziaaa-aaaah-qcz7a-cai',
    '7mi54-4iaaa-aaaag-qcxga-cai',
    'lisfk-jqaaa-aaaag-qb37q-cai',
    'tgwaz-xyaaa-aaaah-qcura-cai',
    '2s2iy-xaaaa-aaaah-qczoq-cai',
    'kss7i-hqaaa-aaaah-qbvmq-cai',
    'lxmol-ciaaa-aaaak-abpdq-cai',
    'zhibq-piaaa-aaaah-qcvka-cai',
    '556r5-uqaaa-aaaah-qcz7q-cai',
    '5h2fc-zaaaa-aaaah-qcnjq-cai',
    'iih5p-qqaaa-aaaag-qbxyq-cai',
    'rxrsz-5aaaa-aaaam-qaysa-cai',
    'mytl6-dyaaa-aaaag-qbdua-cai',
    'k4qsa-4aaaa-aaaah-qbvnq-cai',
    '73xld-saaaa-aaaah-qbjya-cai',
    'lix2q-6yaaa-aaaal-qdbaa-cai',
    '5izaq-vyaaa-aaaah-qcz4a-cai',
    'llf4i-riaaa-aaaag-qb4cq-cai',
    'nf35t-jqaaa-aaaag-qbp4q-cai',
    's36wu-5qaaa-aaaah-qcyzq-cai',
    'o6lzt-kiaaa-aaaag-qbdza-cai',
    '2iiif-4qaaa-aaaah-qcs5a-cai',
    '6imyv-myaaa-aaaah-qcv3a-cai',
    '3n4nf-uiaaa-aaaag-qbu6a-cai',
    'zejmq-rqaaa-aaaah-qcnsq-cai',
    'k4qsa-4aaaa-aaaah-qbvnq-cai',
];

export const NFT_OGY_BUTTERFLY = [
    'j2zek-uqaaa-aaaal-acoxa-cai', // ! Production environment
    's5eo5-gqaaa-aaaag-qa3za-cai', // ! Production environment
    '2l7gd-5aaaa-aaaak-qcfvq-cai', // ? Test environment
];

// =========================== Some canisters are no longer supported, so we need to filter them out ===========================

const NOT_SUPPORTED_CANISTER = [
    'xzrh4-zyaaa-aaaaj-qagaa-cai', // ! nft gaga canister, has been removed
];

// Some canister resources have been removed, so we need to replace them with new resources
const SOURCE_BROKEN_CANISTER: Record<string, { origin: string; new: string }> = {
    'o7ehd-5qaaa-aaaah-qc2zq-cai': {
        origin: 'https://gateway.filedrive.io/ipfs/',
        new: 'https://nftstorage.link/ipfs/',
    }, // !ICycle Skull's resources have been deleted and need to be replaced
};
export const ENTREPOT_METADATA_TOKEN_INDEX: Record<string, string> = {
    'jeghr-iaaaa-aaaah-qco7q-cai': 'https://fl5nr-xiaaa-aaaai-qbjmq-cai.raw.icp0.io/nft', // ? ICTurtles
    'q6hjz-kyaaa-aaaah-qcama-cai': 'https://f2yud-3iaaa-aaaaf-qaehq-cai.raw.icp0.io/Token', // ? ICPBunny
    'bxdf4-baaaa-aaaah-qaruq-cai': 'https://qcg3w-tyaaa-aaaah-qakea-cai.raw.ic0.app/Token', // ? ICPunks
};
// ! entrepot thumbnail is missing
export const ENTREPOT_URL_EQUAL_THUMB = [
    '4fcza-biaaa-aaaah-abi4q-cai', //Finterest EA Card
];

export const replaceOrigin = (collection: string, data?: NftTokenMetadata[]) => {
    // Replace resource origin for special canisters
    if (SOURCE_BROKEN_CANISTER[collection]) {
        const { origin, new: new_origin } = SOURCE_BROKEN_CANISTER[collection];
        data?.forEach((n) => {
            if (n.metadata) {
                n.metadata.thumb = n.metadata.thumb.replace(origin, new_origin);
                n.metadata.url = n.metadata.url.replace(origin, new_origin);
                n.metadata.onChainUrl = n.metadata.onChainUrl.replace(origin, new_origin);
            }
        });
    }
    if (ENTREPOT_METADATA_TOKEN_INDEX[collection]) {
        const src = ENTREPOT_METADATA_TOKEN_INDEX[collection];
        data?.forEach((n) => {
            if (n.metadata) {
                n.metadata.thumb = `${src}/${parseTokenIndex(n.token_id)}`;
                n.metadata.url = n.metadata.thumb;
                n.metadata.onChainUrl = n.metadata.thumb;
            }
        });
    }
    if (ENTREPOT_URL_EQUAL_THUMB.includes(collection)) {
        data?.forEach((n) => {
            if (n.metadata) {
                n.metadata.thumb = n.metadata.url;
            }
        });
    }
};
export const filterNotSupportedTokenIdentifier = (token_identifier: string): boolean => {
    const token_id = parse_nft_identifier(token_identifier);
    if (NOT_SUPPORTED_CANISTER.includes(token_id.collection)) {
        return false;
    }
    return true;
};

export const filterOgyTokenIdentifier = (token_identifier: string): boolean => {
    const token_id = parse_nft_identifier(token_identifier);
    if (NFT_OGY_BUTTERFLY.includes(token_id.collection)) {
        return false;
    }
    return true;
};
