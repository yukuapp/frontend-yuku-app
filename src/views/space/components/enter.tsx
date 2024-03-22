import { Button } from '@/components/ui/button';

export default function Enter() {
    return (
        <>
            <div className="relative mt-[118px]">
                <div
                    style={{
                        height: 16,
                        background: 'linear-gradient(90deg, #1657FF 0%, #B518FF 50%, #19ACFF 100%)',
                        boxShadow: '30px 30px 30px',
                        filter: 'blur(20px)',
                    }}
                    className="w-full"
                ></div>
                <img src="/img/space/enter-bg.png" alt="" />
                <div className="absolute bottom-0 left-0 right-0 top-0 flex h-full w-full flex-col items-center justify-center">
                    <div className="font-inter-semibold text-5xl  leading-[62px] text-white">
                        EVENTS HOST GILIDE
                    </div>
                    <div className="mt-[35px] overflow-hidden font-inter-medium leading-5 text-white/[.93]">
                        Start exploring, find your communities, and make your mark in the metaverse!
                    </div>
                    <Button className="mt-[110px] h-12 w-[253px] rounded-[8px] bg-[#1B76FF] font-inter-semibold text-lg text-white hover:bg-[#1B76FF]/70">
                        Enter the metaverse
                    </Button>
                </div>
            </div>
        </>
    );
}
