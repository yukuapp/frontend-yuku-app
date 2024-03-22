import { NotificationInstance } from 'antd/es/notification/interface';
import { BatchSaleResultModal } from '@/components/nft-card/components/batch';
import { useBatchSellingActionSteps } from '@/hooks/exchange/batch/sell';
import { useTransactionProcess } from '@/hooks/exchange/steps';
import { TransactionRecord, useTransactionStore } from '@/stores/transaction';
import { BatchSellingAction, BatchSellingTransaction } from '@/types/exchange/batch-sell';
import { TransactionViewMain } from '.';
import { ActionStepsModal } from '../../../../modal/action-steps';

export const BatchSellingSteps = ({
    api,
    record, // transaction,
    transaction,
}: {
    api: NotificationInstance;
    record: TransactionRecord;
    transaction: BatchSellingTransaction;
}) => {
    const show = record.modal;
    const toggle = useTransactionStore((s) => s.toggle);
    const remove = useTransactionStore((s) => s.remove);

    const { actions } = useBatchSellingActionSteps(undefined);

    const { action } = useTransactionProcess<BatchSellingAction>({ record, actions });

    return (
        show && (
            <>
                <BatchSaleResultModal
                    record={record}
                    transaction={transaction}
                    onClose={() => {
                        remove(record.id);
                        api.destroy(record.id);
                    }}
                ></BatchSaleResultModal>
                <ActionStepsModal<BatchSellingAction>
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

export function BatchSellingTransactionView({
    api,
    record, // transaction,
}: {
    api: NotificationInstance;
    record: TransactionRecord;
    transaction: BatchSellingTransaction;
}) {
    const { actions } = useBatchSellingActionSteps(undefined);

    const { done, title } = useTransactionProcess<BatchSellingAction>({ record, actions });

    return <TransactionViewMain api={api} record={record} done={done} title={title} />;
}
