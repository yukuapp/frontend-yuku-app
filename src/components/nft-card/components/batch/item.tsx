import { useEffect, useState } from 'react';
import YukuIcon from '@/components/ui/yuku-icon';
import { useCollectionDataList } from '@/hooks/nft/collection';
import { useEntrepotFloor } from '@/hooks/nft/listing';
import { getCollectionStatistics } from '@/utils/apis/yuku/api_data';
import { getTokenDecimals } from '@/utils/canisters/ledgers/special';
import { getCollectionNameByNftMetadata, getNameByNftMetadata } from '@/utils/nft/metadata';
import { CollectionStatistics } from '@/apis/yuku/api_data';
import { cn } from '@/common/cn';
import { exponentNumber } from '@/common/data/numbers';
import { shrinkText } from '@/common/data/text';
import { string2bigint } from '@/common/types/bigint';
import { useDeviceStore } from '@/stores/device';
import { useIdentityStore } from '@/stores/identity';
import { BatchNftSale, UniqueCollectionData } from '@/types/yuku';
import ShowNumber from '../../../data/number';
import NftThumbnail from '../../../nft/thumbnail';
import { isValidPrice } from '../sell';

function BatchListingItem({ sale, floorFlag }: { sale: BatchNftSale; floorFlag: number }) {
    const { isMobile } = useDeviceStore((s) => s.deviceInfo);
    const updateBatchNftSale = useIdentityStore((s) => s.updateBatchNftSale);
    const removeBatchNftSale = useIdentityStore((s) => s.removeBatchNftSale);

    const [value, setValue] = useState(sale.price);
    useEffect(() => setValue(sale.price), [sale]);

    const onValueChange = ({ target: { value } }) => {
        if (!value) {
            setValue('');
            updateBatchNftSale({ ...sale, price: '' });
            return;
        }
        if (Number(value) === 0) {
            setValue(value);
            updateBatchNftSale({ ...sale, price: '' });
            return;
        }
        if (isValidPrice(value)) {
            setValue(value);
            updateBatchNftSale({ ...sale, price: value });
        }
    };

    const collectionDataList = useCollectionDataList();

    const [innerStatistic, setInnerStatistic] = useState<CollectionStatistics | undefined>(
        undefined,
    );

    const collection = sale.card?.data?.info.collection;
    useEffect(() => {
        collection && getCollectionStatistics(collection).then(setInnerStatistic);
    }, [collection]);

    const [innerData, setInnerData] = useState<UniqueCollectionData | undefined>(undefined);
    useEffect(() => {
        setInnerData(collectionDataList.find((c) => c.info.collection === collection));
    }, [collection, collectionDataList]);

    const entrepot_floor = useEntrepotFloor(collection);

    let common_floor = innerData?.metadata?.floorPrice ?? innerStatistic?.floor;
    common_floor = common_floor === '0' ? undefined : common_floor;
    const floor =
        string2bigint(common_floor ?? '0') < string2bigint(entrepot_floor ?? '0')
            ? common_floor ?? entrepot_floor
            : entrepot_floor ?? common_floor;

    useEffect(() => {
        if (floorFlag !== 0 && floor && floor !== '0') {
            const floorPrice = exponentNumber(floor, -getTokenDecimals());
            setValue(floorPrice);
            updateBatchNftSale({ ...sale, price: floorPrice });
        }
    }, [floorFlag]);

    return (
        <div
            className={cn('grid w-full grid-cols-3  items-center', isMobile && 'grid-cols-2')}
            style={{ gridTemplateColumns: isMobile ? '3fr 3fr' : '3fr 3fr 2fr' }}
        >
            <div
                className={cn(
                    'flex h-[58px] w-full items-center overflow-hidden',
                    isMobile && 'h-[40px]',
                )}
            >
                <div className="mr-[10px] overflow-hidden rounded-[6px]">
                    <NftThumbnail
                        token_id={sale.token_id}
                        cdn_width={100}
                        width={isMobile ? 'w-[40px]' : 'w-[58px]'}
                    />
                </div>
                <div className="flex h-full w-fit  flex-col justify-between">
                    {/* <div>{sale.token_id.token_identifier}</div> */}
                    <div className="truncate font-inter-bold text-[14px] leading-[18px]">
                        {shrinkText(getNameByNftMetadata(sale.card), 3, 6)}
                    </div>
                    <div className="font-inter-normal truncate text-[14px] leading-[18px] text-white/70">
                        {shrinkText(getCollectionNameByNftMetadata(sale.card))}
                    </div>
                </div>
            </div>
            {isMobile ? (
                <div className="relative flex h-full flex-col items-start border-common ">
                    <div className="flex">
                        <input
                            className="h-[25px] w-[76px] rounded-[6px] rounded-r-none border border-solid border-common bg-transparent  px-[6px] font-inter-semibold text-[14px] focus:outline-none"
                            value={value}
                            onChange={onValueChange}
                        />

                        <div className="flex h-[25px] w-[45px] items-center justify-between rounded-[6px] rounded-l-none border border-l-0 border-solid border-common px-[6px] font-inter-semibold text-[14px]">
                            <span>ICP</span>
                        </div>
                    </div>
                    <div className="mt-[2px] font-inter-medium text-[12px] leading-none text-name">
                        Floor price:&nbsp;
                        <ShowNumber
                            value={{
                                value: exponentNumber(floor ?? '0', -getTokenDecimals()),
                                thousand: { symbol: ['M', 'K'] },
                                scale: 2,
                                paddingEnd: 2,
                            }}
                            className="text-[12px] leading-none"
                        />
                        &nbsp;ICP
                    </div>
                </div>
            ) : (
                <div className="relative mb-[6px] flex h-[34px] items-center border-common ">
                    <input
                        className="h-full w-[76px] rounded-[6px] rounded-r-none border border-solid border-common bg-transparent  px-[6px] font-inter-semibold text-[14px] focus:outline-none"
                        value={value}
                        onChange={onValueChange}
                    />
                    <div className="absolute -bottom-[2px] translate-y-full font-inter-medium text-[12px] leading-none text-white/70">
                        Floor price:&nbsp;
                        <ShowNumber
                            value={{
                                value: exponentNumber(floor ?? '0', -getTokenDecimals()),
                                thousand: { symbol: ['M', 'K'] },
                                scale: 2,
                                paddingEnd: 2,
                            }}
                            className="text-[12px] leading-none"
                        />
                        &nbsp;ICP
                    </div>
                    <div className="flex h-full w-[45px] items-center justify-between rounded-[6px] rounded-l-none border border-l-0 border-solid border-common px-[6px] font-inter-semibold text-[14px]">
                        <span>ICP</span>
                    </div>
                </div>
            )}
            {isMobile ? (
                <>
                    <YukuIcon
                        name="action-delete"
                        size={20}
                        color="white"
                        className="absolute right-[16px] h-[20px] w-[20px] cursor-pointer opacity-70 transition duration-300 hover:opacity-60"
                        onClick={() => removeBatchNftSale(sale.token_id)}
                    />
                </>
            ) : (
                <div className="flex items-center justify-between font-inter-medium">
                    <div>{sale.card?.data?.info.royalties ?? '--'}%</div>
                    <YukuIcon
                        name="action-delete"
                        size={20}
                        color="white"
                        className="ml-[20px] h-[20px] w-[20px] cursor-pointer opacity-70 transition duration-300 hover:opacity-60"
                        onClick={() => removeBatchNftSale(sale.token_id)}
                    />
                </div>
            )}
        </div>
    );
}

export default BatchListingItem;
