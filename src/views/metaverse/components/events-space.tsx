import { useEffect, useState } from 'react';
import _ from 'lodash';
import CardSwiper, { SLIDE_SIZE } from '@/views/space/components/card-swiper';
import { queryAllEvents } from '@/utils/apis/yuku/api';
import { SpaceEvent } from '@/apis/yuku/api';
import { throwUndefined } from '@/common/data/promise';

export default function EventsSpace() {
    const [eventList, setEventList] = useState<SpaceEvent[]>();
    const sortedList = _.sortBy(eventList, [
        (item: SpaceEvent) => Date.now() >= (item?.opening.end || Infinity),
        (item) => !item.active,
        (item: SpaceEvent) => item.opening.start,
    ]);

    useEffect(() => {
        queryAllEvents({ page_number: 1, page_size: 1000 })
            .then(throwUndefined)
            .then((d) => setEventList(d.list))
            .catch(() => setEventList([]));
    }, []);

    return (
        <div>
            <div className="relative mt-[20px] w-full pb-[40px] pt-[50px] md:pb-0">
                <div className="mx-auto w-full max-w-[1920px] px-[20px] lg:px-[40px]">
                    <div className="mt-[20px] flex w-full items-center justify-between md:mt-[80px]">
                        <span
                            className={`relative mr-[50px] flex cursor-pointer items-center justify-center font-[Inter-Bold] text-[20px] text-white duration-300 md:text-[28px]`}
                        >
                            Events
                        </span>
                    </div>
                    <CardSwiper
                        wrapperClass="mt-[20px] md:mt-[50px]"
                        size={SLIDE_SIZE}
                        list={sortedList}
                        loading={!eventList}
                    ></CardSwiper>
                </div>
            </div>
        </div>
    );
}
