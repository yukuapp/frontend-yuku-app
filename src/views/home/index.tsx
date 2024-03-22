import { useEffect } from 'react';
import useMeasure from 'react-use-measure';
import { animated, useTrail } from '@react-spring/web';
import AOS from 'aos';
import 'aos/dist/aos.css';
import HomeBanners from './components/banners';
import HomeSecondBanner from './components/secondBanner';
// import HomeFAQ from './components/faq';
import HomeSpace from './components/space';
import HomeTop from './components/top';
import HomeTrend from './components/trend';
import './index.less';

AOS.init();

function HomePage() {
    const fast = { tension: 1200, friction: 40 };
    const slow = { mass: 10, tension: 200, friction: 50 };
    const trans = (x: number, y: number) => `translate3d(${x}px,${y}px,0) translate3d(-50%,-50%,0)`;

    const [trail, api] = useTrail(3, (i) => ({
        xy: [200, 200],
        config: i === 0 ? fast : slow,
    }));
    const [ref, { left, top }] = useMeasure({ scroll: true });

    const handleMouseMove = (e) => {
        api.start({ xy: [e.clientX - left + e.movementX, e.clientY - top + e.movementY] });
    };

    useEffect(() => {}, []);

    return (
        <div className="home-page h-full items-center">
            <HomeBanners />

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
                    <HomeTop />
                    <HomeTrend />
                    <HomeSpace />
                </div>
            </div>

            <HomeSecondBanner />
            {/* <HomeFAQ /> */}
        </div>
    );
}

export default HomePage;
