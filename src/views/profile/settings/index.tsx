import { useEffect, useState } from 'react';
import { isMobile } from 'react-device-detect';
import { useNavigate } from 'react-router-dom';
import { Form, Input } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import Wallet from '@/components/layout/components/user-sidebar/wallet';
import message from '@/components/message';
import { Button } from '@/components/ui/button';
import { changeUserMetadata } from '@/utils/apis/yuku/api';
import { cn } from '@/common/cn';
import { isEmail } from '@/common/data/email';
import { FirstRenderByData } from '@/common/react/render';
import { useIdentityStore } from '@/stores/identity';
import AvatarCrop from './components/avatar';

type ProfileForm = {
    username: string;
    banner: string;
    avatar: string;
    email: string;
    bio: string;
    twitter: string;
    discord: string;
    telegram: string;
};

function ProfileSettingsPage() {
    const navigate = useNavigate();
    const identity = useIdentityStore((s) => s.connectedIdentity);
    const getYukuToken = useIdentityStore((s) => s.getYukuToken);
    const token = identity && getYukuToken();
    const { TextArea } = Input;
    const isEmailLogin = identity?.connectType === 'email';
    const [once_check_identity] = useState(new FirstRenderByData());
    useEffect(
        () =>
            once_check_identity.once([!!identity], () => {
                if (!identity) navigate('/connect');
            }),
        [identity],
    );

    const reloadIdentityProfile = useIdentityStore((s) => s.reloadIdentityProfile);

    const identityProfile = useIdentityStore((s) => s.identityProfile);

    const [form] = Form.useForm();

    const [data, setData] = useState<ProfileForm>({
        username: '',
        banner: '',
        avatar: '',
        email: '',
        bio: '',
        twitter: '',
        discord: '',
        telegram: '',
    });

    const [validEmail, setValidEmail] = useState(!data.email || isEmail(data.email.trim()));

    const onEmailChange = ({ target: { value } }) => {
        setValidEmail(!value || isEmail(value.trim()));
    };

    useEffect(() => {
        if (!identityProfile) return;
        let changed = false;
        ['username', 'banner', 'avatar', 'bio'].forEach((key) => {
            if (identityProfile[key] !== data[key]) {
                changed = true;
                data[key] = identityProfile[key];
            }
        });
        ['twitter', 'discord', 'telegram', 'email'].forEach((key) => {
            if (identityProfile.social[key] !== data[key]) {
                changed = true;
                data[key] = identityProfile.social[key];
            }
        });
        if (isEmailLogin) {
            data['email'] = identity.main_email;
        }
        if (changed) {
            setData({ ...data });
            form.setFieldsValue(data);
        }
    }, [identityProfile, isEmailLogin, form]);

    const onFileChange = (avatar: any) => {
        console.log('avatar', avatar);
        setData({ ...data, avatar });
    };

    const [updating, setUpdating] = useState(false);
    const doUpdate = (data: ProfileForm) => {
        if (updating) return false;
        if (!identity) return navigate('/connect');
        if (!identityProfile) return false;
        if (!token) {
            return;
        }
        const args = { ...data };
        args.username = args.username?.trim() ?? '';
        args.email = args.email?.trim() ?? '';
        args.bio = bio?.trim() ?? '';
        args.avatar = args.avatar === '' ? identityProfile.avatar : args.avatar;

        setUpdating(true);
        changeUserMetadata({
            params: token,
            data: {
                avatar: args.avatar,
                bio: args.bio,
                name: args.username,
                social: JSON.stringify({
                    telegram: args.telegram,
                    twitter: args.twitter,
                    discord: args.discord,
                    email: args.email,
                }),
            },
        })
            .then((d) => {
                if (d) {
                    message.success('Profile updated successful');
                    reloadIdentityProfile(3);
                } else {
                    message.error('update failed');
                }
            })
            .catch((e) => message.error(`${e}`))
            .finally(() => {
                setIsEdit(false);
                setUpdating(false);
            });
    };

    const onUpdate = (info: ProfileForm) => {
        doUpdate({ ...data, ...info });
    };

    type FieldType = {
        username?: string;
        bio?: string;
        email?: string;
        twitter?: string;
        discord?: string;
        telegram?: string;
    };

    const onFinishFailed = (e: any) => {
        message.error(`${e.errorFields[0].errors[0]}`);
    };

    const [isEdit, setIsEdit] = useState<boolean>(false);

    const [bio, setBio] = useState<string | undefined>();
    function onBioChange({ target: { value } }) {
        setBio(value);
    }

    useEffect(() => {
        setData({
            username: identityProfile?.username ?? '',
            banner: '',
            avatar: identityProfile?.avatar ?? '',
            email: identityProfile?.social.email
                ? identityProfile?.social.email
                : isEmailLogin
                ? identity.main_email
                : '',
            bio: identityProfile?.bio ?? '',
            twitter: identityProfile?.social.twitter ?? '',
            discord: identityProfile?.social.discord ?? '',
            telegram: identityProfile?.social.telegram ?? '',
        });

        setBio(identityProfile?.bio);
    }, [identityProfile, isEmailLogin, identity]);

    if (!identity) return <></>;

    const [mobileTab, setMobileTab] = useState<'WALLET' | 'SETTING'>('WALLET');
    return (
        <>
            <div className="-mt-[44px] flex w-full md:-mt-[75px]">
                <div className="relative mb-[36px] h-[150px] w-full font-inter-bold text-[26px] md:h-[348px]">
                    <img className="h-full w-full" src={'/img/profile/setting-bg.png'} alt="" />
                    <div
                        className="absolute -bottom-20 left-0 right-0 top-0 h-full w-full"
                        style={{
                            background:
                                'linear-gradient(180deg, rgba(16, 21, 34, 0) 50%, #101522 100%)',
                        }}
                    ></div>
                </div>
            </div>
            <div className="setting-container m-auto w-full bg-transparent md:w-[1200px]">
                <div className="mt-[-70px] flex w-full md:mt-[-100px]">
                    <div className="group relative ml-[20px] h-[65px] w-[65px] flex-shrink-0 cursor-pointer overflow-hidden rounded-full bg-gradient-to-r from-fuchsia-600 to-sky-500 md:ml-[15px] md:h-[144px] md:w-[144px] md:rounded-full">
                        <AvatarCrop avatar={data.avatar} onFileChange={onFileChange} />
                    </div>
                    <div className="relative ml-[15px] flex w-full flex-1 flex-col items-start justify-center md:ml-[40px]">
                        <div className="flex w-full items-center justify-between gap-x-5">
                            <p className="h-[40px] text-center font-['Inter'] text-[18px] font-bold text-white md:text-[26px]">
                                {identityProfile?.username}
                            </p>
                            <div
                                onClick={() =>
                                    setIsEdit((p) => {
                                        if (p) {
                                            form.resetFields();
                                        }
                                        return !p;
                                    })
                                }
                                className={cn(
                                    'mr-[15px] flex cursor-pointer items-center justify-center rounded-[8px] bg-[#1668dc] px-[10px] py-[6px] md:mr-0',
                                    isMobile && mobileTab === 'WALLET' && 'hidden',
                                )}
                            >
                                <img
                                    src={'/img/profile/edit1.svg'}
                                    className="w-[14px] cursor-pointer md:w-[18px]"
                                />
                                <span className="ml-3 font-inter-medium">
                                    {!isEdit ? 'Modify' : 'Cancel'}
                                </span>
                            </div>
                        </div>
                        <div
                            className={cn(
                                `mt-[20px] flex max-h-[80px] w-auto items-start overflow-scroll rounded-[4px]  duration-300 md:w-[685px] ${
                                    isEdit && '!bg-[#283047]'
                                }`,
                                isMobile && 'mt-0 max-h-[32px]',
                            )}
                        >
                            <TextArea
                                autoSize={true}
                                value={bio}
                                placeholder={isEdit ? 'Please input bio' : 'None'}
                                disabled={!isEdit}
                                onChange={onBioChange}
                                className={cn(
                                    'w-full resize-none !bg-[#1F2432] bg-transparent px-0 font-inter-medium text-base leading-normal text-white text-opacity-60 outline-none placeholder:text-white/70',
                                    isEdit && 'px-2',
                                )}
                            />
                        </div>
                    </div>
                </div>
                <div
                    className={cn(
                        'flex gap-x-[100px] rounded-[24px] bg-[#141927] px-[30px] py-[40px]',
                        isMobile && 'flex-col',
                    )}
                >
                    <div
                        className={cn(
                            'hidden font-inter-semibold text-[32px] leading-none',
                            isMobile && 'flex text-[18px]',
                        )}
                    >
                        <div
                            onClick={() => {
                                setMobileTab('WALLET');
                            }}
                            className="relative"
                        >
                            Wallet
                            {mobileTab === 'WALLET' && (
                                <div className=" absolute -bottom-1 h-[2px]  w-full bg-shiku"></div>
                            )}
                        </div>
                        <div
                            onClick={() => {
                                setMobileTab('SETTING');
                            }}
                            className="relative ml-6"
                        >
                            Setting
                            {mobileTab === 'SETTING' && (
                                <div className="absolute -bottom-1 h-[2px]  w-full bg-shiku"></div>
                            )}
                        </div>
                    </div>
                    {isMobile && (
                        <div
                            className={cn(
                                'mb-[30px] mt-[30px] h-px bg-white/[0.14]',
                                isMobile && 'my-[4px]',
                            )}
                        ></div>
                    )}
                    {(mobileTab === 'WALLET' || !isMobile) && (
                        <div className={cn(!isMobile && 'w-[450px]')}>
                            {!isMobile && (
                                <>
                                    <div
                                        onClick={() => {
                                            setMobileTab('WALLET');
                                        }}
                                        className="relative font-inter-semibold text-[32px] leading-none"
                                    >
                                        Wallet Address
                                        {mobileTab === 'WALLET' && isMobile && (
                                            <div className=" absolute -bottom-3 h-[2px]  w-full bg-shiku"></div>
                                        )}
                                    </div>
                                    <div
                                        className={cn('mb-[30px] mt-[30px] h-px bg-white/[0.14]')}
                                    ></div>
                                </>
                            )}

                            <Wallet></Wallet>
                        </div>
                    )}
                    {(mobileTab === 'SETTING' || !isMobile) && (
                        <Form
                            name="basic"
                            form={form}
                            className={cn('!w-full md:!w-[600px] md:!px-0', isMobile && 'mt-5')}
                            initialValues={data}
                            onFinish={onUpdate}
                            onFinishFailed={onFinishFailed}
                            autoComplete="off"
                        >
                            <div className="profile grid grid-cols-1 gap-x-[190px] gap-y-[20px] md:gap-y-[40px]">
                                <div className="flex w-full flex-col">
                                    <div className="!mb-[14px] w-full text-left font-inter-medium text-[14px] text-white md:text-[18px]">
                                        User Name
                                    </div>
                                    <div className="flex items-center justify-center">
                                        <img
                                            className="mr-[17px] w-[18px] md:w-[28px] "
                                            src="/img/profile/user-name.svg"
                                            alt=""
                                        />
                                        <Form.Item<FieldType>
                                            name="username"
                                            className="flex h-[50px] flex-1 flex-shrink-0 items-center !rounded-[4px] !bg-[#1F2432] text-white md:h-[60px] md:!rounded-[8px]"
                                        >
                                            <Input
                                                disabled={!isEdit}
                                                placeholder={
                                                    isEdit ? 'Please input username' : 'None'
                                                }
                                                className="w-full !rounded-[4px] !bg-[#1F2432] pl-[15px] text-black placeholder:text-[#D0D0D0] md:!h-[60px] md:!rounded-[8px]"
                                            />
                                        </Form.Item>
                                    </div>
                                </div>

                                <div className="flex w-full flex-col">
                                    <div className="!mb-[14px] w-full text-left font-inter-medium text-[14px] text-white md:text-[18px]">
                                        Email Address
                                    </div>
                                    <div className="flex items-center justify-center">
                                        <img
                                            className="mr-[17px] w-[18px] md:w-[28px] "
                                            src="/img/profile/email-icon.svg"
                                            alt=""
                                        />
                                        <Form.Item<FieldType>
                                            name="email"
                                            className={cn(
                                                'flex h-[50px] flex-1 flex-shrink-0 items-center !rounded-[4px] !bg-[#1F2432] text-white md:h-[60px] md:!rounded-[8px]',
                                            )}
                                            rules={[
                                                {
                                                    required: !validEmail,
                                                    type: 'email',
                                                    message: 'Please input correct email!',
                                                },
                                            ]}
                                        >
                                            <Input
                                                disabled={!isEdit || isEmailLogin}
                                                placeholder={isEdit ? 'Please input email' : 'None'}
                                                className={cn(
                                                    'w-full !rounded-[4px] !bg-[#1F2432] pl-[15px] text-black placeholder:text-[#D0D0D0] md:!h-[60px] md:!rounded-[8px]',
                                                    isEmailLogin &&
                                                        '!cursor-not-allowed !text-gray-500',
                                                )}
                                                onChange={onEmailChange}
                                                rootClassName="email"
                                            />
                                        </Form.Item>
                                    </div>
                                </div>

                                <div className="flex w-full flex-col">
                                    <div className="!mb-[14px] w-full text-left font-inter-medium text-[14px] text-white md:text-[18px]">
                                        Telegram
                                    </div>
                                    <div className="flex items-center justify-center">
                                        <img
                                            className="mr-[17px] w-[18px] md:w-[28px] "
                                            src="/img/profile/telegram-icon.svg"
                                            alt=""
                                        />
                                        <Form.Item<FieldType>
                                            name="telegram"
                                            className="flex h-[50px] flex-1 flex-shrink-0 items-center !rounded-[4px] !bg-[#1F2432] text-white md:h-[60px] md:!rounded-[8px]"
                                        >
                                            <Input
                                                placeholder={
                                                    isEdit ? 'Please input telegram' : 'None'
                                                }
                                                disabled={!isEdit}
                                                className="w-full !rounded-[4px] !bg-[#1F2432] pl-[15px] text-black placeholder:text-[#D0D0D0] md:!h-[60px] md:!rounded-[8px]"
                                            />
                                        </Form.Item>
                                    </div>
                                </div>

                                <div className="flex w-full flex-col">
                                    <div className="!mb-[14px] w-full text-left font-inter-medium text-[14px] text-white md:text-[18px]">
                                        Twitter
                                    </div>
                                    <div className="flex items-center justify-center">
                                        <img
                                            className="mr-[17px] w-[18px] md:w-[28px] "
                                            src="/img/profile/twitter-icon.svg"
                                            alt=""
                                        />
                                        <Form.Item<FieldType>
                                            name="twitter"
                                            className="flex h-[50px] flex-1 flex-shrink-0 items-center !rounded-[4px] !bg-[#1F2432] text-white md:h-[60px] md:!rounded-[8px]"
                                        >
                                            <Input
                                                disabled={!isEdit}
                                                placeholder={
                                                    isEdit ? 'Please input twitter' : 'None'
                                                }
                                                className="w-full !rounded-[4px] !bg-[#1F2432] pl-[15px] text-black placeholder:text-[#D0D0D0] md:!h-[60px] md:!rounded-[8px]"
                                                rootClassName="twitter"
                                            />
                                        </Form.Item>
                                    </div>
                                </div>

                                <div className="flex w-full flex-col">
                                    <div className="!mb-[14px] w-full text-left font-inter-medium text-[14px] text-white md:text-[18px]">
                                        Discord
                                    </div>
                                    <div className="flex items-center justify-center">
                                        <img
                                            className="mr-[17px] w-[18px] md:w-[28px] "
                                            src="/img/profile/discord-icon.svg"
                                            alt=""
                                        />
                                        <Form.Item<FieldType>
                                            name="discord"
                                            className="flex h-[50px] flex-1 flex-shrink-0 items-center !rounded-[4px] !bg-[#1F2432] text-white md:h-[60px] md:!rounded-[8px]"
                                        >
                                            <Input
                                                disabled={!isEdit}
                                                placeholder={
                                                    isEdit ? 'Please input discord' : 'None'
                                                }
                                                className="w-full !rounded-[4px] !bg-[#1F2432] pl-[15px] text-black placeholder:text-[#D0D0D0] md:!h-[60px] md:!rounded-[8px]"
                                            />
                                        </Form.Item>
                                    </div>
                                </div>
                            </div>
                            <Form.Item>
                                <Button
                                    className={cn([
                                        'm-auto mt-[30px] hidden h-[48px] w-[147px] !cursor-pointer items-center justify-center rounded-[8px] bg-[#36F] font-inter-semibold leading-[32px] text-white hover:bg-[#36F] md:m-0 md:mt-[60px] md:!h-[48px] md:leading-[48px]',
                                        updating && 'cursor-no-drop',
                                        isEdit && 'flex',
                                    ])}
                                >
                                    Save
                                    {updating && (
                                        <LoadingOutlined className="ml-2 text-lg"></LoadingOutlined>
                                    )}
                                </Button>
                            </Form.Item>
                        </Form>
                    )}
                </div>
            </div>
        </>
    );
}

export default ProfileSettingsPage;
