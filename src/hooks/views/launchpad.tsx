import { useCallback, useEffect, useState } from 'react';
import message from '@/components/message';
import { icpAccountBalance } from '@/utils/canisters/ledgers/icp';
import {
    claimLaunchpadNFT,
    queryOpenUserRemainAmount,
    queryWhitelistUserRemainAmount,
} from '@/utils/canisters/yuku-old/launchpad';
import { getYukuLaunchpadCanisterId } from '@/utils/canisters/yuku-old/special';
import {
    LaunchpadCollectionInfo,
    LaunchpadCollectionStatus,
} from '@/canisters/yuku-old/yuku_launchpad';
import { exponentNumber } from '@/common/data/numbers';
import { principal2account } from '@/common/ic/account';
import { parse_token_identifier } from '@/common/nft/ext';
import { Spend } from '@/common/react/spend';
import { throwIdentity, useIdentityStore } from '@/stores/identity';
import { LedgerTokenBalance } from '@/types/canisters/ledgers';
import { ConnectedIdentity } from '@/types/identity';
import { NftIdentifier } from '@/types/nft';
import { useCheckAction } from '../common/action';
import { useCheckIdentity } from '../common/identity';
import { LedgerTransferExecutor, useTransferByICP } from '../ledger/transfer';

const MAX_PURCHASE = 50;

export type LaunchpadBuyAction =
    | undefined
    | 'DOING'
    | 'CHECKING_PURCHASE'
    | 'CHECKING_BALANCE'
    | 'PAY'
    | 'CLAIMING';

export type BuyLaunchpadNftExecutor = (count: number) => Promise<NftIdentifier[] | undefined>;

export const useLaunchpadPurchase = (
    info: LaunchpadCollectionInfo,
    status: LaunchpadCollectionStatus,
): {
    max: number;
    price: string;
    buy: BuyLaunchpadNftExecutor;
    action: LaunchpadBuyAction;
} => {
    const identity = useIdentityStore((s) => s.connectedIdentity);
    const checkIdentity = useCheckIdentity();
    const checkAction = useCheckAction();

    const [whitelist, setWhitelist] = useState<number | undefined>(undefined);
    useEffect(() => {
        if (!identity) return setWhitelist(undefined);
        if (status !== 'whitelist') return setWhitelist(undefined);
        wrappedQueryWhitelistUserRemainAmount(identity, info).then(setWhitelist);
    }, [identity, status, info]);

    const [open, setOpen] = useState<number | undefined>(undefined);
    useEffect(() => {
        if (!identity) return setOpen(undefined);
        if (status !== 'open') return setOpen(undefined);
        wrappedQueryOpenUserRemainAmount(identity, info).then(setOpen);
    }, [identity, status, info]);

    const [max, setMax] = useState<number>(0);
    useEffect(() => {
        if (status === 'whitelist') {
            setMax(whitelist ?? Number(info.whitelist_limit));
        } else if (status === 'open') {
            setMax(
                open ??
                    (info.open_limit !== undefined
                        ? Math.min(MAX_PURCHASE, Number(info.open_limit))
                        : MAX_PURCHASE),
            );
        } else setMax(0);
    }, [status, info, whitelist, open]);

    const [price, setPrice] = useState<string>('0');
    useEffect(() => {
        if (['upcoming', 'whitelist'].includes(status) && info.whitelist_supply !== '0')
            setPrice(info.whitelist_price);
        else if (['open'].includes(status)) setPrice(info.open_price);
        else setPrice('0');
    }, [status, info]);

    const [action, setAction] = useState<LaunchpadBuyAction>(undefined);

    const { balance, fee, decimals, transfer } = useTransferByICP();

    const buy = useCallback(
        async (count: number): Promise<NftIdentifier[] | undefined> => {
            const identity = checkIdentity();
            if (!checkArgs(count)) return undefined;
            checkAction(action, `Purchasing`);

            setAction('DOING');
            try {
                const spend = Spend.start(`launchpad purchase ${info.collection} ${count}`);

                await checkPurchase(
                    setAction,
                    identity,
                    info,
                    max,
                    status,
                    whitelist,
                    setWhitelist,
                    setOpen,
                    spend,
                    count,
                );

                const amount = await checkBalance(
                    setAction,
                    balance,
                    identity,
                    spend,
                    price,
                    count,
                    fee,
                    decimals,
                );

                const height = await doPay(setAction, transfer, amount, info.index, spend);

                if (!height) {
                    throw new Error(`height is undefined`);
                }

                const token_index_list = await doClaim(setAction, identity, height, spend);

                await doClean(status, identity, info, setWhitelist, setOpen);

                console.debug(`launchpad purchase claimed, token_index_list:`, token_index_list);
                return token_index_list.map((token_index) => ({
                    collection: info.collection,
                    token_identifier: parse_token_identifier(info.collection, token_index),
                }));
            } catch (e) {
                console.debug(`🚀 ~ file: launchpad.tsx:207 ~ e:`, e);
                message.error(`Purchase failed: ${e}`);
            } finally {
                setAction(undefined);
            }
        },
        [checkIdentity, action, max, status, whitelist, open, info, balance, price, fee, decimals],
    );

    return {
        max,
        price,
        buy,
        action,
    };
};

const checkArgs = (count: number): boolean => {
    if (count <= 0) {
        message.warning(`Purchasing wrong number: ${count}`);
        return false;
    }
    return true;
};

const checkPurchase = async (
    setAction: (action: LaunchpadBuyAction) => void,
    identity: ConnectedIdentity,
    info: LaunchpadCollectionInfo,
    max: number,
    status: LaunchpadCollectionStatus,
    whitelist: number | undefined,
    setWhitelist: (whitelist: number | undefined) => void,
    setOpen: (open: number | undefined) => void,
    spend: Spend,
    count: number,
) => {
    setAction('CHECKING_PURCHASE');
    let max_purchase = max;
    if (status === 'whitelist' && whitelist === undefined) {
        max_purchase = await wrappedQueryWhitelistUserRemainAmount(identity, info);
        setWhitelist(max_purchase);
    }
    if (status === 'open' && open === undefined) {
        max_purchase = await wrappedQueryOpenUserRemainAmount(identity, info);
        setOpen(max_purchase);
    }
    spend.mark(`CHECKING_PURCHASE`);
    if (max_purchase < count) throw new Error(`purchase too many.(max purchase: ${max_purchase})`);
};

const wrappedQueryWhitelistUserRemainAmount = (
    identity: ConnectedIdentity,
    info: LaunchpadCollectionInfo,
) => {
    return queryWhitelistUserRemainAmount(identity, {
        collection: info.collection,
        whitelist_limit: info.whitelist_limit,
        supply: info.supply,
        remain: info.remain,
        whitelist_supply: info.whitelist_supply,
    });
};

const wrappedQueryOpenUserRemainAmount = (
    identity: ConnectedIdentity,
    info: LaunchpadCollectionInfo,
) => {
    return queryOpenUserRemainAmount(identity, {
        collection: info.collection,
        open_limit: info.open_limit ?? `${MAX_PURCHASE}`,
        supply: info.supply,
        remain: info.remain,
        open_supply: info.open_supply,
    });
};

const checkBalance = async (
    setAction: (action: LaunchpadBuyAction) => void,
    balance: LedgerTokenBalance | undefined,
    identity: ConnectedIdentity,
    spend: Spend,
    price: string,
    count: number,
    fee: string,
    decimals: number,
): Promise<string> => {
    throwIdentity(identity);
    setAction('CHECKING_BALANCE');
    const e8s = balance?.e8s ?? (await icpAccountBalance(identity.account!)).e8s;

    spend.mark(`CHECKING_BALANCE`);
    const need = BigInt(price) * BigInt(count) + BigInt(fee);
    if (BigInt(e8s) < need)
        throw new Error(`Insufficient balance.(needs ${exponentNumber(`${need}`, -decimals)}ICP)`);

    return `${need}`;
};

const doPay = async (
    setAction: (action: LaunchpadBuyAction) => void,
    transfer: LedgerTransferExecutor,
    amount: string,
    memo: string,
    spend: Spend,
): Promise<string | undefined> => {
    setAction('PAY');

    const yuku_account = principal2account(getYukuLaunchpadCanisterId());
    const height = await transfer({
        to: yuku_account,
        amount,
        memo,
    });
    console.debug(`launchpad purchase paid, height:`, height);
    spend.mark(`PAY`);

    return height;
};

const doClaim = async (
    setAction: (action: LaunchpadBuyAction) => void,
    identity: ConnectedIdentity,
    height: string,
    spend: Spend,
): Promise<number[]> => {
    setAction('CLAIMING');
    const token_index_list = await claimLaunchpadNFT(identity, height);
    spend.mark(`CLAIMING`);

    return token_index_list;
};

const doClean = async (
    status: LaunchpadCollectionStatus,
    identity: ConnectedIdentity,
    info: LaunchpadCollectionInfo,
    setWhitelist: (whitelist: number | undefined) => void,
    setOpen: (open: number | undefined) => void,
) => {
    if (status === 'whitelist') {
        setWhitelist(undefined);
        wrappedQueryWhitelistUserRemainAmount(identity, info).then(setWhitelist);
    }
    if (status === 'open') {
        setOpen(undefined);
        wrappedQueryOpenUserRemainAmount(identity, info).then(setOpen);
    }
};
