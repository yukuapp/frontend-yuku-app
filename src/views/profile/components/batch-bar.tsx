import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Drawer } from 'antd';
import { BatchTransferModal } from '@/components/nft-card/components/transfer';
import { Button } from '@/components/ui/button';
import YukuIcon from '@/components/ui/yuku-icon';
import { getLedgerTokenIcp } from '@/utils/canisters/ledgers/special';
import { cn } from '@/common/cn';
import { useIdentityStore } from '@/stores/identity';
import { NftMetadata } from '@/types/nft';
import './index.less';

export default function BatchBar({ list }: { list: NftMetadata[] | undefined }) {
    const { pathname } = useLocation();
    const show = pathname.indexOf('/profile') !== -1;
    // const showBatchSellSidebar = useIdentityStore((s) => s.showBatchSellSidebar);
    // const toggleShowBatchSellSidebar = useIdentityStore((s) => s.toggleShowBatchSellSidebar);

    const identity = useIdentityStore((s) => s.connectedIdentity);

    const batchSales = useIdentityStore((s) => s.batchSales);

    const cleanBatchNftSales = useIdentityStore((s) => s.cleanBatchNftSales);
    const setBatchNftSales = useIdentityStore((s) => s.setBatchNftSales);
    const [batchTransferOpen, setBatchTransferOpen] = useState<boolean>(false);
    const toggleShowBatchSellSidebar = useIdentityStore((s) => s.toggleShowBatchSellSidebar);
    const [showMore, setShowMore] = useState<boolean>(false);
    if (!identity) return <></>;
    return (
        <>
            {batchTransferOpen && (
                <BatchTransferModal
                    open={batchTransferOpen}
                    onClose={() => setBatchTransferOpen(false)}
                />
            )}

            <div
                className={cn(
                    'fixed bottom-0  left-0 right-0 z-[100] w-full flex-col border-t border-solid border-[#283047] bg-[#101522] px-[30px]',
                    show && 'hidden md:flex',
                )}
            >
                <div className="flex h-20 w-full flex-row items-center justify-between">
                    <div className="flex flex-row items-start gap-6">
                        <Button
                            variant={'outline'}
                            className="relative flex h-10 w-fit items-center rounded-lg border border-solid  border-[#283047] bg-transparent px-[10px] text-white hover:bg-transparent/40 hover:text-white"
                        >
                            <div className="mr-[3px] font-inter-semibold text-sm ">
                                {batchSales.length}
                            </div>
                            <div className="w-10 font-inter-semibold text-sm text-white/70 ">
                                Items
                            </div>
                        </Button>
                        <div className="mt-3 flex w-32 shrink-0 flex-row items-start gap-3">
                            <div
                                className="my-auto mr-px cursor-pointer font-inter-semibold text-sm text-white hover:opacity-80"
                                onClick={() => {
                                    cleanBatchNftSales();
                                    setBatchNftSales(
                                        list
                                            ?.filter(
                                                (item) => item.listing?.listing.type !== 'listing',
                                            )
                                            .map((item) => {
                                                return {
                                                    token_id: item.metadata.token_id,
                                                    card: item,
                                                    owner: item.owner,
                                                    token: getLedgerTokenIcp(),
                                                    last:
                                                        item.listing?.listing.type === 'listing'
                                                            ? item.listing?.listing.price
                                                            : undefined,
                                                    price: '',
                                                };
                                            }),
                                    );
                                }}
                            >
                                Select All
                            </div>
                            <div
                                className="h-5 w-px shrink-0 border-y-0 border-l-0 border-r border-solid border-[#283047]"
                                id="Line"
                            />
                            <div
                                onClick={cleanBatchNftSales}
                                className="my-auto cursor-pointer font-inter-semibold text-sm text-white hover:opacity-80"
                            >
                                Clear
                            </div>
                        </div>
                    </div>
                    <div className="flex items-start gap-5">
                        <Button
                            variant={'outline'}
                            onClick={() => setBatchTransferOpen(true)}
                            className="flex h-10 w-32 flex-row  items-center justify-center gap-3 rounded-lg border-none bg-[#283047] hover:bg-[#283047]/60 hover:text-white"
                            disabled={
                                batchSales.filter((item) => item.owner.raw.standard !== 'ogy')
                                    .length === 0
                            }
                        >
                            <YukuIcon
                                name="action-transfer"
                                size={18}
                                color="white"
                                className="my-auto"
                            />

                            <div className="font-inter-bold text-sm text-white">Transfer</div>
                        </Button>
                        <Button
                            onClick={toggleShowBatchSellSidebar}
                            disabled={batchSales.length === 0}
                            className="flex h-10  flex-col items-center justify-center rounded-lg bg-shiku font-inter-bold text-sm text-white hover:bg-shiku/60 hover:text-white"
                        >
                            List {batchSales.length || ''} items
                        </Button>
                    </div>
                </div>
            </div>

            <div
                className={cn(
                    'fixed bottom-0 left-0 right-0 z-[9999] w-full flex-col border-t border-solid border-[#283047]  bg-[#101522] px-[18px]',
                    show && 'flex md:hidden',
                )}
            >
                <div className="flex h-[58px] w-full flex-row items-center justify-between gap-x-[20px]">
                    <Button
                        className="border border-common bg-transparent p-[8px]"
                        onClick={() => {
                            setShowMore((p) => !p);
                        }}
                    >
                        <img src="/img/profile/show-more.svg" alt="" />
                    </Button>
                    <div className="absolute bottom-full left-0 right-0 ">
                        <Drawer
                            placement="bottom"
                            onClose={() => {
                                setShowMore(false);
                            }}
                            height={157}
                            closeIcon={null}
                            open={showMore}
                            rootClassName="batch-bar-container"
                        >
                            <div className="flex h-full flex-col items-start gap-6 p-[15px]">
                                <div className="flex w-full justify-between">
                                    <div className="font-inter-semibold text-[16px] ">Sweep</div>
                                    <div
                                        onClick={cleanBatchNftSales}
                                        className="my-auto cursor-pointer font-inter-semibold text-sm text-shiku hover:opacity-80"
                                    >
                                        Clear
                                    </div>
                                </div>
                                <div className="flex h-[40px] w-full shrink-0 items-center gap-x-[15px] rounded-[8px] border border-solid  border-common px-[14px] ">
                                    <img
                                        src="/img/profile/select-all.svg"
                                        className="w-[20px] text-white"
                                        alt=""
                                    />
                                    <div
                                        className="my-auto mr-px cursor-pointer font-inter-semibold text-sm hover:opacity-80"
                                        onClick={() => {
                                            cleanBatchNftSales();
                                            setBatchNftSales(
                                                list
                                                    ?.filter(
                                                        (item) =>
                                                            item.listing?.listing.type !==
                                                            'listing',
                                                    )
                                                    .map((item) => {
                                                        return {
                                                            token_id: item.metadata.token_id,
                                                            card: item,
                                                            owner: item.owner,
                                                            token: getLedgerTokenIcp(),
                                                            last:
                                                                item.listing?.listing.type ===
                                                                'listing'
                                                                    ? item.listing?.listing.price
                                                                    : undefined,
                                                            price: '',
                                                        };
                                                    }),
                                            );
                                        }}
                                    >
                                        Select All
                                    </div>
                                </div>
                                <div
                                    onClick={() => setBatchTransferOpen(true)}
                                    className="flex h-[40px] w-full shrink-0 items-center gap-x-[12px] rounded-[8px] border border-solid  border-common px-[14px] "
                                >
                                    <YukuIcon
                                        name="action-transfer"
                                        size={24}
                                        color="white"
                                        className="my-auto"
                                    />
                                    <div className="font-inter-bold text-[14px]">Transfer</div>
                                </div>
                            </div>
                        </Drawer>
                    </div>
                    <Button
                        onClick={toggleShowBatchSellSidebar}
                        disabled={batchSales.length === 0}
                        className="flex h-10 flex-1  flex-col items-center justify-center rounded-lg bg-shiku font-inter-bold text-sm text-white hover:bg-shiku/60 hover:text-white"
                    >
                        List {batchSales.length || ''} items
                    </Button>
                </div>
            </div>
        </>
    );
}
