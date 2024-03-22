import { useEffect, useState } from 'react';
import useMeasure from 'react-use-measure';
import { animated, useTrail } from '@react-spring/web';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { queryAllEvents } from '@/utils/apis/yuku/api';
import { SpaceEvent } from '@/apis/yuku/api';
import { throwUndefined } from '@/common/data/promise';
import EventsSpace from './components/events-space';
import HomeFAQ from './components/faq';
import FeaturedSpaces from './components/featuredSpaces';
import MetaverseBanner from './components/metaverseBanner';
import MetaverseImgs from './components/metaverseImgs';
import MetaverseSecondBanner from './components/metaverseSecondBanner';
import TopViewedSpaces from './components/topViewedSpaces';
import './index.less';

AOS.init();

function MetaversePage() {
    const fast = { tension: 1200, friction: 40 };
    const slow = { mass: 10, tension: 200, friction: 50 };
    const trans = (x: number, y: number) => `translate3d(${x}px,${y}px,0) translate3d(-50%,-50%,0)`;

    const [trail, api] = useTrail(3, (i) => ({
        xy: [0, 0],
        config: i === 0 ? fast : slow,
    }));
    const [ref, { left, top }] = useMeasure({ scroll: true });

    const handleMouseMove = (e) => {
        api.start({ xy: [e.clientX - left + e.movementX, e.clientY - top + e.movementY] });
    };
    const [eventList, setEventList] = useState<SpaceEvent[]>();

    useEffect(() => {
        queryAllEvents({ page_number: 1, page_size: 1 })
            .then(throwUndefined)
            .then((d) => setEventList(d.list))
            .catch(() => setEventList([]));
    }, []);
    return (
        <div className="h-full items-center">
            <div className="relative h-max" onMouseMove={handleMouseMove}>
                <div className="filterBg"></div>
                <svg style={{ position: 'absolute', width: 0, height: 0 }}>
                    <filter id="goo">
                        <feGaussianBlur in="SourceGraphic" result="blur" stdDeviation="30" />
                        <feColorMatrix
                            in="blur"
                            values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 30 -7"
                        />
                    </filter>
                </svg>
                <div ref={ref} className="hooksMain">
                    {trail.map((props, index) => (
                        <animated.div key={index} style={{ transform: props.xy.to(trans) }} />
                    ))}
                </div>

                <div className="relative z-10">
                    <MetaverseBanner />
                    {eventList && eventList.length !== 0 && <EventsSpace />}
                    <TopViewedSpaces />
                    <FeaturedSpaces />
                    <MetaverseSecondBanner />
                    <MetaverseImgs />
                    <HomeFAQ />
                </div>
            </div>
        </div>
    );
}

export default MetaversePage;
