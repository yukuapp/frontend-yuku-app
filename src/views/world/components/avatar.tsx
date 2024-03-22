import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import message from '@/components/message';
import { changeUserAvatar, changeUserMetadata, queryUserAvatars } from '@/utils/apis/yuku/api';
import { PlayerRoleAvatar } from '@/apis/yuku/api';
import { cn } from '@/common/cn';
import { useIdentityStore } from '@/stores/identity';
import LeftAvatars from './left-avatars';
import UseAvatarModal from './use-avatar-modal';

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

export type ModelAvatar = {
    src: string | undefined;
    id: number;
    title: string;
    modelSrc: string | undefined;
    descSrc: string | undefined;
    desc: string;
};

const avatarList: ModelAvatar[] = [
    {
        src: '/img/world/use-avatar1.png',
        id: 1,
        title: 'Echo Mist',
        modelSrc: '/img/world/model-img1.png',
        descSrc: '/img/world/desc-img1.png',
        desc: `In a Metaverse-integrated future, "Genesis Lab" created
        EchoMist, a robot avatar for users to explore the virtual
        world. Its biocompatible white body syncs with user emotions
        and actions, translating them into immersive experiences.
        The superconductive mirror metal skin connects users'
        real-world inputs seamlessly to the digital realm, adapting
        to various roles in the Metaverse. With advanced data
        processing skills, EchoMist bridges real-life challenges and
        virtual exploration, becoming a versatile guide across both
        realities.`,
    },
    {
        src: '/img/world/use-avatar3.png',
        id: 2,
        title: 'Novia Cybereel',
        modelSrc: '/img/world/model-img3.png',
        descSrc: '/img/world/desc-img3.png',
        desc: `Novia, a Cybereel from Zeta Prime, belongs to a high-tech race adept
        at bioengineering. Their bodies are cybernetic hybrids capable of
        integrating with machines and adapting to extreme environments.
        Wearing a responsive, body-integrated spacesuit, Novia is a cosmic
        explorer tasked with finding habitable planets and fostering
        peaceful interstellar relations. The colors and patterns on Novia's
        suit reflect their emotional state - deep blue for calmness,
        changing hues for different moods - symbolizing the Cybereels'
        advanced emotional expression and harmony between their biological
        and technological aspects.`,
    },
    {
        src: '/img/world/use-avatar2.png',
        id: 3,
        title: 'Orix Norbil',
        modelSrc: '/img/world/model-img2.png',
        descSrc: '/img/world/desc-img2.png',
        desc: `Orix Norbil hails from the planet Cyberlia in the Beta Geminorum
        system, where its species, the Cyberlians, are renowned for their
        cranial dual eyes and exceptional business intellect. The Cyberlian
        society is centered on interstellar trade, characterized by advanced
        technology and a commitment to harmony and prosperity. As a
        representative of Cyberlian interstellar commerce, Orix dons a
        high-tech suit tailored for environmental adaptability and equipped
        with integrated communication systems. It travels between the stars,
        leveraging its masterful negotiation skills and principles of fair
        trade to facilitate economic exchanges and foster cooperation among
        various civilizations.`,
    },
];

const AvatarMain = ({ show }: { show: boolean }) => {
    const [avatarIdx, setAvatarIdx] = useState<number>(-1);
    const [loading, setLoading] = useState<boolean>(false);
    const [list, setAvatarList] = useState<PlayerRoleAvatar[]>([]);
    const [successModel, showSuccessModel] = useState<boolean>(false);
    const identityProfile = useIdentityStore((s) => s.identityProfile);
    const getYukuToken = useIdentityStore((s) => s.getYukuToken);
    const identity = useIdentityStore((s) => s.connectedIdentity);
    const token = identity && getYukuToken();
    const reloadIdentityProfile = useIdentityStore((s) => s.reloadIdentityProfile);
    const contentRefs = useRef<HTMLImageElement[]>([]);
    const modelRefs = useRef<HTMLImageElement[]>([]);

    useEffect(() => {
        getAvatars();
    }, []);

    useEffect(() => {
        getAvatars();
    }, [token?.user_token]);

    useEffect(() => {
        show && init();
        return () => {
            ScrollTrigger.killAll();
        };
    }, [show]);

    const getAvatars = () => {
        if (!token) return;
        setLoading(true);
        queryUserAvatars({
            user_id: token.user_id,
            user_token: token.user_token,
        })
            .then((res) => {
                if (!res) {
                    setAvatarList([]);
                } else {
                    setAvatarList(res);
                }
            })
            .catch((e) => console.error(e.message))
            .finally(() => {
                setLoading(false);
            });
    };

    useEffect(() => {
        if (list.length === 0) {
            return;
        }

        const choseIdx = list.findIndex((r) => r.chosen);
        setAvatarIdx(choseIdx);
    }, [list]);

    const init = () => {
        ScrollTrigger.create({
            pin: '.pic-container',
            trigger: '.split',
            start: 'top-=100',
            end: 'bottom 65%',
            scrub: true,
            // pinReparent: true,
            // markers: true,
            id: 'scrubimg',
            // onLeave: () => {

            //     // gsap.set('.split', { alignItems: 'flex-end' });
            //     gsap.set('.pic-container', { marginTop: '-15.5vh' });
            // },
            // onEnterBack: () => {

            //     // gsap.set('.split', { alignItems: 'inherit' });
            //     gsap.set('.pic-container', { marginTop: 'auto' });
            // },
        });

        ScrollTrigger.create({
            trigger: contentRefs.current[0],
            start: '60% top',
            end: '100% bottom',
            scrub: true,
            // markers: true,
            onEnter: () => {
                gsap.to(modelRefs.current[0], { opacity: 0 });
                gsap.to(modelRefs.current[1], { opacity: 1 });
            },
            onLeaveBack: () => {
                gsap.to(modelRefs.current[0], { opacity: 1 });
                gsap.to(modelRefs.current[1], { opacity: 0 });
            },
        });

        ScrollTrigger.create({
            trigger: contentRefs.current[1],
            start: '60% top',
            end: '100% bottom',
            scrub: true,
            // markers: true,
            onEnter: () => {
                gsap.to(modelRefs.current[1], { opacity: 0 });
                gsap.to(modelRefs.current[2], { opacity: 1 });
            },
            onLeaveBack: () => {
                gsap.to(modelRefs.current[1], { opacity: 1 });
                gsap.to(modelRefs.current[2], { opacity: 0 });
            },
        });
    };

    const onUseAvatar = (avatar, idx) => {
        if (loading) return message.warning('Data is loading, please wait!');

        // scrollToCheckAvatar(idx);

        if (!token || !identityProfile) return;

        const unityAvatar = list[idx];

        if (!avatar || !unityAvatar) return;

        if (unityAvatar && unityAvatar.chosen) {
            message.warning('This avatar is already in use!');
            return;
        }

        setLoading(true);

        Promise.all([
            changeUserMetadata({
                params: {
                    user_token: token.user_token,
                    user_id: token.user_id,
                },
                data: {
                    avatar: avatar.src || '',
                    name: identityProfile?.username,
                    bio: identityProfile?.bio,
                    social: JSON.stringify(identityProfile?.social),
                },
            }),
            changeUserAvatar({
                user_token: token.user_token,
                user_id: token.user_id,
                player_role_id: unityAvatar.role_id,
                player_role_avatar_index: unityAvatar.index,
            }),
        ])
            .then((d) => {
                setLoading(false);

                if (d) {
                    showSuccessModel(true);
                    reloadIdentityProfile(3);
                    getAvatars();
                } else {
                    message.error('update failed');
                }
            })
            .catch((e) => message.error(`${e}`))
            .finally(() => setLoading(false));
    };

    // const scrollToCheckAvatar = (idx: number) => {
    //     gsap.to(window, { duration: 0.6, scrollTo: { y: `#avatar_${idx}`, offsetY: 150 } });
    // };

    const handleRef = (ref, idx) => {
        contentRefs.current[idx] = ref;
    };

    const handleModelRef = (ref, idx) => {
        modelRefs.current[idx] = ref;
    };

    if (!show) {
        return <></>;
    }

    return (
        <div className="mx-auto w-full max-w-[1440px]">
            <UseAvatarModal open={successModel} onClose={() => showSuccessModel(false)} />
            <div className="split flex">
                <div className="pic-container relative ml-[45px] mt-[65px] flex h-[200px] w-1/3 shrink-0 items-center justify-center md:ml-[130px] md:!h-[36vh] md:w-1/4">
                    <div className="absolute left-[-40px] flex flex-col items-center justify-start md:left-[-110px]">
                        <div className="font-inter-semibold text-sm md:text-[18px]">Select</div>
                        {avatarList.map((item, idx) => {
                            return (
                                <LeftAvatars
                                    item={item}
                                    idx={idx}
                                    key={item.id}
                                    avatarIdx={avatarIdx}
                                    onUseAvatar={() => onUseAvatar(item, idx)}
                                />
                            );
                        })}
                    </div>
                    {avatarList.map((item, idx) => {
                        return (
                            <img
                                key={item.id}
                                ref={(ref) => handleModelRef(ref, idx)}
                                alt=""
                                className={cn(
                                    'absolute left-[50%] top-0 h-[200px] translate-x-[-50%] object-cover md:h-[36vh]',
                                    idx === 0 ? 'opacity-100' : 'opacity-0',
                                )}
                                src={item.modelSrc}
                            />
                        );
                    })}
                </div>
                <div className="text ml-[12px] flex-1 pb-[60px] md:ml-[50px]">
                    {avatarList.map((item, idx) => {
                        return (
                            <div
                                key={item.id}
                                ref={(ref) => handleRef(ref, idx)}
                                className="item mt-[65px] min-h-[50vh] w-full"
                                id={`avatar_${idx}`}
                            >
                                <div className="w-full rounded-[24px]">
                                    <img
                                        className="w-full object-cover"
                                        alt=""
                                        src={item.descSrc}
                                    />
                                </div>
                                <div className="mt-[20px] w-full md:mt-[40px]">
                                    <p className="font-inter-semibold text-[18px] leading-[30px] text-white md:text-[36px] md:leading-[40px]">
                                        {item.title}
                                    </p>
                                    <p className="mt-[10px] text-ellipsis font-inter-medium text-[14px] leading-[20px] text-white opacity-70 md:mt-[20px] md:text-[16px] md:leading-[24px]">
                                        {item.desc}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="relative z-10 my-[10px] flex items-center rounded-[24px] bg-[#1A2236] px-[10px] py-[20px] md:my-[50px] md:px-[35px] md:py-[50px]">
                <div className="justify-left flex w-[100px] items-center pl-[10px] font-inter-semibold text-[18px] leading-[40px] md:w-[335px] md:pl-[30px] md:text-[24px]">
                    Avatar, having another Identity in the Metaverse
                </div>
                <div className="mx-[30px] h-[130px] w-[2px] bg-gradient-to-b from-white to-[rgba(255,255,255,0)] md:mx-[50px] md:h-[65px]"></div>
                <div className="flex-1 px-[5px] font-inter-medium text-[12px] leading-[28px] text-white opacity-70 md:text-[16px]">
                    You have the option to suit yourself with a 3D Avatar. You can use the default
                    avatar that incorporates your profile picture as its head, choose from free
                    avatars above, or customize your own avatar in the near updates. To change your
                    avatar, click the USE button below the character.
                </div>
            </div>
        </div>
    );
};

export default AvatarMain;
