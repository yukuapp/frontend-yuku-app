import { NotificationInstance } from 'antd/es/notification/interface';
import { ActionStepsModal } from '@/components/modal/action-steps';
import { useTransferringActionSteps } from '@/hooks/exchange/single/transfer';
import { useTransactionProcess } from '@/hooks/exchange/steps';
import { TransactionRecord, useTransactionStore } from '@/stores/transaction';
import { SingleTransferTransaction } from '@/types/exchange/single-transfer';
import { SupportedNftStandard } from '@/types/nft';
import { TransactionViewMain } from '.';
import { TransferringAction } from '../../../../../types/exchange/single-transfer';

export default function SingleTransferringSteps({
    record,
    transaction,
}: {
    api: NotificationInstance;
    record: TransactionRecord;
    transaction: SingleTransferTransaction;
}) {
    const show = record.modal;

    const toggle = useTransactionStore((s) => s.toggle);
    // const remove = useTransactionStore((s) => s.remove);

    const { actions } = useTransferringActionSteps(
        undefined,
        transaction.args.owner.raw.standard as SupportedNftStandard,
    );
    const { action } = useTransactionProcess<TransferringAction>({ record, actions });
    if (!show) return <></>;

    return (
        <ActionStepsModal<TransferringAction>
            title=""
            record={record}
            actions={actions}
            action={action}
            onClose={() => toggle(record.id)}
        />
    );
}
export function SingleTransferringTransactionView({
    api,
    record,
    transaction,
}: {
    api: NotificationInstance;
    record: TransactionRecord;
    transaction: SingleTransferTransaction;
}) {
    const { actions } = useTransferringActionSteps(
        undefined,
        transaction.args.owner.raw.standard as SupportedNftStandard,
    );
    const { done, title } = useTransactionProcess<TransferringAction>({ record, actions });

    return <TransactionViewMain api={api} record={record} done={done} title={title} />;
}
