import { useCallback, useState } from 'react';
import message from '@/components/message';
import { icpAccountBalance } from '@/utils/canisters/ledgers/icp';
import { ogyAccountBalance } from '@/utils/canisters/ledgers/ogy';
import {
    queryAllAuctionOfferList,
    queryShikuLandsPayAccount,
    shikuLandsMakeOffer,
    shikuLandsUpdateOffer,
} from '@/utils/canisters/yuku-old/core';
import { exponentNumber } from '@/common/data/numbers';
import { isSameNft, uniqueKey } from '@/common/nft/identifier';
import { Spend } from '@/common/react/spend';
import { throwIdentity } from '@/stores/identity';
import { LedgerTokenBalance } from '@/types/canisters/ledgers';
import { BiddingShikuAction, BidShikuNftExecutor } from '@/types/exchange/single-bid-shiku';
import { ConnectedIdentity } from '@/types/identity';
import { NftIdentifier, TokenInfo } from '@/types/nft';
import { useCheckAction } from '../../common/action';
import { useCheckIdentity } from '../../common/identity';
import { checkWhitelist } from '../../common/whitelist';
import { LedgerTransferExecutor, useTransferByICP, useTransferByOGY } from '../../ledger/transfer';

export const useBidShikuNft = (): {
    bid: BidShikuNftExecutor;
    action: BiddingShikuAction;
} => {
    const checkIdentity = useCheckIdentity();
    const checkAction = useCheckAction();

    const [action, setAction] = useState<BiddingShikuAction>(undefined);

    const {
        balance: icpBalance,
        fee: icpFee,
        decimals: icpDecimals,
        transfer: icpTransfer,
    } = useTransferByICP();
    const {
        balance: ogyBalance,
        fee: ogyFee,
        decimals: ogyDecimals,
        transfer: ogyTransfer,
    } = useTransferByOGY();

    const bid = useCallback(
        async (
            token_id: NftIdentifier,
            owner: string,
            token: TokenInfo,
            price: string,
            ttl: string,
        ): Promise<boolean> => {
            const identity = checkIdentity();
            if (!checkArgs(identity, owner)) return false;
            checkAction(action, `Bidding`);

            setAction('DOING');
            try {
                await checkWhitelist(identity, [token_id.collection, token.canister]);

                const spend = Spend.start(`bid shiku nft ${uniqueKey(token_id)}`);

                const offer_id = await queryOfferId(setAction, identity, token_id, spend);

                const account = await queryYukuCorePayAccount(setAction, identity, spend);

                if (offer_id) {
                    const balance = await checkPayAccountBalance(setAction, token, account, spend);

                    if (BigInt(balance) < BigInt(price)) {
                        const need = `${BigInt(price) - BigInt(balance)}`;

                        const { transfer } = await checkBalance(
                            setAction,
                            token,
                            icpBalance,
                            icpFee,
                            icpDecimals,
                            icpTransfer,
                            ogyBalance,
                            ogyFee,
                            ogyDecimals,
                            ogyTransfer,
                            identity,
                            spend,
                            need,
                        );

                        await pay2YukuCoreAccount(setAction, transfer, account, need, spend);
                    }
                } else {
                    const { transfer } = await checkBalance(
                        setAction,
                        token,
                        icpBalance,
                        icpFee,
                        icpDecimals,
                        icpTransfer,
                        ogyBalance,
                        ogyFee,
                        ogyDecimals,
                        ogyTransfer,
                        identity,
                        spend,
                        price,
                    );

                    await pay2YukuCoreAccount(setAction, transfer, account, price, spend);
                }

                if (offer_id) {
                    await yukuShikuUpdateOffer(setAction, identity, offer_id, price, spend);
                } else {
                    await yukuShikuMakeOffer(
                        setAction,
                        identity,
                        {
                            seller: owner,
                            token_id,
                            token,
                            price,
                            ttl,
                        },
                        spend,
                    );
                }

                return true;
            } catch (e) {
                message.error(`Buy NFT failed: ${e}`);
            } finally {
                setAction(undefined);
            }
            return false;
        },
        [
            checkIdentity,
            action,
            icpBalance,
            icpFee,
            icpDecimals,
            icpTransfer,
            ogyBalance,
            ogyFee,
            ogyDecimals,
            ogyTransfer,
        ],
    );

    return { bid, action };
};

const checkArgs = (identity: ConnectedIdentity, owner: string | undefined): boolean => {
    if (owner && identity.account === owner) {
        message.warning(`You can't buy your own NFT`);
        return false;
    }

    return true;
};

const queryOfferId = async (
    setAction: (action: BiddingShikuAction) => void,
    identity: ConnectedIdentity,
    token_id: NftIdentifier,
    spend: Spend,
): Promise<string | undefined> => {
    setAction('CHECKING_OFFER_ID');
    throwIdentity(identity);
    const offers = await queryAllAuctionOfferList(identity.principal!);
    const offer = offers.find(
        (o) =>
            isSameNft(o.token_id, token_id) &&
            ['ineffect', 'accepted'].includes(o.status) /* cspell: disable-line */ &&
            o.bidder === identity.principal,
    );
    spend.mark(`CHECKING_OFFER_ID DONE: got -> ${offers.length} -> ${offer?.offerId}`);

    return offer?.offerId;
};

const queryYukuCorePayAccount = async (
    setAction: (action: BiddingShikuAction) => void,
    identity: ConnectedIdentity,
    spend: Spend,
): Promise<string> => {
    setAction('CHECKING_PAY_ACCOUNT');
    const account = (await queryShikuLandsPayAccount(identity)).toLowerCase();
    spend.mark(`CHECKING_PAY_ACCOUNT DONE: got pay account -> ${account}`);

    return account;
};

const checkPayAccountBalance = async (
    setAction: (action: BiddingShikuAction) => void,
    token: TokenInfo,
    account: string,
    spend: Spend,
): Promise<string> => {
    setAction('CHECKING_PAY_ACCOUNT_BALANCE');
    const { accountBalance } = (() => {
        switch (token.symbol) {
            case 'ICP':
                return {
                    accountBalance: icpAccountBalance,
                };
            case 'OGY':
                return {
                    accountBalance: ogyAccountBalance,
                };
            default:
                throw new Error(`unsupported token: ${token.symbol}`);
        }
    })();
    const e8s = (await accountBalance(account)).e8s;
    spend.mark(`CHECKING_PAY_ACCOUNT_BALANCE DONE: balance -> ${e8s}`);

    return e8s;
};

const checkBalance = async (
    setAction: (action: BiddingShikuAction) => void,
    token: TokenInfo,
    icpBalance: LedgerTokenBalance | undefined,
    icpFee: string,
    icpDecimals: number,
    icpTransfer: LedgerTransferExecutor,
    ogyBalance: LedgerTokenBalance | undefined,
    ogyFee: string,
    ogyDecimals: number,
    ogyTransfer: LedgerTransferExecutor,
    identity: ConnectedIdentity,
    spend: Spend,
    price: string,
): Promise<{ fee: string; transfer: LedgerTransferExecutor }> => {
    setAction('CHECKING_BALANCE');
    throwIdentity(identity);
    const { balance, fee, decimals, transfer, accountBalance } = (() => {
        switch (token.symbol) {
            case 'ICP':
                return {
                    balance: icpBalance,
                    fee: icpFee,
                    decimals: icpDecimals,
                    transfer: icpTransfer,
                    accountBalance: icpAccountBalance,
                };
            case 'OGY':
                return {
                    balance: ogyBalance,
                    fee: ogyFee,
                    decimals: ogyDecimals,
                    transfer: ogyTransfer,
                    accountBalance: ogyAccountBalance,
                };
            default:
                throw new Error(`unsupported token: ${token.symbol}`);
        }
    })();
    const e8s = balance?.e8s ?? (await accountBalance(identity.account!)).e8s;
    spend.mark(`CHECKING_BALANCE DONE`);
    const need = BigInt(price) + BigInt(fee);
    if (BigInt(e8s) < need)
        throw new Error(
            `Insufficient balance.(needs ${exponentNumber(`${need}`, -decimals)}${token.symbol})`,
        );

    return { fee, transfer };
};

const pay2YukuCoreAccount = async (
    setAction: (action: BiddingShikuAction) => void,
    transfer: LedgerTransferExecutor,
    to: string,
    price: string,
    spend: Spend,
): Promise<string> => {
    setAction('PAY');

    const height = await transfer({
        to,
        amount: price,
    });
    console.debug(`buy nft paid ${price}, height:`, height);
    spend.mark(`PAY DONE: ${height}`);

    return height;
};

const yukuShikuMakeOffer = async (
    setAction: (action: BiddingShikuAction) => void,
    identity: ConnectedIdentity,
    args: {
        seller: string; // account_hex
        token_id: NftIdentifier;
        token: TokenInfo;
        price: string;
        ttl: string;
    },
    spend: Spend,
): Promise<void> => {
    setAction('MAKE_OFFER');
    await shikuLandsMakeOffer(identity, args);
    spend.mark(`MAKE_OFFER DONE`);
};

const yukuShikuUpdateOffer = async (
    setAction: (action: BiddingShikuAction) => void,
    identity: ConnectedIdentity,
    offer_id: string,
    price: string,
    spend: Spend,
): Promise<void> => {
    setAction('UPDATE_OFFER');
    await shikuLandsUpdateOffer(identity, { offer_id, price });
    spend.mark(`UPDATE_OFFER DONE`);
};
