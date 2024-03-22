import { NotificationInstance } from 'antd/es/notification/interface';
import { ActionStepsModal } from '@/components/modal/action-steps';
import { useSellingActionSteps } from '@/hooks/exchange/single/sell';
import { useTransactionProcess } from '@/hooks/exchange/steps';
import { TransactionRecord, useTransactionStore } from '@/stores/transaction';
import { SellingAction, SingleSellTransaction } from '@/types/exchange/single-sell';
import { SupportedNftStandard } from '@/types/nft';
import { TransactionViewMain } from '.';

export default function SingleSellingSteps({
    record,
    transaction,
}: {
    api: NotificationInstance;
    record: TransactionRecord;
    transaction: SingleSellTransaction;
}) {
    const show = record.modal;

    const toggle = useTransactionStore((s) => s.toggle);
    // const remove = useTransactionStore((s) => s.remove);

    const { actions } = useSellingActionSteps(
        undefined,
        transaction.args.owner.raw.standard as SupportedNftStandard,
        transaction.args.owner.token_id.collection,
    );
    const { action } = useTransactionProcess<SellingAction>({ record, actions });
    if (!show) return <></>;

    return (
        <ActionStepsModal<SellingAction>
            title=""
            record={record}
            actions={actions}
            action={action}
            onClose={() => toggle(record.id)}
        />
    );
}
export function SingleSellingTransactionView({
    api,
    record,
    transaction,
}: {
    api: NotificationInstance;
    record: TransactionRecord;
    transaction: SingleSellTransaction;
}) {
    const { actions } = useSellingActionSteps(
        undefined,
        transaction.args.owner.raw.standard as SupportedNftStandard,
        transaction.args.owner.token_id.collection,
    );
    const { done, title } = useTransactionProcess<SellingAction>({ record, actions });

    return <TransactionViewMain api={api} record={record} done={done} title={title} />;
}
