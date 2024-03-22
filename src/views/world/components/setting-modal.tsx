import { useEffect, useState } from 'react';
import { Form } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import _ from 'lodash';
import message from '@/components/message';
import YukuModal from '@/components/modal/yuku-modal';
import { YukuButton } from '@/components/ui/button';
import CloseIcon from '@/components/ui/close-icon';
import {
    updateUserSpacePermission,
    updateUserSpacePermissionWithChainIdentity,
    updateUserSpacePermissionWithPassword,
} from '@/utils/apis/yuku/api';
import { SpacePermission, UserSpace } from '@/apis/yuku/api';
import { cn } from '@/common/cn';
import { useIdentityStore } from '@/stores/identity';
import {
    CheckNftItem,
    DatePickerItem,
    leftTabs,
    PasswordItem,
    switchKeys,
    TypeEnum,
    WhiteListItem,
} from './access';
import './index.less';

type TabItem = {
    id: number;
    label: string;
    icon: string;
};

const tabs: TabItem[] = [
    {
        id: 1,
        label: 'Privacy Access',
        icon: '/img/world/privacy.svg',
    },
];

const SettingModal = ({
    open,
    onClose,
    space,
    updateSpaceList,
}: {
    open: boolean;
    onClose: () => void;
    space: UserSpace;
    updateSpaceList: (s?: boolean) => void;
}) => {
    const [currentTab] = useState(1);
    const [form] = Form.useForm();
    const [current, setCurrent] = useState(TypeEnum.NOSET);
    const [checkNftInfo, setCheckNftInfo] = useState(null);
    const [loading, setLoading] = useState<boolean>(false);
    const identity = useIdentityStore((s) => s.connectedIdentity);
    const getYukuTokens = useIdentityStore((s) => s.getYukuToken);
    const token = identity && getYukuTokens();

    useEffect(() => {
        if (current === TypeEnum.NFTS) {
            setCheckNftInfo(null);
            return;
        }

        form.resetFields(switchKeys(current));
    }, [current]);

    const onSubmit = async () => {
        let permission: SpacePermission = 'None';

        if (current === TypeEnum.NOSET) {
            updateNosetPermission(permission);
            return;
        }

        if (current === TypeEnum.NFTS) {
            return;
        }

        const values = await form.validateFields(switchKeys(current));

        if (current === TypeEnum.PASSWORD) {
            permission = values.password;
            updatePassword(permission);
            return;
        }

        if (current === TypeEnum.WHITEADDRESS) {
            const str = values.whitelist.replace(/\s*/g, '');

            let pList = _.compact(_.split(str, ';') || []);
            pList = _.uniq(pList);

            if (pList.length === 0) return;

            const list = pList.map((item) => {
                return {
                    InternetComputer: {
                        network: 'Ic',
                        principal: item,
                    },
                };
            });

            pList.length > 0 && updateChain(list);
            return;
        }
    };

    const updateNosetPermission = (setting) => {
        if (!token) return;

        setLoading(true);
        !loading &&
            updateUserSpacePermission({
                user_token: token?.user_token,
                user_id: token?.user_id,
                user_space_id: space.id,
                permission: setting,
                opening: {},
            })
                .then(() => {
                    message.success('Save successful');
                    updateSpaceList(true);
                    closeModel();
                })
                .catch((e) => {
                    console.debug('🚀 ~ e:', e);
                })
                .finally(() => {
                    setLoading(false);
                });
    };

    const updatePassword = (setting) => {
        if (!token) return;

        setLoading(true);
        !loading &&
            updateUserSpacePermissionWithPassword({
                user_token: token?.user_token,
                user_id: token?.user_id,
                user_space_id: space.id,
                permission: setting,
                opening: {},
            })
                .then(() => {
                    message.success('Save successful');
                    closeModel();
                })
                .catch((e) => {
                    console.debug('🚀 ~ e:', e);
                })
                .finally(() => {
                    setLoading(false);
                });
    };

    const updateChain = (setting) => {
        if (!token) return;

        setLoading(true);
        !loading &&
            updateUserSpacePermissionWithChainIdentity({
                user_token: token?.user_token,
                user_id: token?.user_id,
                user_space_id: space.id,
                permission: setting,
                opening: {},
            })
                .then(() => {
                    message.success('Save successful');
                    closeModel();
                })
                .catch((e) => {
                    console.debug('🚀 ~ e:', e);
                })
                .finally(() => {
                    setLoading(false);
                });
    };

    const closeModel = () => {
        form.resetFields();
        setCurrent(TypeEnum.NOSET);
        onClose && onClose();
    };

    return (
        <YukuModal
            hasHeader={false}
            open={open}
            onClose={closeModel}
            width={'w-full md:w-[820px]'}
            maskClosable={false}
        >
            <div className="w-full">
                <div className="relative">
                    <div className="absolute right-0 top-0">
                        <CloseIcon onClick={closeModel} />
                    </div>
                    <div className="flex">
                        <div className="flex w-full items-center justify-start gap-x-7">
                            {tabs.map((item, index) => (
                                <div
                                    key={index}
                                    className={cn(
                                        'relative flex h-[30px] cursor-pointer items-center font-inter-semibold text-[16px] text-white/60 duration-100 md:h-[35px] md:text-[20px]',
                                        currentTab === item.id && 'text-white',
                                    )}
                                >
                                    {currentTab === item.id && (
                                        <div className="absolute -bottom-[12px] h-[2px] w-full bg-white md:-bottom-[15px]"></div>
                                    )}
                                    <div className="flex items-center justify-between gap-x-2">
                                        <img
                                            className={cn(
                                                currentTab === item.id ? '' : 'opacity-60',
                                            )}
                                            src={item.icon}
                                            alt=""
                                        />
                                        <span>{item.label}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="mb-[10px] mt-[10px] h-px w-full bg-[#262e47] md:mb-[14px] md:mt-[14px]" />
                </div>

                <div className="setting relative min-h-[350px] w-full">
                    <div className={cn('flex h-full w-full flex-col justify-between')}>
                        <div className="flex justify-between">
                            <div className="ml-[-12px] w-[45%]">
                                {leftTabs.map((item) => {
                                    if (
                                        item.type === TypeEnum.NOSET ||
                                        item.type === TypeEnum.PASSWORD
                                    ) {
                                        return (
                                            <div
                                                key={`left_menu_${item.id}`}
                                                className={cn(
                                                    'cursor-pointer rounded-[12px] p-[20px] transition-all duration-300',
                                                    current !== item.type
                                                        ? 'bg-transparent'
                                                        : 'bg-[#283047]',
                                                )}
                                                onClick={() => setCurrent(item.type)}
                                            >
                                                <div className="font-inter-medium text-[16px] leading-[16px] text-[#fff]">
                                                    {item.title}
                                                </div>
                                                <div className="mt-[10px] font-inter-regular text-[13px] leading-[21px] opacity-70">
                                                    {item.desc}
                                                </div>
                                            </div>
                                        );
                                    }
                                })}
                            </div>

                            <div className="flex flex-1 flex-col justify-between pl-[30px]">
                                <div>
                                    <Form layout="vertical" form={form} className="text-white">
                                        {current === TypeEnum.PASSWORD && <PasswordItem />}
                                        {current === TypeEnum.WHITEADDRESS && <WhiteListItem />}
                                        {current === TypeEnum.DATE && <DatePickerItem />}
                                    </Form>

                                    {current === TypeEnum.NFTS && (
                                        <CheckNftItem
                                            setCheckNftInfo={setCheckNftInfo}
                                            checkNftInfo={checkNftInfo}
                                        />
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="absolute bottom-0 right-0 flex justify-end">
                            <YukuButton type={'CONFIRM'} onClick={() => onSubmit()}>
                                {loading && <LoadingOutlined className="mr-2"></LoadingOutlined>}
                                Save
                            </YukuButton>
                        </div>
                    </div>
                </div>
            </div>
        </YukuModal>
    );
};

export default SettingModal;
