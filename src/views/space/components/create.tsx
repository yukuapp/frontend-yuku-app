import { Button } from '@/components/ui/button';

export default function Create() {
    return (
        <div className="relative flex w-full">
            <img src="/img/space/create-bg.png" className="h-[800px]" alt="" />
            <div className="absolute bottom-0 left-[100px]  right-0 top-0 flex w-full flex-col items-start justify-center">
                <div className="font-inter-semibold text-5xl leading-[62px] text-white">
                    Create My Space
                </div>
                <div className="mt-[42px] w-[605px] font-inter-medium text-base leading-normal text-white text-opacity-95">
                    StaBuy LAND and turn it into a space where culture and creativity can thrive.
                    Showcase your creations, feature great games, host events, and more. Join the
                    movement and lead the way in shaping the metaverse!
                </div>
                <Button className="mt-[126px] h-12 w-[150px] rounded-[8px] bg-[#1B76FF] font-inter-semibold text-lg text-white hover:bg-[#1B76FF]/70">
                    Create
                </Button>
            </div>
        </div>
    );
}
