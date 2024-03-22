import { useState } from 'react';
import { Modal } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import message from '@/components/message';
import { checkSellPrice } from '@/hooks/exchange/single/sell';
import { useYukuPlatformFee } from '@/hooks/interval/platform_fee';
import { getLedgerIcpDecimals, getLedgerTokenIcp } from '@/utils/canisters/ledgers/special';
import { getServiceFee } from '@/utils/nft/fee';
import {
    getCollectionNameByNftMetadata,
    getNameByNftMetadata,
    getThumbnailByNftMetadata,
} from '@/utils/nft/metadata';
import { cdn } from '@/common/cdn';
import { exponentNumber } from '@/common/data/numbers';
import { alreadyMessaged } from '@/common/data/promise';
import { justPreventLink } from '@/common/react/link';
import { useIdentityStore } from '@/stores/identity';
import { SellNftExecutor } from '@/types/exchange/single-sell';
import { ConnectedIdentity } from '@/types/identity';
import { NftMetadata, TokenInfo } from '@/types/nft';
import TokenPrice from '../../../data/price';
import Usd from '../../../data/usd';
import { IconLogoLedgerIcp } from '../../../icons';
import NftMedia from '../../../nft/media';
import { Button } from '../../../ui/button';
import CloseIcon from '../../../ui/close-icon';
import { Input } from '../../../ui/input';
import BalanceRefresh from '../../../user/balance/balance-refresh';
import './index.less';

export const isValidPrice = (value: string) => {
    const isNumber = /^\d+(\.\d{0,2})?$/.test(value);

    return isNumber && Number(value) >= 0.01;
};
function SellModal({
    identity,
    card,
    lastPrice,
    sell,
    executing,
    refreshListing,
    onClose,
}: {
    identity: ConnectedIdentity;
    card: NftMetadata;
    lastPrice?: string;
    sell: SellNftExecutor;
    executing: boolean;
    refreshListing: () => void;
    onClose: () => void;
}) {
    const [open, setOpen] = useState(true);

    const removeBatchNftSale = useIdentityStore((s) => s.removeBatchNftSale);

    const YukuPlatformFee = useYukuPlatformFee();

    const [price, setPrice] = useState(
        lastPrice ? `${exponentNumber(lastPrice, -getLedgerIcpDecimals())}` : '',
    );
    const priceWithDecimals = exponentNumber(price, getLedgerIcpDecimals());

    const onPriceChange = ({ target: { value } }) => {
        if (!value) {
            setPrice('');
            return;
        }
        if (Number(value) === 0) {
            setPrice(value);
            return;
        }
        isValidPrice(value) && setPrice(value);
    };

    const onConfirm = async () => {
        if (executing) return;

        const checked = checkSellPrice(price, getLedgerIcpDecimals(), 0.01);
        if (checked) return message.error(checked);

        const token: TokenInfo = getLedgerTokenIcp();

        const finalPrice = card.owner.raw.standard === 'ogy' ? priceWithDecimals : price;

        setOpen(false);
        sell(identity, card.owner, token, finalPrice)
            .then(alreadyMessaged)
            .then(() => {
                removeBatchNftSale(card.metadata.token_id);
                refreshListing();
                onClose();
            })
            .catch();
    };

    const onModalClose = () => {
        setOpen(false);
        onClose();
    };
    return (
        <div onClick={justPreventLink}>
            <Modal
                open={open}
                footer={null}
                onOk={onConfirm}
                onCancel={onModalClose}
                closeIcon={null}
                centered={true}
                width={600}
                className="sell-modal"
            >
                <div className="mb-[30px] flex w-full items-center justify-between p-[20px] pb-0 md:p-[30px]">
                    <div className="font-inter-bold text-[20px] leading-none">
                        List item for sale
                    </div>
                    <CloseIcon className="w-[14px]" onClick={onModalClose} />
                </div>
                <div className="hidden w-full flex-col gap-x-[24px]  md:flex">
                    <div className="px-[30px]">
                        <div className="flex justify-between">
                            <div className="flex flex-1 flex-col justify-between">
                                <div className="mb-[10px] font-inter-medium text-[14px] text-white/70">
                                    {getCollectionNameByNftMetadata(card)}
                                </div>
                                <div className="mb-auto font-inter-bold  text-[18px] leading-none">
                                    {getNameByNftMetadata(card)}
                                </div>

                                <div className="flex items-center leading-none">
                                    <IconLogoLedgerIcp className="mr-[7px] w-[18px]" />
                                    <TokenPrice
                                        className="mr-[5px] font-inter-semibold text-[20px] md:text-[20px]"
                                        value={{
                                            value: priceWithDecimals,
                                            decimals: {
                                                value: getLedgerIcpDecimals(),
                                                type: 'exponent',
                                            },
                                            symbol: '',
                                            scale: 2,
                                            paddingEnd: 2,
                                        }}
                                    />
                                    <Usd
                                        className="font-inter-medium text-white/70"
                                        value={{
                                            value: price,
                                            scale: 2,
                                            symbol: 'ICP',
                                        }}
                                    />
                                </div>
                            </div>
                            <div className="w-[90px]">
                                <NftMedia
                                    className="block rounded-[8px]"
                                    src={cdn(getThumbnailByNftMetadata(card))}
                                    metadata={card.metadata}
                                />
                            </div>
                        </div>
                        <div className="mt-10 font-inter-semibold leading-none text-white/70">
                            Price
                        </div>
                        <div className="mt-[10px] flex w-full flex-shrink-0 items-center rounded-[8px]">
                            <Input
                                className="h-[40px] flex-1  rounded-[6px] rounded-r-none border border-[#283047]  bg-transparent px-[10px] font-inter-bold text-[14px] "
                                value={price}
                                onChange={onPriceChange}
                            />
                            <div className="flex h-[40px] rounded-[6px] rounded-l-none border border-l-0 border-[#283047] px-[15px] font-inter-semibold text-[14px]">
                                <span className="my-auto">ICP</span>
                            </div>
                        </div>
                        <div className="mt-[40px]">
                            <span className="font-inter-medium leading-none text-white/70">
                                commission
                            </span>
                            <div className="mt-[10px] flex flex-col gap-y-[11px] rounded-[8px] border border-[#283047] bg-[#1A2236]  px-[10px] py-[16px] font-inter-medium text-[14px] text-white">
                                <div className="flex w-full items-center justify-between  ">
                                    <span className="font mr-[8px] leading-[16px] ">
                                        Service Fee
                                    </span>
                                    <span className="">
                                        {' '}
                                        {getServiceFee(card, YukuPlatformFee) ?? '--'}%
                                    </span>
                                </div>
                                <div className="flex items-center justify-between ">
                                    <span className=" mr-[8px] text-white">Creator Royalty</span>
                                    <span className="">{card.data?.info.royalties ?? '--'}%</span>
                                </div>
                            </div>
                        </div>
                        <div className="mt-[30px] flex justify-between">
                            <span className=" font-inter-semibold text-[20px]">Total</span>
                            <div className="flex items-center leading-none">
                                <IconLogoLedgerIcp className="mr-[7px] w-[18px]" />

                                <TokenPrice
                                    className="mr-[5px] font-inter-semibold text-[20px]  md:text-[20px]"
                                    value={{
                                        value: priceWithDecimals,
                                        decimals: {
                                            value: getLedgerIcpDecimals(),
                                            type: 'exponent',
                                        },
                                        symbol: '',
                                        scale: 2,
                                        paddingEnd: 2,
                                    }}
                                />
                                <Usd
                                    className="text-[14px] text-white/70"
                                    value={{
                                        value: price,
                                        symbol: 'ICP',
                                        scale: 2,
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="mt-[15px] flex cursor-pointer items-center justify-between border-t border-common p-[30px]">
                        <div className="flex h-fit flex-col gap-y-[5px]">
                            <BalanceRefresh symbol={'ICP'} />
                        </div>
                        <div className="flex items-center gap-x-[27px]">
                            {' '}
                            <Button
                                onClick={onModalClose}
                                variant={'outline'}
                                className="h-[36px] w-[86px] flex-shrink-0 rounded-[8px] border border-solid border-black/60 bg-[#283047]  text-center font-inter-bold text-[16px] leading-[36px]  text-white hover:bg-[#283047]/60  hover:text-white"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={onConfirm}
                                className="h-[36px] min-w-[86px] flex-shrink-0 rounded-[8px] bg-shiku text-center font-inter-bold  text-[16px] leading-[36px] text-white hover:bg-shiku/60 hover:text-white"
                                disabled={executing}
                            >
                                Confirm {executing && <LoadingOutlined className="ml-1" />}
                            </Button>
                        </div>
                    </div>
                </div>
                <div className="flex w-full flex-col gap-x-[24px]  md:hidden">
                    <div className="px-[20px]">
                        <div className="flex justify-between">
                            <div className="flex flex-1 flex-col justify-between">
                                <div className="mb-[10px] font-inter-medium text-[14px] text-white/70">
                                    {getCollectionNameByNftMetadata(card)}
                                </div>
                                <div className="mb-auto font-inter-bold  text-[18px] leading-none">
                                    {getNameByNftMetadata(card)}
                                </div>

                                <div className="flex items-center leading-none">
                                    {<IconLogoLedgerIcp className="mr-[7px] w-[18px]" />}
                                    <TokenPrice
                                        className="mr-[5px] font-inter-semibold text-[20px] md:text-[20px]"
                                        value={{
                                            value: priceWithDecimals,
                                            decimals: {
                                                value: getLedgerIcpDecimals(),
                                                type: 'exponent',
                                            },
                                            symbol: '',
                                            scale: 2,
                                            paddingEnd: 2,
                                        }}
                                    />
                                    <Usd
                                        className="font-inter-medium text-white/60"
                                        value={{
                                            value: price,
                                            scale: 2,
                                            symbol: 'ICP',
                                        }}
                                    />
                                </div>
                            </div>
                            <div className="w-[90px]">
                                <NftMedia
                                    className="block rounded-[8px]"
                                    src={cdn(getThumbnailByNftMetadata(card))}
                                    metadata={card.metadata}
                                />
                            </div>
                        </div>
                        <div className="mt-10 font-inter-semibold leading-none text-name">
                            Price
                        </div>
                        <div className="mt-[10px] flex w-full flex-shrink-0 items-center rounded-[8px]">
                            <Input
                                className="h-[40px] flex-1  rounded-[6px] rounded-r-none border border-[#283047] bg-transparent px-[10px] font-inter-bold text-[14px]"
                                value={price}
                                onChange={onPriceChange}
                            />
                            <div className="flex h-[40px] rounded-[6px] rounded-l-none border border-l-0 border-[#283047] px-[15px] font-inter-semibold text-[14px]">
                                <span className="my-auto">ICP</span>
                            </div>
                        </div>
                        <div className="mt-[20px]">
                            <span className=" font-inter-medium leading-none text-white/70">
                                commission
                            </span>
                            <div className="mt-[10px] flex flex-col gap-y-[11px] rounded-[8px] border border-[#283047] bg-[#1A2236]  px-[10px] py-[16px] font-inter-medium text-[14px] text-white">
                                <div className="flex w-full items-center justify-between  ">
                                    <span className="font mr-[8px] leading-[16px] ">
                                        Service Fee
                                    </span>
                                    <span className="">
                                        {' '}
                                        {getServiceFee(card, YukuPlatformFee) ?? '--'}%
                                    </span>
                                </div>
                                <div className="flex items-center justify-between ">
                                    <span className=" mr-[8px] text-white">Creator Royalty</span>
                                    <span className="">{card.data?.info.royalties ?? '--'}%</span>
                                </div>
                            </div>
                        </div>
                        <div className="mt-[30px] flex justify-between">
                            <span className=" font-inter-semibold text-[20px] ">Total</span>
                            <div className="flex items-center leading-none">
                                {<IconLogoLedgerIcp className="mr-[7px] w-[18px]" />}
                                <TokenPrice
                                    className="mr-[5px] font-inter-semibold text-[20px] md:text-[20px]"
                                    value={{
                                        value: priceWithDecimals,
                                        decimals: {
                                            value: getLedgerIcpDecimals(),
                                            type: 'exponent',
                                        },
                                        symbol: '',
                                        scale: 2,
                                        paddingEnd: 2,
                                    }}
                                />
                                <Usd
                                    className="text-[14px] text-white/70"
                                    value={{
                                        value: price,
                                        symbol: 'ICP',
                                        scale: 2,
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="mt-[15px] flex cursor-pointer flex-col items-center justify-between border-t border-common p-[20px]">
                        <div className="flex h-fit w-full flex-col justify-start gap-y-[5px]">
                            <BalanceRefresh symbol={'ICP'} />
                        </div>
                        <div className="mt-[10px] flex w-full items-center justify-between gap-x-[27px]">
                            {' '}
                            <Button
                                onClick={onModalClose}
                                variant={'outline'}
                                className="h-[36px] w-[86px] flex-shrink-0 rounded-[8px] border border-solid border-black/60 bg-[#283047] text-center font-inter-bold text-[16px] leading-[36px] text-white hover:bg-[#283047]/60 hover:text-white "
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={onConfirm}
                                className="h-[36px] w-[86px] flex-shrink-0 rounded-[8px]  bg-shiku text-center font-inter-bold text-[16px] leading-[36px] text-white  hover:bg-shiku/60 hover:text-white"
                                disabled={executing}
                            >
                                Confirm {executing && <LoadingOutlined className="ml-1" />}
                            </Button>
                        </div>
                    </div>
                </div>
            </Modal>
        </div>
    );
}

export default SellModal;
