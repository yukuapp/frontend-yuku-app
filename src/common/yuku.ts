// https://yg2aj-yqaaa-aaaai-qpbqq-cai.raw.icp0.io/frontend/images/user/banner/1.png
const INITIAL_BANNERS = [
    ...Array(7)
        .fill(0)
        .map(
            (_, i) =>
                `https://yg2aj-yqaaa-aaaai-qpbqq-cai.raw.icp0.io/frontend/images/user/banner/${
                    i + 1
                }.png`,
        ),
];

// https://yg2aj-yqaaa-aaaai-qpbqq-cai.raw.icp0.io/frontend/images/user/avatar/1.png
const INITIAL_AVATARS = [
    ...Array(8)
        .fill(0)
        .map(
            (_, i) =>
                `https://yg2aj-yqaaa-aaaai-qpbqq-cai.raw.icp0.io/frontend/images/user/avatar/${
                    i + 1
                }.png`,
        ),
];

export const getRandomBanner = (): string =>
    INITIAL_BANNERS[Math.floor(Math.random() * INITIAL_BANNERS.length)];

export const getRandomAvatar = (): string =>
    INITIAL_AVATARS[Math.floor(Math.random() * INITIAL_AVATARS.length)];

export const isYukuSpecialCollection = (name: string, collection: string): boolean => {
    if (name.startsWith('Yuku NFT Art Festival')) return true;
    if (name.startsWith('FIFA World Cup 2022')) return true;
    if (['3hzxy-fyaaa-aaaap-aaiiq-cai'].includes(collection)) return true;
    return false;
};
