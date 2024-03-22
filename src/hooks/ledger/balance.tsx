import { shallow } from 'zustand/shallow';
import { useIdentityStore } from '@/stores/identity';
import { SupportedLedgerTokenSymbol } from '@/types/canisters/ledgers';

export const useTokenBalance = (symbol: SupportedLedgerTokenSymbol): string => {
    const { icpBalance, ogyBalance } = useIdentityStore(
        (s) => ({
            icpBalance: s.icpBalance,
            ogyBalance: s.ogyBalance,
        }),
        shallow,
    );
    switch (symbol) {
        case 'ICP':
            return icpBalance ? icpBalance.e8s : '0';
        case 'OGY':
            return ogyBalance ? ogyBalance.e8s : '0';
        default:
            return '0';
    }
};
