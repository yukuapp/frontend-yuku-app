import { isCanisterIdText } from '@/common/ic/principals';
import { SupportedBackend } from '@/types/app';
import { BuildMode } from '@/vite-env';

// Special canisters related to yuku functionality
export type SpecialCanisters = {
    // Known functionalities:
    // 1. Query user's basic information
    // 2. Query current Collection Id // ! Initial canister id
    // 3. Query secondary market Collection Data
    // 4. Query listing information of NFTs except ogy
    yuku_core: string; // ? SHIKU_CANISTER_ID
    // 1. Query user's credit points balance
    yuku_credit_points: string; // ? POINT_CANISTER_ID
    // 1. Query all Artist canisters // ! Initial canister id
    yuku_artist_router: string; // ? ARTIST_ROUTER_CANISTER_ID
    // 1. Query user event records
    yuku_user_record: string; // ? NEW_RECORD_CANISTER_ID
    // 1. Query co-owned related canisters // ! Initial canister id
    yuku_origyn_art: string; // ? ORIGYN_yuku_CANISTER_ID
    // 1. Small skirt voting canister
    yuku_origyn_art_proposal: string;
    // 1. Only NFTs holding CCC can be traded
    yuku_ccc_proxy: string; // ? CCC_PROXY_CANISTER_ID
    // 1. Data related to launchpad
    yuku_launchpad: string; // ? LAUNCHPAD_CANISTER_ID
    // 1. Query available storage canisters
    yuku_application: string; // ? APPLY_CANISTER_ID
    // 1. Query oat canister
    yuku_oat: string; // ? OAT_CANISTER_ID
    // 1. Shiku canister
    yuku_shiku_lands: string; // ? LANDS_CANISTER_ID
    // 1. Generate user jwt token
    yuku_jwt_token: string;

    // 1. Query if user is KYC
    // yuku_kyc: string; // ? KYC_CANISTER_ID
    // yuku_gallery: string; // ? GALLERY_CANISTER_ID
};

// ! Production environment
const canisters_production: SpecialCanisters = {
    yuku_core: 'ajy76-hiaaa-aaaah-aa3mq-cai', // ? SHIKU_CANISTER_ID
    yuku_credit_points: 'l2pzh-6iaaa-aaaah-abhpq-cai', // ? POINT_CANISTER_ID
    yuku_artist_router: 'v32d7-paaaa-aaaah-abc7q-cai', // ? ARTIST_ROUTER_CANISTER_ID
    yuku_user_record: 'sgynd-aaaaa-aaaah-abcnq-cai', // ? NEW_RECORD_CANISTER_ID
    yuku_origyn_art: 'patk5-byaaa-aaaap-aamda-cai', // ? ORIGYN_yuku_CANISTER_ID
    yuku_origyn_art_proposal: 'pm6jg-zqaaa-aaaah-adn5a-cai',
    yuku_ccc_proxy: 'tut64-gqaaa-aaaah-ab2qq-cai', // ? CCC_PROXY_CANISTER_ID
    yuku_launchpad: 'o2qzt-caaaa-aaaah-abhsa-cai', // ? LAUNCHPAD_CANISTER_ID
    yuku_application: 'qhbz2-eiaaa-aaaah-abcaa-cai', // ? APPLY_CANISTER_ID
    yuku_oat: 'xlsz5-7aaaa-aaaah-abfma-cai', // ? OAT_CANISTER_ID
    yuku_shiku_lands: 'vpkok-7aaaa-aaaah-abjna-cai', // ? LANDS_CANISTER_ID
    yuku_jwt_token: 'rsyqn-haaaa-aaaah-adpsa-cai',
    // yuku_kyc: 'ucs6g-wiaaa-aaaah-abwpa-cai', // ? KYC_CANISTER_ID
    // yuku_gallery: string; // ? GALLERY_CANISTER_ID
};

// * Staging environment
const canisters_staging: SpecialCanisters = {
    yuku_core: 'ajy76-hiaaa-aaaah-aa3mq-cai', // ? SHIKU_CANISTER_ID
    yuku_credit_points: 'l2pzh-6iaaa-aaaah-abhpq-cai', // ? POINT_CANISTER_ID
    yuku_artist_router: 'v32d7-paaaa-aaaah-abc7q-cai', // ? ARTIST_ROUTER_CANISTER_ID
    yuku_user_record: 'sgynd-aaaaa-aaaah-abcnq-cai', // ? NEW_RECORD_CANISTER_ID
    yuku_origyn_art: 'patk5-byaaa-aaaap-aamda-cai', // ? ORIGYN_yuku_CANISTER_ID
    yuku_origyn_art_proposal: 'pm6jg-zqaaa-aaaah-adn5a-cai',
    yuku_ccc_proxy: 'tut64-gqaaa-aaaah-ab2qq-cai', // ? CCC_PROXY_CANISTER_ID
    yuku_launchpad: 'o2qzt-caaaa-aaaah-abhsa-cai', // ? LAUNCHPAD_CANISTER_ID
    yuku_application: 'qhbz2-eiaaa-aaaah-abcaa-cai', // ? APPLY_CANISTER_ID
    yuku_oat: 'xlsz5-7aaaa-aaaah-abfma-cai', // ? OAT_CANISTER_ID
    yuku_shiku_lands: 'vpkok-7aaaa-aaaah-abjna-cai', // ? LANDS_CANISTER_ID
    yuku_jwt_token: 'rsyqn-haaaa-aaaah-adpsa-cai',

    // yuku_kyc: 'ucs6g-wiaaa-aaaah-abwpa-cai', // ? KYC_CANISTER_ID
    // yuku_gallery: string; // ? GALLERY_CANISTER_ID
};

// ? Test environment
const canisters_test: SpecialCanisters = {
    yuku_core: 'ajy76-hiaaa-aaaah-aa3mq-cai', // ? SHIKU_CANISTER_ID
    yuku_credit_points: 'l2pzh-6iaaa-aaaah-abhpq-cai', // ? POINT_CANISTER_ID
    yuku_artist_router: 'v32d7-paaaa-aaaah-abc7q-cai', // ? ARTIST_ROUTER_CANISTER_ID
    yuku_user_record: 'sgynd-aaaaa-aaaah-abcnq-cai', // ? NEW_RECORD_CANISTER_ID
    yuku_origyn_art: 'patk5-byaaa-aaaap-aamda-cai', // ? ORIGYN_yuku_CANISTER_ID
    yuku_origyn_art_proposal: 'pm6jg-zqaaa-aaaah-adn5a-cai',
    yuku_ccc_proxy: 'tut64-gqaaa-aaaah-ab2qq-cai', // ? CCC_PROXY_CANISTER_ID
    yuku_launchpad: 'o2qzt-caaaa-aaaah-abhsa-cai', // ? LAUNCHPAD_CANISTER_ID
    yuku_application: 'qhbz2-eiaaa-aaaah-abcaa-cai', // ? APPLY_CANISTER_ID
    yuku_oat: 'xlsz5-7aaaa-aaaah-abfma-cai', // ? OAT_CANISTER_ID
    yuku_shiku_lands: 'vpkok-7aaaa-aaaah-abjna-cai', // ? LANDS_CANISTER_ID
    yuku_jwt_token: 'rsyqn-haaaa-aaaah-adpsa-cai',

    // yuku_kyc: 'uftys-3qaaa-aaaah-abwpq-cai', // ? KYC_CANISTER_ID
    // yuku_gallery: string; // ? GALLERY_CANISTER_ID
};

const checkText = (canisters: SpecialCanisters, mode: SupportedBackend) => {
    for (const key in canisters) {
        let canister_id = canisters[key];
        if (key.startsWith('ledger')) canister_id = canister_id.canister_id;
        if (!isCanisterIdText(canister_id)) {
            throw new Error(`special canisters error: ${mode} => ${key} => ${canister_id}`);
        }
    }
};

checkText(canisters_production, 'production');
checkText(canisters_staging, 'staging');
checkText(canisters_test, 'test');

export const findSpecialCanisters = (
    mode: BuildMode,
    backendType: SupportedBackend,
): SpecialCanisters => {
    if (mode === 'production') return canisters_production;
    if (mode === 'staging') return canisters_staging;
    if (mode === 'test') return canisters_test;

    // Development build can freely configure the backend
    switch (backendType) {
        case 'production':
            return canisters_production;
        case 'staging':
            return canisters_staging;
        case 'test':
            return canisters_test;
    }
    throw new Error(`can not find special canisters: ${backendType}`);
};
