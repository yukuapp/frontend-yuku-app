import { findSpecialCanisters, SpecialCanisters } from '@/canisters/ledgers/special';
import { SupportedLedgerTokenSymbol } from '@/types/canisters/ledgers';
import { TokenInfo } from '@/types/nft';
import { getBackendType } from '../../app/backend';
import { getBuildMode } from '../../app/env';

const findCanisters = (): SpecialCanisters =>
    findSpecialCanisters(getBuildMode(), getBackendType());

export const getLedgerIcpCanisterId = (): string => findCanisters().ledger_icp.canister_id;
export const getLedgerIcpDecimals = (): number => findCanisters().ledger_icp.decimals;
export const getLedgerIcpFee = (): string => findCanisters().ledger_icp.fee;
export const getLedgerOgyCanisterId = (): string => findCanisters().ledger_ogy.canister_id;
export const getLedgerOgyDecimals = (): number => findCanisters().ledger_ogy.decimals;
export const getLedgerOgyFee = (): string => findCanisters().ledger_ogy.fee;

export const getLedgerTokenIcp = (): TokenInfo => ({
    symbol: 'ICP',
    canister: getLedgerIcpCanisterId(),
    standard: { type: 'Ledger' },
    decimals: `${getLedgerIcpDecimals()}`,
    fee: getLedgerIcpFee(),
});
export const getLedgerTokenOgy = (): TokenInfo => ({
    symbol: 'OGY',
    canister: getLedgerOgyCanisterId(),
    standard: { type: 'Ledger' },
    decimals: `${getLedgerOgyDecimals()}`,
    fee: getLedgerOgyFee(),
});

export const getTokenDecimals = (symbol?: SupportedLedgerTokenSymbol): number => {
    switch (symbol) {
        case 'ICP':
            return getLedgerIcpDecimals();
        case 'OGY':
            return getLedgerOgyDecimals();
        default:
            return 8;
    }
};

export const getTokenFee = (symbol: SupportedLedgerTokenSymbol): string => {
    switch (symbol) {
        case 'ICP':
            return getLedgerIcpFee();
        case 'OGY':
            return getLedgerOgyFee();
        default:
            return '0';
    }
};
