import { useEffect, useState } from 'react';
import { isMobile } from 'react-device-detect';
import { LoadingOutlined } from '@ant-design/icons';
import Chart from '@/components/chart';
import { queryCollectionRecentDaysVolume } from '@/utils/apis/yuku/api_data';
import { getLedgerIcpDecimals } from '@/utils/canisters/ledgers/special';
import { NftCollectionVolume } from '@/apis/yuku/api_data';
import { exponentNumber } from '@/common/data/numbers';

export const SHOW_DAYS = isMobile ? 7 : 14;

export type Volume = {
    time: string;
    volume: number;
    sales: number;
};

export const DashBoard = ({ collection }: { collection: string }) => {
    const [fetching, setFetching] = useState<boolean>();
    const [volumeData, setVolumeData] = useState<Volume[]>([]);
    useEffect(() => {
        collection &&
            (async () => {
                try {
                    setFetching(true);
                    const volume = await queryCollectionRecentDaysVolume({
                        collection,
                        days: SHOW_DAYS,
                    });
                    const volumeList = volume
                        .slice(volume.length - SHOW_DAYS, volume.length)
                        .map((item: NftCollectionVolume) => {
                            return {
                                time: `${new Date(item.day).getMonth() + 1}/${new Date(
                                    item.day,
                                ).getDate()}`,
                                volume: Number(
                                    exponentNumber(item.volume, -getLedgerIcpDecimals()),
                                ),
                                sales: item.count,
                            };
                        });
                    setVolumeData(volumeList);
                } catch (error) {
                    console.error(error);
                } finally {
                    setFetching(false);
                }
            })();
    }, [collection]);

    return (
        <div className="mx-auto  mt-[30px] flex w-full justify-between">
            <div className="font-text-[18px] relative flex w-full flex-col items-center justify-center font-inter-bold leading-[18px] md:flex-row">
                {<Chart volumeData={volumeData} />}
                {fetching && (
                    <div className="absolute bottom-0 left-0  right-0 top-0 flex bg-white/10">
                        <LoadingOutlined className="m-auto text-[40px] "></LoadingOutlined>
                    </div>
                )}
            </div>
        </div>
    );
};
