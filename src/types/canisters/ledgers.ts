export type SupportedLedgerTokenSymbol = 'ICP' | 'OGY';

export type LedgerTokenBalance = {
    e8s: string;
};

export type LedgerTransferArgs = {
    to: string; // account_hex
    from_subaccount?: number[];
    amount: LedgerTokenBalance; // ? bigint -> string
    fee: LedgerTokenBalance; // ? bigint -> string
    memo: string; // ? bigint -> string
};
