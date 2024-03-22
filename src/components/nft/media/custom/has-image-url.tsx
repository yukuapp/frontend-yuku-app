import { useEffect, useState } from 'react';
import { Skeleton } from 'antd';
import { motion, TargetAndTransition, VariantLabels } from 'framer-motion';
import { cdn } from '@/common/cdn';
import { cn } from '@/common/cn';

const hasImageSrcCanisters: string[] = [
    'xizxk-fqaaa-aaaap-aa2nq-cai',
    '4wuoq-vqaaa-aaaah-acmbq-cai',
    '53lcn-vyaaa-aaaah-ab4mq-cai',
    '2bcjs-tiaaa-aaaap-aa3ha-cai',
    'm7vrl-xaaaa-aaaap-aah3a-cai',
    'vjadt-byaaa-aaaap-aa2aa-cai',
    '66orv-hqaaa-aaaah-acmnq-cai',
    '2zjt6-5aaaa-aaaah-adooa-cai',
    'l5lxn-5qaaa-aaaah-adnfa-cai',
    'd5mc5-biaaa-aaaah-admtq-cai',
    'ajjxn-iiaaa-aaaah-adlga-cai',
    'edzvd-wqaaa-aaaah-adl4q-cai',
    'hz6n3-eaaaa-aaaah-admia-cai',
];
const hasImageHrefCanisters: string[] = [
    'bzsui-sqaaa-aaaah-qce2a-cai',
    'llf4i-riaaa-aaaag-qb4cq-cai',
    'nf35t-jqaaa-aaaag-qbp4q-cai',
    's36wu-5qaaa-aaaah-qcyzq-cai',
    'cchps-gaaaa-aaaak-qasaa-cai',
    'lisfk-jqaaa-aaaag-qb37q-cai',
    '6wih6-siaaa-aaaah-qczva-cai',
    'xzxhy-oiaaa-aaaah-qclnq-cai',
    'o6lzt-kiaaa-aaaag-qbdza-cai',
];
export const isHasImageSrc = (src?: string): boolean => {
    if (src === undefined) return false;

    let has = false;
    hasImageSrcCanisters.forEach((canister) => {
        if (src.indexOf(canister) >= 0) has = true;
    });
    return has;
};

export const isHasImageHref = (src?: string): boolean => {
    if (src === undefined) return false;
    let has = false;
    hasImageHrefCanisters.forEach((canister) => {
        if (src.indexOf(canister) >= 0) has = true;
    });
    return has;
};
export const isHasImageUrl = (src?: string): boolean => {
    if (src === undefined) return false;
    return isHasImageSrc(src) || isHasImageHref(src);
};

function NftMediaHasImageUrl({
    src,
    whileHover,
    className,
    imageClass,
    skeleton,
}: {
    src?: string;
    whileHover?: TargetAndTransition | VariantLabels;
    className?: string;
    imageClass?: string;
    skeleton?: boolean;
}) {
    const [loading, setLoading] = useState<boolean>(true);
    const [aspectRatio, setAspectRatio] = useState<number>(1);

    const showSkeleton = !src || loading;

    const [url, setUrl] = useState<string | undefined>(undefined);
    useEffect(() => {
        if (!src) return;
        if (src.indexOf('thumbnail') >= 0 && isHasImageHref(src)) return setUrl(src);
        fetch(src)
            .then((d) => d.text())
            .then((d) => {
                let url: string = src;
                if (isHasImageHref(src)) {
                    url = d.split('href="')[1].split('" width')[0];
                }
                if (isHasImageSrc(src)) {
                    url = d.split('src="')[1].split('"></img>')[0];
                }
                setUrl(url);
            })
            .catch((e) => {
                console.error('use origin image src', e);
                setUrl(src);
            });
    }, [src]);

    const onImageLoaded = ({ target: { naturalWidth, naturalHeight } }) => {
        setAspectRatio(naturalWidth / naturalHeight);
        setLoading(false);
    };
    return (
        <div className={cn([className, 'relative h-full w-full'])}>
            {showSkeleton && skeleton && (
                <Skeleton.Image className="absolute !h-full !w-full" active={true} />
            )}
            {url && (
                <motion.img
                    src={cdn(url)}
                    whileHover={whileHover}
                    className={cn(
                        'mx-auto h-auto w-auto',
                        aspectRatio > 1 ? 'w-full' : 'h-full',
                        skeleton && loading ? 'invisible' : 'visible',
                        className,
                        imageClass,
                    )}
                    onLoad={(e: any) => onImageLoaded(e)}
                    onError={() => setLoading(false)}
                />
            )}
        </div>
    );
}

export default NftMediaHasImageUrl;
