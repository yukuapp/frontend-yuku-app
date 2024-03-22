// import { useEffect } from 'react';
// import useMeasure from 'react-use-measure';
// import { animated, useTrail } from '@react-spring/web';
import { ReactLenis, useLenis } from '@studio-freight/react-lenis';
import AOS from 'aos';
import 'aos/dist/aos.css';
import HomeBanners from './components_sns/banners';
import HomeDistribution from './components_sns/distribution';
import HomeHighlights from './components_sns/highlights';
import HomeInvestors from './components_sns/investors';
import HomePartners from './components_sns/partners';
import HomeRoadmap from './components_sns/roadmap';
import HomeSupport from './components_sns/support';
import './index.less';

AOS.init();

function HomePage() {
    useLenis(() => {});

    return (
        <ReactLenis root>
            <div className="relative flex flex-col">
                <div className="bannerBgSection">
                    <HomeBanners />
                    <HomeHighlights />
                </div>
                <HomeInvestors />

                <div className="partners_bg relative mt-[-134px] w-full md:mt-[-126px]">
                    <HomePartners />
                    <HomeSupport />
                    <HomeDistribution />
                    <HomeRoadmap />
                </div>
            </div>
        </ReactLenis>
    );
}

export default HomePage;
