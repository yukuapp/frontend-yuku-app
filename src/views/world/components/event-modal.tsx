import { useEffect, useRef, useState } from 'react';
import { Form } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import _ from 'lodash';
import message from '@/components/message';
import YukuModal from '@/components/modal/yuku-modal';
import { YukuButton } from '@/components/ui/button';
import CloseIcon from '@/components/ui/close-icon';
import { createSpaceEvent } from '@/utils/apis/yuku/api';
import {
    CreateSpaceEvent,
    SpaceOpening,
    SpacePermission,
    SpeakMode,
    UserChainIdentity,
    UserSpace,
} from '@/apis/yuku/api';
import { cn } from '@/common/cn';
import { useIdentityStore } from '@/stores/identity';
import { UniqueCollectionData } from '@/types/yuku';
import {
    CheckNftItem,
    leftTabs,
    PasswordItem,
    switchKeys,
    TypeEnum,
    WhiteListItem,
} from './access';
import EventSetup, { ResetRef } from './event-setup';
import './index.less';

type TabItem = {
    id: number;
    label: string;
};

export type SpaceEventBaseInfor = {
    host_list: number[];
    opening: SpaceOpening | undefined;
    speak_mode: SpeakMode;
    title: string;
    event_class: string;
    description: string;
    cover_image: string;
};

const tabs: TabItem[] = [
    {
        id: 1,
        label: 'Event Setup',
    },
    {
        id: 2,
        label: 'Privacy Access',
    },
];

const EventModal = ({
    open,
    onClose,
    space,
    updateEventList,
}: {
    open: boolean;
    onClose: () => void;
    space: UserSpace;
    updateEventList: (s?: boolean) => void;
}) => {
    const SetupRef = useRef<ResetRef | null>();
    const [currentTab, setCurrentTab] = useState(1);
    const [baseInfo, setBaseInfo] = useState<SpaceEventBaseInfor>();
    const [form] = Form.useForm();
    const [current, setCurrent] = useState(TypeEnum.NOSET);
    const [checkNftInfo, setCheckNftInfo] = useState<UniqueCollectionData | null>(null);
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

    const goNext = (info) => {
        const speak_mode =
            info.speak_mode === 'SpeakMode' ? { Assign: [token?.user_id] } : info.speak_mode;
        const newInfo = {
            ...info,
            speak_mode,
        };
        setBaseInfo(newInfo);
        setCurrentTab(2);
    };

    const goPrev = () => {
        setCurrentTab(1);
    };

    const closeModel = () => {
        SetupRef && SetupRef.current?.onReset();
        setCurrentTab(1);
        setCurrent(TypeEnum.NOSET);
        onClose && onClose();
    };

    const onSubmit = async () => {
        let permission: SpacePermission = 'None';

        if (current === TypeEnum.NOSET) {
            submitData(permission);
            return;
        }

        if (current === TypeEnum.NFTS) {
            if (!checkNftInfo) {
                return message.error('Please select nft collection!');
            }

            permission = {
                Required: {
                    ChainNftOwner: {
                        address: checkNftInfo.info?.collection,
                        chain: {
                            InternetComputer: {
                                network: 'Ic',
                            },
                        },
                    },
                },
            };
            submitData(permission);
            return;
        }

        const values = await form.validateFields(switchKeys(current));

        if (current === TypeEnum.PASSWORD) {
            permission = { Required: { Password: values.password } };
        }

        if (current === TypeEnum.WHITEADDRESS) {
            const str = values.whitelist.replace(/\s*/g, '');

            let pList = _.compact(_.split(str, ';') || []);
            pList = _.uniq(pList);

            if (pList.length === 0) return;

            const list = pList.map((item) => {
                const ic: UserChainIdentity = {
                    InternetComputer: {
                        network: 'Ic',
                        principal: item,
                    },
                };
                return {
                    Required: { ChainIdentity: ic },
                };
            });
            permission = { Any: list };
        }

        submitData(permission);
    };

    const submitData = (setting: SpacePermission) => {
        if (!token) return;

        const params = {
            ...baseInfo,
            user_space_id: space.id,
            permission: setting,
            host_list: [token.user_id],
        } as CreateSpaceEvent;

        setLoading(true);
        !loading &&
            createSpaceEvent({
                params: token,
                data: params,
            })
                .then(() => {
                    message.success('Save successful');
                    updateEventList(true);
                    closeModel();
                    form.resetFields();
                })
                .catch((e) => {
                    console.debug('🚀 ~ e:', e);
                    const e_json = JSON.parse(e.message);

                    const code = e_json.code;
                    if (code === 3300) {
                        message.error('Authorization is required to host an event.');
                    }
                })
                .finally(() => {
                    setLoading(false);
                });
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
                                        <span>
                                            {index + 1}. {item.label}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="mb-[10px] mt-[10px] h-px w-full bg-[#262e47] md:mb-[14px] md:mt-[14px]" />
                </div>

                <div className="setting relative min-h-[570px] w-full">
                    <EventSetup ref={SetupRef} goNext={goNext} show={currentTab === 1} />

                    <div
                        className={cn(
                            'absolute left-0 top-0 flex h-full w-full flex-col justify-between',
                            currentTab === 2 ? 'z-10 opacity-100' : 'z-1 opacity-0',
                        )}
                    >
                        <div className="flex justify-between">
                            <div className="ml-[-12px] w-[45%]">
                                {leftTabs.map((item) => {
                                    if (item.type !== TypeEnum.DATE) {
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
                        <div className="flex justify-end">
                            <YukuButton
                                type={'CANCEL'}
                                onClick={() => goPrev && goPrev()}
                                className="mr-[12px]"
                            >
                                Prev
                            </YukuButton>
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

export default EventModal;
