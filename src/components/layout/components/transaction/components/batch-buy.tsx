import { NotificationInstance } from 'antd/es/notification/interface';
import { useBatchBuyingActionSteps } from '@/hooks/exchange/batch/buy';
import { useTransactionProcess } from '@/hooks/exchange/steps';
import { TransactionRecord, useTransactionStore } from '@/stores/transaction';
import { BatchBuyingAction, BatchBuyingTransaction } from '@/types/exchange/batch-buy';
import { TransactionViewMain } from '.';
import { ActionStepsModal } from '../../../../modal/action-steps';
import BatchBuyingResultModal from '../../cart/cart-modal';

export const BatchBuyingSteps = ({
    api,
    record,
    transaction,
}: {
    api: NotificationInstance;
    record: TransactionRecord;
    transaction: BatchBuyingTransaction;
}) => {
    const show = record.modal;
    const toggle = useTransactionStore((s) => s.toggle);
    const remove = useTransactionStore((s) => s.remove);
    const is_entrepot =
        record.transaction.type == 'batch-buy' &&
        record.transaction.args.token_list.every(
            (l) => l.listing.type === 'listing' && l.listing.raw.type === 'entrepot',
        );

    const { actions } = useBatchBuyingActionSteps(undefined, is_entrepot);

    const { action } = useTransactionProcess<BatchBuyingAction>({ record, actions });
    return (
        show && (
            <>
                <BatchBuyingResultModal
                    record={record}
                    transaction={transaction}
                    onClose={() => {
                        remove(record.id);
                        api.destroy(record.id);
                    }}
                />
                <ActionStepsModal<BatchBuyingAction>
                    title=""
                    record={record}
                    actions={actions}
                    action={action}
                    onClose={() => toggle(record.id)}
                />
            </>
        )
    );
};

export function BatchBuyingTransactionView({
    api,
    record, // transaction,
}: {
    api: NotificationInstance;
    record: TransactionRecord;
    transaction: BatchBuyingTransaction;
}) {
    const is_entrepot =
        record.transaction.type == 'batch-buy' &&
        record.transaction.args.token_list.every(
            (l) => l.listing.type === 'listing' && l.listing.raw.type === 'entrepot',
        );
    const { actions } = useBatchBuyingActionSteps(undefined, is_entrepot);

    const { done, title } = useTransactionProcess<BatchBuyingAction>({ record, actions });

    return <TransactionViewMain api={api} record={record} done={done} title={title} />;
}
