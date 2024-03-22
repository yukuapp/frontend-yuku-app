import { useMemo, useState } from 'react';
import { Skeleton } from 'antd';
import { motion, TargetAndTransition, VariantLabels } from 'framer-motion';
import { NFT_ICNAMING } from '@/canisters/nft/special';
import { cdn } from '@/common/cdn';
import { cn } from '@/common/cn';
import { NftTokenMetadata } from '@/types/nft';
import AspectRatio from '../../ui/aspect-ratio';
import CustomNftMedia, { isCustomMedia } from './custom';
import ModelViewer from './model';
import ShowSvg from './show-svg';

const isMetadataUrl = (src?: string, metadata?: NftTokenMetadata): boolean => {
    if (!src) return false;
    let url = metadata?.metadata.url;
    if (!url) return false;
    if (src.indexOf(url) >= 0) return true;
    url = decodeURIComponent(url);
    url = encodeURIComponent(url);
    if (src.indexOf(`url=${url}`) >= 0) return true;
    return false;
};

const svg = (src?: string, metadata?: NftTokenMetadata): boolean => {
    if (!src) return false;

    if (NFT_ICNAMING.includes(metadata?.token_id.collection ?? '')) {
        return true;
    }

    return /\.svg/.test(src);
};

const video = (src?: string, metadata?: NftTokenMetadata): boolean => {
    if (!src) return false;

    if (
        metadata?.token_id.collection === 'nusra-3iaaa-aaaah-qc2ta-cai' &&
        isMetadataUrl(src, metadata)
    ) {
        return true;
    }

    if (
        metadata?.metadata.mimeType &&
        metadata?.metadata.mimeType.indexOf('video') >= 0 &&
        isMetadataUrl(src, metadata)
    ) {
        return true;
    }

    return /\.mp4/.test(src);
};

const model = (src?: string, metadata?: NftTokenMetadata): boolean => {
    if (!src) return false;

    if (
        metadata?.metadata.mimeType &&
        metadata?.metadata.mimeType.indexOf('3dmodel') >= 0 /* Cspell: disable-line */ &&
        isMetadataUrl(src, metadata) &&
        !/\.jpeg/.test(src)
    ) {
        return true;
    }

    return /\.glb$/.test(src);
};

function NftMedia({
    src,
    metadata,
    whileHover,
    className,
    imageClass,
    svgClass,
    videoClass,
    modalClass,
    skeleton = true,
}: {
    src?: string;
    metadata?: NftTokenMetadata;
    whileHover?: TargetAndTransition | VariantLabels;
    className?: string;
    imageClass?: string;
    svgClass?: string;
    videoClass?: string;
    modalClass?: string;
    skeleton?: boolean;
}) {
    const [loading, setLoading] = useState<boolean>(true);
    const [aspectRatio, setAspectRatio] = useState<number>(1);

    const isSvg: boolean = useMemo(() => svg(src, metadata), [src, metadata]);
    const isVideo: boolean = useMemo(() => video(src, metadata), [src, metadata]);
    const isModel: boolean = useMemo(() => !!metadata && model(src, metadata), [src, metadata]);
    // console.debug(`🚀 ~ file: media.tsx:45 ~ metadata:`, metadata);
    const isImage = !isSvg && !isVideo && !isModel;

    const showSkeleton = !src || loading;

    const onImageLoaded = ({ target: { naturalWidth, naturalHeight } }) => {
        setAspectRatio(naturalWidth / naturalHeight);
        setLoading(false);
    };

    const onVideoLoaded = ({ target: { offsetWidth, offsetHeight } }) => {
        setAspectRatio(offsetWidth / offsetHeight);
        setLoading(false);
    };

    if (isCustomMedia(src))
        return (
            <CustomNftMedia
                src={src}
                whileHover={whileHover}
                className={className}
                imageClass={imageClass}
                skeleton={skeleton}
            />
        );

    return (
        <AspectRatio ratio={1} className="relative flex w-full items-center justify-center">
            {showSkeleton && skeleton && (
                <Skeleton.Image className="absolute !h-full !w-full" active={true} />
            )}
            {src && isImage && (
                <motion.img
                    src={cdn(src)}
                    whileHover={whileHover}
                    className={cn(
                        'h-auto w-auto',
                        aspectRatio > 1 ? 'w-full' : 'h-full',
                        skeleton && loading ? 'invisible' : 'visible',
                        className,
                        imageClass,
                    )}
                    onLoad={(e: any) => onImageLoaded(e)}
                    onError={() => setLoading(false)}
                />
            )}
            {src && isSvg && (
                <ShowSvg
                    src={src}
                    whileHover={whileHover}
                    visible={!skeleton || !loading}
                    className={className}
                    svgClass={svgClass}
                    onImageLoaded={onImageLoaded}
                    onError={() => setLoading(false)}
                />
            )}
            {src && isVideo && (
                <video
                    className={cn(
                        'h-auto w-auto',
                        aspectRatio > 1 ? 'w-full' : 'h-full',
                        skeleton && loading ? 'invisible' : 'visible',
                        className,
                        videoClass,
                    )}
                    src={cdn(src)}
                    autoPlay={true}
                    loop={true}
                    controls={true}
                    muted={true}
                    controlsList="nodownload"
                    onLoadedData={(e: any) => onVideoLoaded(e)}
                    onError={() => setLoading(false)}
                ></video>
            )}
            {src && isModel && (
                <ModelViewer
                    className={cn(
                        'h-auto w-auto',
                        aspectRatio > 1 ? 'w-full' : 'h-full',
                        skeleton && loading ? 'invisible' : 'visible',
                        className,
                        modalClass,
                    )}
                    src={cdn(src)!}
                    metadata={metadata!}
                    onLoaded={() => setLoading(false)}
                />
            )}
        </AspectRatio>
    );
}

export default NftMedia;
