import { isCanisterIdText } from '@/common/ic/principals';
import { SupportedBackend } from '@/types/app';
import { BuildMode } from '@/vite-env';

// yuku related canisters
export type SpecialYukuCanisters = {
    yuku_business: string;
};

// ! Production environment
const canisters_production: SpecialYukuCanisters = {
    yuku_business: 'bc7rk-eyaaa-aaaai-qpdna-cai', // ? YUKU_BUSINESS_CANISTER_ID
};

// * Staging environment
const canisters_staging: SpecialYukuCanisters = {
    yuku_business: 'bc7rk-eyaaa-aaaai-qpdna-cai', // ? YUKU_BUSINESS_CANISTER_ID
};

// ? Test environment
const canisters_test: SpecialYukuCanisters = {
    yuku_business: 'bc7rk-eyaaa-aaaai-qpdna-cai', // ? YUKU_BUSINESS_CANISTER_ID
};

const checkText = (canisters: SpecialYukuCanisters, mode: SupportedBackend) => {
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
): SpecialYukuCanisters => {
    if (mode === 'production') return canisters_production;
    if (mode === 'staging') return canisters_staging;
    if (mode === 'test') return canisters_test;

    // Development build can freely choose the backend
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
