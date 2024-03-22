import { cn } from '@/common/cn';

const NEED_IFRAME_CANISTERS = [
    'pk6rk-6aaaa-aaaae-qaazq-cai',
    'dhiaa-ryaaa-aaaae-qabva-cai',
    'skjpp-haaaa-aaaae-qac7q-cai',
    '2v5zm-uaaaa-aaaae-qaewa-cai',
    'fl5nr-xiaaa-aaaai-qbjmq-cai',
    '4ggk4-mqaaa-aaaae-qad6q-cai',
];
export const isNeedsIFrame = (src?: string): boolean => {
    if (src === undefined) return false;
    let has = false;
    NEED_IFRAME_CANISTERS.forEach((canister) => {
        if (src.indexOf(canister) >= 0) has = true;
    });
    return has;
};

function NftMediaNeedsIFrame({ src, className }: { src?: string; className?: string }) {
    return (
        <div className={cn([className, 'relative h-full w-full'])}>
            <iframe src={src} className={cn([className, 'h-full w-full'])}></iframe>
            <div className="absolute top-0 h-full w-full"></div>
        </div>
    );
}

export default NftMediaNeedsIFrame;
