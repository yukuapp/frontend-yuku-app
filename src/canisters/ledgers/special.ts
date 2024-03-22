import { isCanisterIdText } from '@/common/ic/principals';
import { SupportedBackend } from '@/types/app';
import { BuildMode } from '@/vite-env';

type LedgerCanister = {
    canister_id: string;
    decimals: number;
    fee: string; // Transfer fee
};

export type SpecialCanisters = {
    // Ledger canisters
    ledger_icp: LedgerCanister; // LEDGER_CANISTER_ID
    ledger_ogy: LedgerCanister; // OGY_Balance
};

const canisters_production: SpecialCanisters = {
    // Ledger canisters
    ledger_icp: {
        canister_id: 'ryjl3-tyaaa-aaaaa-aaaba-cai',
        decimals: 8,
        fee: '10000',
    }, //! ICP canister // LEDGER_CANISTER_ID
    ledger_ogy: {
        canister_id: 'jwcfb-hyaaa-aaaaj-aac4q-cai',
        decimals: 8,
        fee: '200000',
    }, //! OGY canister // OGY_Balance
};

const canisters_staging: SpecialCanisters = {
    // Ledger canisters
    ledger_icp: {
        canister_id: 'ryjl3-tyaaa-aaaaa-aaaba-cai',
        decimals: 8,
        fee: '10000',
    }, //! ICP canister // LEDGER_CANISTER_ID
    ledger_ogy: {
        canister_id: 'jwcfb-hyaaa-aaaaj-aac4q-cai',
        decimals: 8,
        fee: '200000',
    }, //! OGY canister // OGY_Balance
};

const canisters_test: SpecialCanisters = {
    // Ledger canisters
    ledger_icp: {
        canister_id: 'irzpe-yqaaa-aaaah-abhfa-cai',
        decimals: 8,
        fee: '10000',
    }, // * Self-deployed test canister // LEDGER_CANISTER_ID
    ledger_ogy: {
        canister_id: 'jwcfb-hyaaa-aaaaj-aac4q-cai',
        decimals: 8,
        fee: '200000',
    }, //! OGY canister // OGY_Balance
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
