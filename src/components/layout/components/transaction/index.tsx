import { useEffect } from 'react';
import { notification } from 'antd';
import { checkWhitelist } from '@/hooks/common/whitelist';
import { useDoBatchBuyNftByTransaction } from '@/hooks/exchange/batch/buy';
import { useDoBatchSellNftByTransaction } from '@/hooks/exchange/batch/sell';
import { is_transaction_executing } from '@/hooks/exchange/executing';
import { useDoBuyNftByTransaction } from '@/hooks/exchange/single/buy';
import { useDoSellNftByTransaction } from '@/hooks/exchange/single/sell';
import { useDoTransferNftByTransaction } from '@/hooks/exchange/single/transfer';
import { useTransactionRecords } from '@/hooks/stores/transaction';
import { useIdentityStore } from '@/stores/identity';
import { BatchBuyingTransaction } from '@/types/exchange/batch-buy';
import { BatchSellingTransaction } from '@/types/exchange/batch-sell';
import { SingleBuyTransaction } from '@/types/exchange/single-buy';
import { SingleSellTransaction } from '@/types/exchange/single-sell';
import { SingleTransferTransaction } from '@/types/exchange/single-transfer';
import SingleTransactionNotification from './components/notification/notification';

function TransactionNotification() {
    const identity = useIdentityStore((s) => s.connectedIdentity);

    const single_buy = useDoBuyNftByTransaction();

    const single_sell = useDoSellNftByTransaction();

    const single_transfer = useDoTransferNftByTransaction();

    const batch_buy = useDoBatchBuyNftByTransaction();

    const batch_sell = useDoBatchSellNftByTransaction();

    const { records } = useTransactionRecords();

    const entrepot_length = records.filter(
        (r) =>
            r.transaction.type === 'single-buy' && r.transaction.args.raw.standard === 'entrepot',
    ).length;
    const [api, contextHolder] = notification.useNotification({
        stack: { threshold: entrepot_length > 1 ? 3 : 10 },
    });
    useEffect(() => {
        console.debug(`======= start transaction notification check =======`, records);
        let whitelist: string[] = [];
        const executable: (() => Promise<void>)[] = [];
        for (const record of records) {
            if (is_transaction_executing(record.id)) continue;
            if (record.stopped) continue;
            if (['successful', 'failed'].includes(record.status ?? '')) continue;
            switch (record.transaction.type) {
                case 'single-buy':
                    console.debug('should single buy', record);
                    whitelist.push(record.transaction.args.token.canister);
                    whitelist.push(record.transaction.args.token_id.collection);
                    executable.push(() =>
                        single_buy(
                            record.id,
                            record.created,
                            record.transaction as SingleBuyTransaction,
                            false,
                        ),
                    );
                    break;
                case 'single-sell':
                    console.debug('should single sell', record);
                    whitelist.push(
                        (record.transaction as SingleSellTransaction).args.owner.token_id
                            .collection,
                    );
                    executable.push(() =>
                        single_sell(
                            record.id,
                            record.created,
                            record.transaction as SingleSellTransaction,
                        ),
                    );
                    break;
                case 'single-transfer':
                    console.debug('should single transfer', record);
                    whitelist.push(
                        (record.transaction as SingleTransferTransaction).args.owner.token_id
                            .collection,
                    );
                    executable.push(() =>
                        single_transfer(
                            record.id,
                            record.created,
                            record.transaction as SingleTransferTransaction,
                        ),
                    );
                    break;
                case 'batch-buy': {
                    console.debug('should batch buy', record);
                    const token_list = (record.transaction as BatchBuyingTransaction).args
                        .token_list;
                    whitelist = whitelist.concat([
                        ...token_list.map((item) => item.owner.token_id.collection),
                        ...token_list.map((item) =>
                            item.listing.type === 'listing' ? item.listing.token.canister : '',
                        ),
                    ]);
                    executable.push(() =>
                        batch_buy(
                            record.id,
                            record.created,
                            record.transaction as BatchBuyingTransaction,
                            false,
                        ),
                    );
                    break;
                }
                case 'batch-sell': {
                    console.debug('should batch sell', record);
                    const sales = (record.transaction as BatchSellingTransaction).args.sales;

                    whitelist = whitelist.concat(sales.map((item) => item.token_id.collection));

                    executable.push(() =>
                        batch_sell(
                            record.id,
                            record.created,
                            record.transaction as BatchSellingTransaction,
                        ),
                    );
                    break;
                }
            }
        }
        if (identity && executable.length) {
            checkWhitelist(identity, whitelist).then(() => executable.forEach((call) => call()));
        }
    }, [identity, records]);
    if (records.length === 0) return <></>;
    return (
        <>
            {contextHolder}
            {records.map((record, index) => (
                <SingleTransactionNotification
                    api={api}
                    key={record.id}
                    index={index}
                    record={record}
                />
            ))}
        </>
    );
}

export default TransactionNotification;
