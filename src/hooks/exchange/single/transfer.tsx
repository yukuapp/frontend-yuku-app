import { useCallback, useMemo, useState } from 'react';
import message from '@/components/message';
import { useCheckIdentity } from '@/hooks/common/identity';
import { useMessage } from '@/hooks/common/message';
import { useTransactionRecords } from '@/hooks/stores/transaction';
import { transferFrom } from '@/canisters/nft/ext';
import { retrieveCccNft } from '@/canisters/yuku-old/yuku_ccc_proxy';
import { isPrincipalText } from '@/common/ic/principals';
import { uniqueKey } from '@/common/nft/identifier';
import { Spend } from '@/common/react/spend';
import { throwIdentity } from '@/stores/identity';
import { useTransactionStore } from '@/stores/transaction';
import {
    SingleTransferAction,
    SingleTransferTransaction,
    TransferNftByTransactionExecutor,
    TransferNftExecutor,
    TransferringAction,
} from '@/types/exchange/single-transfer';
import { ConnectedIdentity } from '@/types/identity';
import { NftTokenOwner, SupportedNftStandard } from '@/types/nft';
import { ExtUser } from '@/types/nft-standard/ext';
import { useCheckAction } from '../../common/action';
import { checkWhitelist } from '../../common/whitelist';
import { transaction_executed, transaction_executing } from '../executing';
import useActionSteps, { MarkAction } from '../steps';

export const useTransferNft = (): {
    transfer: TransferNftExecutor;
    action: TransferringAction;
} => {
    const checkAction = useCheckAction();

    const [action, setAction] = useState<TransferringAction>(undefined);

    const transfer = useCallback(
        async (
            identity: ConnectedIdentity,
            owner: NftTokenOwner,
            to: string,
            is_batch?: boolean,
        ): Promise<boolean> => {
            checkAction(action, `Transferring`);

            setAction('DOING');
            try {
                !is_batch && (await checkWhitelist(identity, [owner.token_id.collection]));

                const spend = Spend.start(`transfer nft ${uniqueKey(owner.token_id)}`);

                await checkStandardAndAddress(owner, to);

                await doRetrieve(setAction, identity, owner, spend);

                await doTransfer(owner, identity, setAction, to, spend);

                return true;
            } catch (e) {
                console.debug(`🚀 ~ file: transfer.tsx:79 ~ e:`, e);
                message.error(`Transfer NFT failed: ${e}`);
            } finally {
                setAction(undefined);
            }
            return false;
        },
        [action],
    );

    return { transfer, action };
};

const checkStandardAndAddress = async (owner: NftTokenOwner, to: string): Promise<void> => {
    if (owner.raw.standard === 'ogy') {
        throw new Error(`OGY NFT is not supported.`);
    }

    if (owner.raw.standard === 'ccc' && !isPrincipalText(to)) {
        throw new Error(`The new owner of CCC NFT must be principal`);
    }
};

const doRetrieve = async (
    setAction: (action: TransferringAction) => void,
    identity: ConnectedIdentity,
    owner: NftTokenOwner,
    spend: Spend,
): Promise<void> => {
    setAction('RETRIEVING');
    await retrieve(identity, owner, setAction, spend);
    spend.mark(`RETRIEVING DONE`);
};

const retrieve = async (
    identity: ConnectedIdentity,
    owner: NftTokenOwner,
    setAction: (action: TransferringAction) => void,
    spend: Spend,
): Promise<void> => {
    if (
        (owner.raw.standard === 'ccc' && owner.raw.data.proxy) ||
        (owner.raw.standard === 'ext' && owner.raw.data.proxy)
    ) {
        setAction('RETRIEVING_CCC');
        const retrieved = await retrieveCccNft(
            identity,
            owner.raw.data.proxy,
            owner.token_id.token_identifier,
        );
        spend.mark(`RETRIEVING_CCC DONE`);
        if (!retrieved) throw new Error(`Withdraw NFT failed`);
    }
};

const doTransfer = async (
    owner: NftTokenOwner,
    identity: ConnectedIdentity,
    setAction: (action: TransferringAction) => void,
    to: string,
    spend: Spend,
): Promise<void> => {
    throwIdentity(identity);
    const from: ExtUser = (() => {
        if (owner.raw.standard === 'ccc') {
            return { principal: identity.principal! };
        }
        return { address: owner.owner };
    })();
    setAction('TRANSFERRING');
    const transferred = await transferFrom(identity, owner.token_id.collection, {
        token_identifier: owner.token_id.token_identifier,
        from,
        to: isPrincipalText(to) ? { principal: to } : { address: to },
        memo: [],
    });
    spend.mark(`TRANSFERRING DONE`);
    if (!transferred) throw new Error(`transfer failed`);
};

export const useTransferringActionSteps = (
    action: TransferringAction,
    standard: SupportedNftStandard,
): {
    show: boolean;
    hide: () => void;
    failed: boolean;
    fail: () => void;
    title: string;
    actions: MarkAction<TransferringAction>[];
} => {
    const { show, hide, failed, fail } = useActionSteps(action);

    const { title, actions }: { title: string; actions: MarkAction<TransferringAction>[] } =
        useMemo(() => {
            const title = 'Sell NFT';
            const actions: MarkAction<TransferringAction>[] =
                standard === 'ccc'
                    ? [
                          {
                              actions: ['RETRIEVING', 'RETRIEVING_CCC'],
                              title: 'Retrieve your NFT first',
                          },
                          { actions: ['TRANSFERRING'], title: 'Transferring NFT' },
                      ]
                    : [
                          {
                              actions: ['RETRIEVING', 'RETRIEVING_CCC'],
                              title: 'Checking NFT first',
                          },
                          { actions: ['TRANSFERRING'], title: 'Transferring NFT' },
                      ];
            return { title, actions };
        }, [standard]);

    return {
        show,
        hide,
        failed,
        fail,
        title,
        actions,
    };
};

export const useTransferNftByTransaction = (): {
    transfer: TransferNftExecutor;
    action: TransferringAction;
} => {
    const message = useMessage();

    const insert = useTransactionStore((s) => s.insert);

    const [id, setId] = useState<string | undefined>(undefined);
    const { record } = useTransactionRecords(id);

    const transfer = useCallback(
        async (identity: ConnectedIdentity, owner: NftTokenOwner, to: string): Promise<boolean> => {
            throwIdentity(identity);
            try {
                await checkStandardAndAddress(owner, to);
            } catch (e: any) {
                message.error(`${e.message}`);
                return false;
            }

            const id = await insert(identity.principal!, {
                type: 'single-transfer',
                args: { owner, to },
                actions: [],
            }).catch((e) => {
                console.debug(`🚀 ~ file: transfer.tsx:456 ~ e:`, e);
                message.error(e.message);
                return undefined;
            });
            setId(id);
            throw new Error(`already recorded transaction`);
            return true;
        },
        [insert],
    );

    const action = useMemo(() => {
        if (record === undefined) return undefined;
        const transaction = record.transaction as SingleTransferTransaction;
        const actions = transaction.actions;
        if (actions.length === 0) return undefined;
        return actions[actions.length - 1].action;
    }, [record]);

    return { transfer, action };
};

export const useDoTransferNftByTransaction = (): TransferNftByTransactionExecutor => {
    const checkIdentity = useCheckIdentity();

    const update = useTransactionStore((s) => s.update);

    const _doTransfer = useCallback(
        async (id: string, _created: number, transaction: SingleTransferTransaction) => {
            const identity = checkIdentity();
            if (!transaction_executing(id)) return;
            const spend = Spend.start(
                `transfer nft by transaction ${uniqueKey(transaction.args.owner.token_id)}`,
            );
            let done_action = false;

            function doAction<T>(
                action: TransferringAction,
                fetch_action: (action: SingleTransferAction<T>) => Promise<T>,
                do_action: () => Promise<T>,
            ): Promise<T> {
                return new Promise((resolve, reject) => {
                    const action_with_data = transaction.actions.find((a) => a.action === action);
                    if (action_with_data) {
                        spend.mark(`already done ${action}`);
                        fetch_action(action_with_data).then(resolve).catch(reject);
                    } else {
                        done_action = true;
                        do_action().then(resolve).catch(reject);
                    }
                });
            }

            const setAction = () => {};

            try {
                await checkWhitelist(identity, [transaction.args.owner.token_id.collection]);

                await doAction(
                    'DOING',
                    async () => {},
                    async () => {
                        transaction.actions.push({ action: 'DOING', timestamp: Date.now() });
                        await update(id, transaction, 'executing');
                    },
                );
                if (done_action) return;

                await doAction(
                    'RETRIEVING',
                    async () => {},
                    async () => {
                        await doRetrieve(setAction, identity, transaction.args.owner, spend);
                        transaction.actions.push({ action: 'RETRIEVING', timestamp: Date.now() });
                        await update(id, transaction, 'executing');
                    },
                );
                if (done_action) return;

                await doAction(
                    'TRANSFERRING',
                    async () => {},
                    async () => {
                        await doTransfer(
                            transaction.args.owner,
                            identity,
                            setAction,
                            transaction.args.to,
                            spend,
                        );
                        transaction.actions.push({ action: 'TRANSFERRING', timestamp: Date.now() });
                        await update(id, transaction, 'successful');
                    },
                );
            } catch (e: any) {
                console.debug(`🚀 ~ file: transfer.tsx:619 ~ e:`, e);
                const message = `${e.message ?? e}`;
                await update(id, transaction, 'failed', message);
            } finally {
                transaction_executed(id);
            }
        },
        [checkIdentity, update],
    );

    return _doTransfer;
};
