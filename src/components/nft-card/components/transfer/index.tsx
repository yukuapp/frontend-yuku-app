import { Dispatch, SetStateAction, useEffect, useMemo, useState } from 'react';
import { isMobile } from 'react-device-detect';
import { Modal } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import _ from 'lodash';
import { Autoplay } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Swiper as SwiperType } from 'swiper/types';
import message from '@/components/message';
import NftName from '@/components/nft/name';
import { checkWhitelist } from '@/hooks/common/whitelist';
import { useTransferNft } from '@/hooks/exchange/single/transfer';
import { cn } from '@/common/cn';
import { alreadyMessaged } from '@/common/data/promise';
import { isAccountHex } from '@/common/ic/account';
import { isPrincipalText } from '@/common/ic/principals';
import { uniqueKey } from '@/common/nft/identifier';
import { useIdentityStore } from '@/stores/identity';
import { TransferNftExecutor, TransferringAction } from '@/types/exchange/single-transfer';
import { ConnectedIdentity } from '@/types/identity';
import { NftMetadata } from '@/types/nft';
import { BatchNftSale } from '@/types/yuku';
import NftThumbnail from '../../../nft/thumbnail';
import AspectRatio from '../../../ui/aspect-ratio';
import { Button } from '../../../ui/button';
import CloseIcon from '../../../ui/close-icon';
import { Input } from '../../../ui/input';
import './index.less';

function TransferModal({
    identity,
    card,
    transfer,
    action,
    refreshList,
    onClose,
}: {
    identity: ConnectedIdentity;
    card: NftMetadata;
    transfer: TransferNftExecutor;
    action: TransferringAction;
    refreshList: () => void;
    onClose: () => void;
}) {
    const [open, setOpen] = useState(true);

    const removeBatchNftSale = useIdentityStore((s) => s.removeBatchNftSale);

    const [target, setTarget] = useState('');

    const [showError, setShowError] = useState<boolean>(false);

    const onTargetChange = ({ target: { value } }) => setTarget(value);

    const onConfirm = async () => {
        if (action !== undefined) return;

        if (isPrincipalText(target)) {
            //
        } else if (isAccountHex(target)) {
            //
        } else {
            message.error('Invalid principal or account');
            setShowError(true);
            return;
        }

        setOpen(false);
        transfer(identity, card.owner, target)
            .then(alreadyMessaged)
            .then(() => {
                message.success('Transfer Succeeded.');
                removeBatchNftSale(card.metadata.token_id);
                refreshList();
                onClose();
                setShowError(false);
            })
            .catch();
    };

    const onModalClose = () => {
        setOpen(false);
        onClose();
    };

    return (
        <>
            <Modal
                open={open}
                onOk={onConfirm}
                onCancel={onModalClose}
                centered={true}
                width={600}
                footer={null}
                closeIcon={<CloseIcon></CloseIcon>}
                className="transfer-modal"
            >
                <div className="hidden">{action}</div>
                <div className="mb-[20px] font-inter-bold text-[20px] text-white">Transfer NFT</div>
                <div className="mb-[15px] font-inter-medium text-white/70">
                    Please enter the account ID or principal ID you want to send the NFT to.
                </div>
                {showError && (
                    <div className="mb-[25px] flex items-center font-inter-medium text-[14px]">
                        <img
                            className="mr-[8px] h-[16px] w-[16px] rounded-[16px]"
                            src={'/img/profile/group.svg'}
                            alt=""
                        />
                        Beware, not all wallets support all tokens.
                    </div>
                )}
                <input
                    className="font-inter-normal h-[50px] w-full rounded-[8px] border border-[#283047] bg-transparent pl-[15px] text-[14px] leading-[50px] text-white placeholder:text-white/70 focus-visible:outline-none md:w-[540px]"
                    placeholder="account ID or principal ID to send"
                    value={target}
                    onChange={onTargetChange}
                />
                <div className="mt-[30px] flex cursor-pointer justify-center">
                    <div
                        onClick={onModalClose}
                        className="mr-[18px] h-[48px] w-[150px] flex-shrink-0 rounded-[8px] border border-solid border-black/60 bg-[#283047] text-center font-inter-bold text-[16px]  leading-[48px] text-white hover:bg-[#283047]/60    hover:text-white"
                    >
                        Cancel
                    </div>
                    <div
                        onClick={onConfirm}
                        className="h-[48px] w-[150px] flex-shrink-0 rounded-[8px] bg-shiku text-center font-inter-bold text-[16px] leading-[48px] text-white hover:bg-shiku/60 hover:text-white"
                    >
                        Transfer
                    </div>
                </div>
            </Modal>
            {/* {show && (
                <ActionStepsModal title={title} actions={actions} action={action} failed={failed} />
            )} */}
        </>
    );
}

const SingleCard = ({
    card,
    to,
    transferFlag,
    setNftLeft,
}: {
    card: BatchNftSale;
    to: string;
    transferFlag: number;
    setNftLeft: Dispatch<SetStateAction<number>>;
}) => {
    const { transfer, action } = useTransferNft();
    const identity = useIdentityStore((s) => s.connectedIdentity);

    const [success, setSuccess] = useState<boolean>(false);
    const removeBatchNftSale = useIdentityStore((s) => s.removeBatchNftSale);
    useEffect(() => {
        if (card.owner.raw.standard === 'ogy' || !identity || !transferFlag) {
            return;
        }
        transfer(identity, card.owner, to, true)
            .then(alreadyMessaged)
            .then(() => {
                setSuccess(true);
                setNftLeft((p) => p - 1);
                //
            })
            .catch();
    }, [transferFlag, identity]);

    useEffect(() => {
        return () => {
            success && removeBatchNftSale(card.token_id);
        };
    }, [success]);
    return (
        <div className="mt-1 flex w-full shrink-0 flex-col items-start gap-2">
            <div className="relative w-full overflow-hidden rounded-[6px]">
                <NftThumbnail width="w-full" token_id={card.token_id} />
                <div
                    className={cn(
                        'absolute bottom-0 left-0 right-0 top-0 hidden bg-[#000] opacity-40',
                        action && 'block',
                    )}
                ></div>
                <div
                    className={cn(
                        'absolute bottom-0 left-0 right-0 top-0  hidden',
                        action && 'flex',
                    )}
                >
                    <LoadingOutlined style={{ color: '#fff' }} className="!m-auto text-[30px]" />
                </div>
                <div
                    className={cn(
                        'absolute  bottom-0 left-0 right-0 top-0 z-[10px] hidden bg-white/20 ',
                        success && 'flex',
                    )}
                >
                    <img src="/img/recorder/success.svg" className="z-[10px] m-auto w-1/3" alt="" />
                </div>
            </div>

            <NftName
                token_id={card.token_id}
                className="w-full  overflow-hidden whitespace-nowrap text-center font-inter-medium text-xs leading-[20px]"
                shrink_text={{ prefix: 6, suffix: 6 }}
            />
        </div>
    );
};
const checkTarget = (target: string): string | undefined => {
    if (isPrincipalText(target)) {
        return;
    } else if (isAccountHex(target)) {
        return;
    } else {
        return 'Invalid principal or account';
    }
};
export const BatchTransferModal = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
    const batchSales = useIdentityStore((s) => s.batchSales);
    const identity = useIdentityStore((s) => s.connectedIdentity);
    const [transferSwiper, setTransferSwiper] = useState<SwiperType | null>(null);
    const batchSalesFiltered = useMemo(
        () => batchSales.filter((o) => o.owner.raw.standard !== 'ogy'),
        [batchSales],
    );
    const whitelist = batchSalesFiltered.map((i) => i.owner.token_id.collection);
    const chunk_size = isMobile ? 3 : 4;
    const batchSalesChunked = useMemo(() => _.chunk(batchSalesFiltered, chunk_size), [batchSales]);

    const [currentPage, setCurrentPage] = useState<number>(0);

    const onSlideChange = (e: any) => setCurrentPage(e.realIndex);

    const [target, setTarget] = useState('');

    const onTargetChange = ({ target: { value } }) => setTarget(value);

    const [transferFlag, setTransferFlag] = useState<number>(0);

    const [total, setTotal] = useState<number>(0);
    useEffect(() => {
        setTotal(batchSalesFiltered.length);
    }, []);
    const [error, setError] = useState<string>();

    const [nftLeft, setNftLeft] = useState<number>(0);
    // const removeBatchNftSale = useIdentityStore((s) => s.removeBatchNftSale);

    useEffect(() => {
        setNftLeft(batchSalesFiltered.length);
    }, []);
    const onCloseSelf = () => {
        // transferFlag !== 0 && batchSalesFiltered.map((i) => removeBatchNftSale(i.token_id));
        onClose();
    };
    return (
        <Modal
            open={open}
            width={550}
            footer={null}
            closeIcon={null}
            centered={true}
            onCancel={onCloseSelf}
            className="batch-transfer-modal"
        >
            <div className="mb-6  flex flex-row items-center justify-between">
                <div className="self-start font-inter-bold text-xl leading-[20px]">
                    Transfer Items
                </div>
                <CloseIcon onClick={onCloseSelf} />
            </div>
            <div className="group relative flex flex-row items-center justify-between">
                <div
                    className={cn(
                        'absolute -left-2 z-[2] hidden h-6 w-6 shrink-0 -translate-y-1/2 cursor-pointer flex-col items-center justify-between rounded bg-[#283047] shadow-[0px_0px_8px_1px_rgba(0,_0,_0,_0.25)]',
                        currentPage !== 0 && 'group-hover:flex',
                    )}
                    onClick={() => transferSwiper?.slidePrev()}
                >
                    <img src="/img/profile/arrow.svg" className="my-auto w-3" />
                </div>
                <Swiper
                    className="batch-transfer-swiper cursor-pointer"
                    direction="horizontal"
                    height={isMobile ? 106 : 64}
                    loop={false}
                    modules={[Autoplay]}
                    autoplay={{
                        delay: 3000,
                        stopOnLastSlide: false,
                        disableOnInteraction: true,
                    }}
                    onSwiper={(swiper) => setTransferSwiper(swiper)}
                    onSlideChange={onSlideChange}
                >
                    {batchSalesChunked.length !== 0 ? (
                        batchSalesChunked.map((item) => {
                            return (
                                <SwiperSlide className="w-full px-[10px]">
                                    <div
                                        className={cn(
                                            'grid w-full grid-cols-4 items-center justify-between gap-x-[37px]',
                                            isMobile && 'grid-cols-3 gap-x-[10px]',
                                        )}
                                    >
                                        {item.length !== 0 ? (
                                            item.map((card) => (
                                                <SingleCard
                                                    key={'single-card' + uniqueKey(card.token_id)}
                                                    card={card}
                                                    to={target}
                                                    transferFlag={transferFlag}
                                                    setNftLeft={setNftLeft}
                                                />
                                            ))
                                        ) : (
                                            <AspectRatio />
                                        )}
                                    </div>
                                </SwiperSlide>
                            );
                        })
                    ) : (
                        <SwiperSlide className="w-full px-[10px]">
                            <div className="grid w-full grid-cols-4 items-center justify-between gap-x-[37px]">
                                <AspectRatio />
                            </div>
                        </SwiperSlide>
                    )}
                </Swiper>
                <div
                    onClick={() => transferSwiper?.slideNext()}
                    className={cn(
                        'absolute -right-2  z-[2] hidden h-6 w-6 shrink-0 -translate-y-1/2 cursor-pointer flex-col items-center justify-between rounded bg-[#283047] shadow-[0px_0px_8px_1px_rgba(0,_0,_0,_0.25)]',
                        currentPage !== batchSalesChunked.length - 1 &&
                            batchSalesChunked.length !== 0 &&
                            'group-hover:flex',
                    )}
                >
                    <img src="/img/profile/arrow.svg" className="my-auto w-3 rotate-180" />
                </div>
            </div>
            {batchSalesChunked.length > 1 && (
                <div className="mx-auto  mt-[30px] flex w-full justify-center gap-x-[15px]">
                    {batchSalesChunked.map((_, index) => (
                        <div
                            className={cn(
                                'h-3 w-3 cursor-pointer rounded-full bg-shiku opacity-20 transition duration-300',
                                index === currentPage && 'opacity-100',
                            )}
                            onClick={() => transferSwiper?.slideTo(index)}
                        ></div>
                    ))}
                </div>
            )}
            <div className=" mt-[25px] self-start text-[16px] font-semibold leading-[14px]">
                Address
            </div>

            <Input
                placeholder="Please enter the address"
                className="mt-4 h-10 rounded-lg border border-solid border-[#283047] bg-transparent px-[11px] py-[4px] font-inter-medium text-[14px] placeholder:text-[#DCDCDC]  focus-visible:shadow-none  "
                defaultValue={''}
                value={target}
                onChange={onTargetChange}
            />
            {error && <span className="pl-[7px] text-red-500">{error}</span>}
            {
                <div className="mt-[8px] flex items-center font-inter-medium text-[14px]">
                    <img
                        className="mr-[8px] h-[16px] w-[16px] rounded-[16px]"
                        src={'/img/profile/group.svg'}
                        alt=""
                    />
                    Beware, not all wallets support all tokens.{' '}
                </div>
            }

            <div className="mt-6 flex w-full">
                {nftLeft === 0 ? (
                    <Button
                        className="mx-auto flex h-10 shrink-0 flex-col items-center justify-center self-center rounded-lg bg-shiku text-white hover:bg-shiku/60 hover:text-white"
                        onClick={onCloseSelf}
                    >
                        OK
                    </Button>
                ) : (
                    <Button
                        className="mx-auto flex h-10 shrink-0 flex-col items-center justify-center self-center rounded-lg bg-shiku text-white hover:bg-shiku/60 hover:text-white"
                        id="Element2"
                        disabled={transferFlag !== 0}
                        onClick={() => {
                            const err = checkTarget(target);
                            if (err || !identity) {
                                setError(err || 'please connect wallet');
                            } else {
                                setError(undefined);
                                checkWhitelist(identity, whitelist).then(() =>
                                    setTransferFlag((p) => p + 1),
                                );
                            }
                        }}
                    >
                        {transferFlag === 0 ? (
                            `Transfer ${total} items`
                        ) : (
                            <div className="flex">
                                {`Transferring ${nftLeft}`}
                                <span>/{total}</span>
                            </div>
                        )}
                    </Button>
                )}
            </div>
        </Modal>
    );
};
export default TransferModal;
