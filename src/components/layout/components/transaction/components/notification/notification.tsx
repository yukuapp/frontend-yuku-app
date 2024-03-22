import { useEffect } from 'react';
import { NotificationInstance } from 'antd/es/notification/interface';
import { TransactionRecord } from '@/stores/transaction';
import { BatchBuyingTransaction } from '@/types/exchange/batch-buy';
import { BatchSellingTransaction } from '@/types/exchange/batch-sell';
import { TransactionView } from '..';
import { BatchBuyingSteps } from '../batch-buy';
import { BatchSellingSteps } from '../batch-sell';
import { SingleBuySteps } from '../single-buy';
import SingleSellingSteps from '../single-sell';
import SingleTransferringSteps from '../single-transfer';
import './index.less';

function SingleTransactionNotification({
    api,
    index,
    record,
}: {
    api: NotificationInstance;
    index: number;
    record: TransactionRecord;
}) {
    useEffect(() => {
        if (record.modal) {
            api.destroy(record.id);
        } else {
            api.open({
                role: 'status',
                key: record.id,
                message: <></>,
                description: <TransactionView api={api} index={index} record={record} />,
                placement: 'bottomRight',
                className: 'recorder-notification',
                style: { bottom: '50px' },
                duration: 1000,
                closeIcon: false,
            });
        }
    }, [record.modal, record.transaction.actions.length]);

    switch (record.transaction.type) {
        case 'single-buy':
            return (
                <SingleBuySteps
                    api={api}
                    record={record}
                    transaction={record.transaction}
                ></SingleBuySteps>
            );
        case 'single-sell':
            return (
                <SingleSellingSteps
                    api={api}
                    record={record}
                    transaction={record.transaction}
                ></SingleSellingSteps>
            );
        case 'single-transfer':
            return (
                <SingleTransferringSteps
                    api={api}
                    record={record}
                    transaction={record.transaction}
                ></SingleTransferringSteps>
            );
        case 'batch-buy':
            return (
                <BatchBuyingSteps
                    api={api}
                    record={record}
                    transaction={record.transaction as BatchBuyingTransaction}
                ></BatchBuyingSteps>
            );
        case 'batch-sell':
            return (
                <BatchSellingSteps
                    api={api}
                    record={record}
                    transaction={record.transaction as BatchSellingTransaction}
                ></BatchSellingSteps>
            );
        default:
            throw new Error(`what a transaction type: ${record.transaction}`);
    }
}

export default SingleTransactionNotification;
