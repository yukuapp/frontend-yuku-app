import { useEffect, useState } from 'react';
import { Modal } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import _ from 'lodash';
import message from '@/components/message';
import NftName from '@/components/nft/name';
import NftThumbnail from '@/components/nft/thumbnail';
import { checkSellPrice } from '@/hooks/exchange/single/sell';
import { useYukuPlatformFee } from '@/hooks/interval/platform_fee';
import { useTokenRate } from '@/hooks/interval/token_rate';
import { getLedgerIcpDecimals, getLedgerOgyDecimals } from '@/utils/canisters/ledgers/special';
import { getYukuServiceFee } from '@/utils/nft/fee';
import { cn } from '@/common/cn';
import { exponentNumber } from '@/common/data/numbers';
import { uniqueKey } from '@/common/nft/identifier';
import { useCollectionStore } from '@/stores/collection';
import { useIdentityStore } from '@/stores/identity';
import { TransactionRecord } from '@/stores/transaction';
import { BatchSellingTransaction } from '@/types/exchange/batch-sell';
import { BatchNftSale } from '@/types/yuku';
import { useBatchSellNftByTransaction } from '../../../../hooks/exchange/batch/sell';
import ShowNumber from '../../../data/number';
import { Button } from '../../../ui/button';
import CloseIcon from '../../../ui/close-icon';
import './index.less';
import BatchListingItem from './item';

export function BatchSaleResultModal({
    record,
    transaction,
    onClose,
}: {
    record: TransactionRecord;
    transaction: BatchSellingTransaction;
    onClose: () => void;
}) {
    const sale_list = transaction.args.sales;

    const executing = record.status === 'executing';
    const stopped = record.stopped;

    const found = transaction.actions.find((a) => a.action === 'BATCH_yuku_LISTING');

    if (!found) {
        return <></>;
    }
    const success = found.data.success.filter((s) => s.result === '') as BatchNftSale[];

    return (
        <Modal
            open={!executing && !stopped && sale_list?.length !== success.length}
            footer={null}
            className="batch-result-modal"
            closeIcon={null}
            centered={true}
            width={550}
            onCancel={onClose}
        >
            <div className={'flex h-full w-full flex-col justify-between'}>
                <div className="mb-[19px]  flex w-full items-start justify-between md:mb-[25px]">
                    <div className="text-left font-inter-bold text-[20px]">List Failed</div>
                    <CloseIcon className="w-[16px]" onClick={onClose}></CloseIcon>
                </div>
                <div className="grid w-full grid-cols-3 flex-wrap items-center gap-x-[24px]  gap-y-[20px] md:grid-cols-5">
                    {_.difference(sale_list, success).map((item, index) => (
                        <div
                            key={uniqueKey(item.token_id) + index}
                            className="flex h-full w-full cursor-pointer flex-col justify-between"
                        >
                            <NftThumbnail cdn_width={100} token_id={item.token_id} />
                            <NftName token_id={item.token_id} />
                        </div>
                    ))}
                </div>
                <div className="font-inter-normal mt-[30px] w-full text-left  text-[14px]">
                    The result of your list request of {sale_list?.length} NFTs:
                    <span className="text-shiku">
                        {success?.length} successes,{' '}
                        {sale_list && success && sale_list?.length - success.length} failures
                    </span>
                </div>
                {sale_list?.length !== success.length && (
                    <div className="font-inter-normal m-auto hidden  text-left text-[14px]">
                        Please try again!
                    </div>
                )}
            </div>
        </Modal>
    );
}
function BatchSalesList() {
    const showBatchSellSidebar = useIdentityStore((s) => s.showBatchSellSidebar);
    const toggleShowBatchSellSidebar = useIdentityStore((s) => s.toggleShowBatchSellSidebar);
    const identity = useIdentityStore((s) => s.connectedIdentity);
    const batchSales = useIdentityStore((s) => s.batchSales);

    const reloadCoreCollectionDataList = useCollectionStore((s) => s.reloadCoreCollectionDataList);
    const YukuPlatformFee = useYukuPlatformFee();
    const total_icp = batchSales
        .filter((t) => t.token.symbol === 'ICP')
        .filter((t) => t.price)
        .map((t) => BigInt(t.price ? exponentNumber(t.price, Number(t.token.decimals)) : '0'))
        .reduce((a, b) => a + b, BigInt(0));
    const total_ogy = batchSales
        .filter((t) => t.token.symbol === 'OGY')
        .filter((t) => t.price)
        .map((t) => BigInt(t.price ? exponentNumber(t.price, Number(t.token.decimals)) : '0'))
        .reduce((a, b) => a + b, BigInt(0));

    const { batchSell, executing } = useBatchSellNftByTransaction();

    const onListAll = async () => {
        if (executing) return;

        for (const sale of batchSales) {
            const checked = checkSellPrice(sale.price, Number(sale.token.decimals), 0.01);
            if (checked) return message.error(checked);
        }

        batchSell(
            identity!,
            batchSales.map((s) => ({
                ...s,
                price: exponentNumber(s.price, Number(s.token.decimals)),
                result: undefined,
            })),
        );

        toggleShowBatchSellSidebar();
    };

    const [floorFlag, setFloorFlag] = useState<number>(0);

    const { icp_usd, ogy_usd } = useTokenRate();
    const total_icp_usd =
        icp_usd !== undefined
            ? Number(exponentNumber(`${total_icp}`, -getLedgerIcpDecimals())) * Number(icp_usd)
            : undefined;
    const total_ogy_usd =
        ogy_usd !== undefined
            ? Number(exponentNumber(`${total_ogy}`, -getLedgerIcpDecimals())) * Number(ogy_usd)
            : undefined;

    useEffect(() => {
        showBatchSellSidebar && reloadCoreCollectionDataList();
    }, [showBatchSellSidebar]);

    if (!identity) return <></>;

    return (
        <>
            <Modal
                open={showBatchSellSidebar}
                closeIcon={null}
                footer={null}
                centered={true}
                className="batch-sell-modal"
                width={609}
                onCancel={() => toggleShowBatchSellSidebar()}
                maskClosable={true}
            >
                <div className="flex items-center p-[20px] md:p-[30px]">
                    <div className="flex w-full justify-between">
                        <div className="font-inter-bold text-[18px]">List For Sale</div>
                        <CloseIcon onClick={toggleShowBatchSellSidebar} />
                    </div>
                </div>

                <div
                    className="hidden grid-cols-3 px-[30px] text-[14px] text-white/70 md:grid"
                    style={{ gridTemplateColumns: '3fr 3fr 2fr' }}
                >
                    <div>Item</div>
                    <div>Price</div>
                    <div>Creator royalty</div>
                </div>

                <div
                    className="grid grid-cols-2  px-[20px] text-[14px] text-white/70 md:hidden"
                    style={{ gridTemplateColumns: '3fr 3fr' }}
                >
                    <div>Item</div>
                    <div>Price</div>
                </div>
                <div className="mt-[26px] flex h-[378px] flex-col gap-y-[22px] overflow-y-scroll px-[20px] md:px-[30px]">
                    {batchSales.map((sale) => (
                        <div key={uniqueKey(sale.token_id)} className="">
                            <BatchListingItem sale={sale} floorFlag={floorFlag} />
                        </div>
                    ))}
                </div>
                <div className="bottom-[31px] px-[20px] md:px-[30px]">
                    <ul className="m-auto mb-[19px] mt-[30px] flex list-none  items-center p-0 leading-none">
                        <li className="mr-[14px] font-inter-semibold text-[12px]">Fees:</li>
                        <li className="font-inter-normal mr-[14px] text-[12px] text-opacity-75">
                            Service fee
                        </li>
                        <li className="font-inter-semibold text-[12px]">
                            {getYukuServiceFee(YukuPlatformFee) ?? '--'}%
                        </li>
                    </ul>
                </div>
                <div className="flex flex-col items-start justify-between border-t border-common px-[20px] py-[22px] md:flex-row md:items-center md:px-[30px]">
                    <div
                        className="cursor-pointer font-inter-medium text-[14px] text-shiku hover:opacity-80"
                        onClick={() => setFloorFlag((r) => r + 1)}
                    >
                        Apply floor price to all
                    </div>
                    <ul className="flex w-full list-none items-center justify-end gap-x-[15px] p-0 md:w-auto">
                        <li className="ml-0 mr-auto shrink-0  font-inter-medium text-[14px]  md:ml-[16px]  md:text-[20px]">
                            Total
                        </li>
                        <div className="h-[38px] w-px bg-[#DDD]"></div>
                        <div className="flex items-center">
                            <span
                                className={cn(
                                    'mr-[5px] flex h-[38px] flex-col items-end justify-between font-inter-semibold text-[12px] leading-[14px]',
                                    (!total_icp || !total_ogy) && 'justify-center',
                                )}
                            >
                                {total_icp > 0 && (
                                    <div className="flex items-end">
                                        <ShowNumber
                                            className="mr-[3px] font-inter-semibold"
                                            value={{
                                                value: exponentNumber(
                                                    `${total_icp}`,
                                                    -getLedgerIcpDecimals(),
                                                ),
                                                scale: 2,
                                                paddingEnd: 2,
                                            }}
                                        />
                                        ICP
                                    </div>
                                )}
                                {total_ogy > 0 && (
                                    <div className="flex items-end font-inter-semibold">
                                        <ShowNumber
                                            className="mr-[3px]"
                                            value={{
                                                value: exponentNumber(
                                                    `${total_ogy}`,
                                                    -getLedgerOgyDecimals(),
                                                ),
                                                scale: 2,
                                                paddingEnd: 2,
                                            }}
                                        />
                                        OGY
                                    </div>
                                )}
                            </span>
                            {total_icp_usd !== undefined && total_ogy_usd !== undefined && (
                                <div className="mr-[10px]">{`($${(
                                    total_icp_usd + total_ogy_usd
                                ).toFixed(2)})`}</div>
                            )}
                        </div>{' '}
                        <Button
                            className="flex h-[36px] w-[86px] shrink-0 cursor-pointer  items-center rounded-[8px] bg-shiku text-center font-inter-bold text-[14px] text-white  hover:bg-shiku/60 hover:text-white md:h-[40px]"
                            onClick={onListAll}
                        >
                            List {executing && <LoadingOutlined className="ml-[10px]" />}
                        </Button>
                    </ul>
                </div>
            </Modal>
        </>
    );
}

export default BatchSalesList;
