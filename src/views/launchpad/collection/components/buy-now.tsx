import { useEffect, useState } from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { Skeleton } from 'antd';
import TokenPrice from '@/components/data/price';
import Usd from '@/components/data/usd';
import { IconCopy } from '@/components/icons';
import message from '@/components/message';
import YukuIcon from '@/components/ui/yuku-icon';
import { useLaunchpadPurchase } from '@/hooks/views/launchpad';
import {
    LaunchpadCollectionInfo,
    LaunchpadCollectionStatus,
} from '@/canisters/yuku-old/yuku_launchpad';
import { cdn } from '@/common/cdn';
import { cn } from '@/common/cn';
import { useIdentityStore } from '@/stores/identity';
import { LaunchpadBuyModal } from './buy-modal';

export const LaunchpadBuyNow = ({
    info,
    status,
    update,
}: {
    info: LaunchpadCollectionInfo;
    status: LaunchpadCollectionStatus;
    update: () => void;
}) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const description = info.description;

    const identity = useIdentityStore((s) => s.connectedIdentity);

    const showReadMore = description.length > 150;
    const [fold, setFold] = useState<boolean>(showReadMore);

    const { max, price, buy, action } = useLaunchpadPurchase(info, status);

    const [purchaseQuantity, setPurchaseQuantity] = useState<number>(1);

    useEffect(() => {
        if (max <= 0) setPurchaseQuantity(1);
        else if (purchaseQuantity > max) setPurchaseQuantity(max);
        else if (purchaseQuantity === 0 && max > 0) setPurchaseQuantity(1);
    }, [max]);

    const onPurchaseQuantityChange = ({ target: { value } }) => {
        try {
            let num = Number(value);
            if (isNaN(num)) throw new Error('not a number');
            if (num < 1) num = 1;
            if (num >= max) num = max;
            setPurchaseQuantity(num ? num : 1);
        } catch {
            setPurchaseQuantity(1);
        }
    };
    const purchaseQuantitySubtract = () => {
        if (max === 0) return message.error(`you can not purchase`);
        if (purchaseQuantity <= 1) return message.error('too small');
        setPurchaseQuantity(purchaseQuantity - 1);
    };
    const purchaseQuantityAdd = () => {
        if (max === 0) return message.error(`you can not purchase`);
        if (purchaseQuantity >= max) return message.error('too large');
        setPurchaseQuantity(purchaseQuantity + 1);
    };

    const [modalOpen, setModalOpen] = useState<boolean>(false);

    const onBuy = () => {
        if (!identity) return navigate('/connect');
        if (max === 0) return message.error(`you can not purchase`);

        setModalOpen(true);
    };
    const onClose = () => {
        setModalOpen(false);
    };

    return (
        <>
            {
                <LaunchpadBuyModal
                    info={{
                        featured: info.featured,
                        name: info.name,
                        price: price,
                        amount: purchaseQuantity,
                    }}
                    open={modalOpen}
                    onClose={onClose}
                    buy={buy}
                    update={update}
                    action={action}
                />
            }

            <img
                className="mb-10 w-full rounded-[16px] md:w-5/12"
                src={cdn(info.featured)}
                alt=""
            />
            <div className="top-[100px] z-10 flex h-0 flex-1 flex-col md:sticky md:pl-14">
                <h2 className="text-[24px] font-semibold text-white">{info.name}</h2>
                <p className={`mt-2 text-[14px] text-[#fff]/60 md:mt-4 md:text-[16px]`}>
                    {showReadMore && fold ? `${description.substring(0, 150)}...` : description}
                </p>
                {showReadMore ? (
                    <div
                        onClick={() => setFold(!fold)}
                        className="group mt-3 flex cursor-pointer text-[14px] font-bold text-[#fff]"
                    >
                        {t('launchpad.main.readMore')}
                    </div>
                ) : null}

                <div className="mt-3 flex flex-col md:mt-7">
                    <span className="mb-4 flex justify-between">
                        <p className="text-[12px] text-[#fff]/60">
                            {t('launchpad.main.blockchain')}
                        </p>
                        <p className="text-[12px] text-[#fff]/60">Internet Computer</p>
                    </span>
                    <span className="flex justify-between">
                        <p className="text-[12px] text-[#fff]/60">{t('launchpad.main.address')}</p>
                        <p className="flex text-[12px] text-[#fff]/60">
                            <CopyToClipboard
                                text={info.collection}
                                onCopy={() => message.success(`Copied`)}
                            >
                                <IconCopy className="m-auto mr-[6px] h-3 w-3 cursor-pointer" />
                            </CopyToClipboard>
                            {info.collection}
                        </p>
                    </span>
                </div>
                <div className="mt-[26px] flex flex-col">
                    <span className="mb-3 flex justify-between">
                        <p className="text-[12px] text-[#fff]/60">{t('launchpad.main.total')}</p>
                        <p className="flex text-[12px] text-[#fff]/60">
                            {Number(info.remain)}/
                            <em className="not-italic text-[#fff]/60">{info.supply}</em>
                        </p>
                    </span>
                    <div className="relative mt-2">
                        <div className=" h-3 rounded-[6px] bg-[#283047]"></div>
                        <div
                            className="absolute left-0 top-0 flex h-3 justify-end rounded-[6px] bg-[#fff]"
                            style={{
                                width: `${(Number(info.remain) / Number(info.supply)) * 100}%`,
                            }}
                        >
                            <i className="relative -top-[3px] h-[18px] w-[18px] rounded-full border-[4px] border-[#fff] bg-[#fff]"></i>
                        </div>
                    </div>
                    <div className="mt-9 flex w-full flex-row items-center justify-between rounded-[6px] bg-[#191E2E] px-[5px] py-[10px] md:h-[100px] md:rounded-[16px] md:px-5 md:py-5">
                        <div className="flex items-center">
                            <div
                                onClick={purchaseQuantitySubtract}
                                className="mr-[5px] flex h-[13px] w-[13px] flex-shrink-0 cursor-pointer items-center justify-center rounded-[4px] bg-[#283047] md:h-[24px] md:w-[24px]"
                            >
                                <YukuIcon
                                    name="action-decrement"
                                    size={14}
                                    className="text-[#fff] hover:text-[#fff]"
                                />
                            </div>
                            <div className="h-[35px] w-[35px] flex-shrink-0 rounded-[8px] bg-[#283047] px-[5px] md:h-[65px] md:w-[65px]">
                                <input
                                    className="custom-input h-full w-full bg-transparent text-center text-[22px] font-bold text-[#fff] outline-none"
                                    value={purchaseQuantity}
                                    onChange={onPurchaseQuantityChange}
                                    type="number"
                                />
                            </div>
                            <div
                                onClick={purchaseQuantityAdd}
                                className="ml-[5px] flex h-[13px] w-[13px] flex-shrink-0 cursor-pointer items-center justify-center rounded-[4px] bg-[#283047] md:h-[24px] md:w-[24px]"
                            >
                                <YukuIcon
                                    name="action-increment"
                                    size={14}
                                    className="text-[#fff] hover:text-[#fff]"
                                />
                            </div>
                        </div>
                        <div className="flex flex-1 items-center justify-end text-[18px] font-bold text-[#fff] md:mt-3 md:justify-center md:text-[22px]">
                            Total:&nbsp;
                            {price !== '0' ? (
                                <TokenPrice
                                    value={{
                                        value: `${Number(price) * Number(purchaseQuantity)}`,
                                        decimals: { type: 'exponent', value: 8 },
                                        scale: 2,
                                    }}
                                    className="font-inter text-[18px] md:text-[20px] "
                                />
                            ) : (
                                '--'
                            )}
                            <em className="not-italic text-[#fff]">&nbsp;ICP</em>
                            {purchaseQuantity > 0 ? (
                                <>
                                    <Usd
                                        value={{
                                            value: `${Number(price) * Number(purchaseQuantity)}`,
                                            decimals: { type: 'exponent', value: 8 },
                                            symbol: 'ICP',
                                            scale: 2,
                                        }}
                                        className="font-inter text-[18px] text-[#fff] md:text-[20px]"
                                    />
                                </>
                            ) : (
                                ''
                            )}
                        </div>
                    </div>
                    <div className="mt-[38px] flex h-[50px] justify-between">
                        <button
                            className={cn(
                                'flex h-full w-3/5 flex-shrink-0 cursor-pointer items-center justify-center rounded-[8px] bg-[#36F] text-[16px] font-bold text-[#fff]',
                                (max === 0 || action) &&
                                    identity &&
                                    'cursor-not-allowed opacity-10',
                            )}
                            onClick={() => {
                                max !== 0 && !action && onBuy();
                            }}
                        >
                            {identity && t('launchpad.main.buyNow')}
                            {!identity && t('launchpad.main.connect')}
                        </button>
                        <Link to={`/market/${info.collection}`}>
                            <div className=" flex h-full flex-1 cursor-pointer items-center text-[12px] font-bold text-[#fff]/60 md:ml-6 md:text-[16px]">
                                {t('launchpad.main.collection')}
                                <YukuIcon
                                    name="arrow-right"
                                    size={20}
                                    className="ml-[5px] cursor-pointer text-[#fff]/60"
                                />
                            </div>
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
};

export const LaunchpadBuyNowSkeleton = () => {
    return (
        <>
            <div className="mb-10 h-[400px] w-full rounded-[16px] md:w-5/12">
                <Skeleton.Image className="!h-full !w-full" />
            </div>
            <div className="top-[100px] z-10 flex h-0 flex-1 flex-col md:sticky md:pl-14">
                <Skeleton.Input className="!h-6 !w-3/5 !min-w-0" />

                <div className="mt-3">
                    <Skeleton.Input className="!h-4 !w-full !min-w-0" />
                    <Skeleton.Input className="!h-4 !w-full !min-w-0" />
                    <Skeleton.Input className="!h-4 !w-full !min-w-0" />
                </div>

                <div className="mt-3 flex flex-col md:mt-5">
                    <span className="mb-4 flex w-full justify-between">
                        <Skeleton.Input className="!h-4 !min-w-0" />
                        <Skeleton.Input className="!h-4 !min-w-0" />
                    </span>
                    <span className="flex justify-between">
                        <Skeleton.Input className="!h-4 !min-w-0" />
                        <Skeleton.Input className="!h-4 !min-w-0" />
                    </span>
                    <span className="mt-2 flex justify-between">
                        <Skeleton.Input className="!h-4 !min-w-0" />
                        <Skeleton.Input className="!h-4 !min-w-0" />
                    </span>
                </div>
                <Skeleton.Input className="mt-3 !h-4 !w-full !min-w-0" />

                <Skeleton.Button className="mt-3 !h-[50px] !w-full" />

                <div className="mt-[20px] flex h-[50px] md:mt-[30px]">
                    <div className="flex h-full w-3/5 flex-shrink-0 items-center justify-center rounded-[8px] text-[16px] font-bold text-[#fff]">
                        <Skeleton.Button className="!h-[50px] !w-full" />
                    </div>
                </div>
            </div>
        </>
    );
};
