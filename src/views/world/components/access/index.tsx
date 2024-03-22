/* eslint-disable no-unused-vars */
import { useEffect, useState } from 'react';
import { Form } from 'antd';
import { CheckCircleOutlined } from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import AspectRatio from '@/components/ui/aspect-ratio';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useCollectionDataList } from '@/hooks/nft/collection';
import { cn } from '@/common/cn';
import { UniqueCollectionData } from '@/types/yuku';
import { AInputPassword, DateTimePicker } from '../custom-theme-ui';

export enum TypeEnum {
    PASSWORD = 1,
    WHITEADDRESS,
    DATE,
    NFTS,
    NOSET,
}

export type LeftTabItem = {
    id: number;
    type: TypeEnum;
    title: string;
    desc: string;
};

export const leftTabs: LeftTabItem[] = [
    {
        id: 5,
        type: TypeEnum.NOSET,
        title: 'No Access Control',
        desc: 'Everyone has an account can join',
    },
    {
        id: 1,
        type: TypeEnum.PASSWORD,
        title: 'Access to Password Restriction',
        desc: 'Restrict access to visitors with a password',
    },
    {
        id: 2,
        type: TypeEnum.WHITEADDRESS,
        title: 'Access to Whitelist of Principal ID',
        desc: 'Enable this rule to create private events with a few friends or add your whitelist for a massive private party.',
    },
    {
        id: 3,
        type: TypeEnum.DATE,
        title: 'Access to Specific Dates',
        desc: 'Enable this rule if you’re organizing a time-specific events (concert, party, talk-show..) to limit users from entering before the event.',
    },
    {
        id: 4,
        type: TypeEnum.NFTS,
        title: 'Access to Owners of Specific NFTs',
        desc: 'Enable this rule to make your space a private gathering spot for owners of one or more collections.',
    },
];

export const switchKeys = (key: TypeEnum) => {
    switch (key) {
        case TypeEnum.PASSWORD:
            return ['password', 'confirm'];
            break;
        case TypeEnum.WHITEADDRESS:
            return ['whitelist'];
            break;
        case TypeEnum.DATE:
            return ['startTime', 'endTime'];
            break;
        default:
            return [];
            break;
    }
};

export const PasswordItem = () => {
    return (
        <>
            <Form.Item
                name="password"
                label={
                    <div className="font-inter-semibold text-[16px] leading-[18px] text-[#fff]">
                        Password
                    </div>
                }
                required={false}
                rules={[
                    {
                        required: true,
                        message: 'Please input your password!',
                    },
                    ({ getFieldValue }) => ({
                        validator(_, value) {
                            if (
                                !value ||
                                (getFieldValue('password').length >= 6 &&
                                    getFieldValue('password').length <= 32)
                            ) {
                                return Promise.resolve();
                            }
                            return Promise.reject(
                                new Error(
                                    'Please set a password between 6 and 32 characters long!',
                                ),
                            );
                        },
                    }),
                ]}
            >
                <AInputPassword className="!font-inter-medium !text-[14px]" />
            </Form.Item>
            <Form.Item
                name="confirm"
                label={
                    <div className="font-inter-semibold text-[16px] leading-[18px] text-[#fff]">
                        Confirm Password
                    </div>
                }
                required={false}
                dependencies={['password']}
                rules={[
                    {
                        required: true,
                        message: 'Please confirm your password!',
                    },
                    ({ getFieldValue }) => ({
                        validator(_, value) {
                            if (!value || getFieldValue('password') === value) {
                                return Promise.resolve();
                            }
                            return Promise.reject(
                                new Error('The new password that you entered do not match!'),
                            );
                        },
                    }),
                ]}
            >
                <AInputPassword className="!font-inter-medium !text-[14px]" />
            </Form.Item>
        </>
    );
};

export const WhiteListItem = () => {
    return (
        <>
            <Form.Item
                name="whitelist"
                label={
                    <div>
                        <div className="mb-[8px] font-inter-semibold text-[16px] leading-[18px] text-[#fff]">
                            Setup Whitelist
                        </div>
                        <div className="mb-[8px] font-inter-semibold text-[14px] leading-[21px] text-[#fff] opacity-70">
                            Enable this rule to create private events with a few friends or add your
                            whitelist for a massive private party.
                        </div>
                        <div className="mb-[8px] font-inter-semibold text-[14px] leading-[21px] text-[#fff] opacity-70">
                            Multiple Principal ID input separated by ";" , eg. XXXXX-XXX;XXXXX-XXX
                        </div>
                    </div>
                }
                required={false}
                rules={[
                    {
                        required: true,
                        message: 'Please enter white list!',
                    },
                ]}
            >
                <Textarea className=" h-[330px] w-full !rounded-[8px] !bg-[#283047] font-inter-medium text-white placeholder:text-[#D0D0D0]" />
            </Form.Item>
        </>
    );
};

export const DatePickerItem = () => {
    const [startTime, setStartTime] = useState<string | null>(null);
    const disabledStartDate = (current: Dayjs): boolean => {
        // Can not select days before today and today
        return current && current < dayjs().startOf('day');
    };

    const disabledEndDate = (current: Dayjs): boolean => {
        if (startTime) {
            return current && current < dayjs(startTime).startOf('day');
        }
        // Can not select days before today and today
        return current && current < dayjs().startOf('day');
    };

    return (
        <>
            <Form.Item
                name="startTime"
                label={
                    <div className="font-inter-semibold text-[16px] leading-[18px] text-[#fff]">
                        Start date
                    </div>
                }
                required={false}
                rules={[
                    {
                        required: true,
                        message: 'Please select start time!',
                    },
                ]}
            >
                <DateTimePicker
                    disabledDate={disabledStartDate}
                    onChange={(_time: Dayjs | null, timeString: string) => setStartTime(timeString)}
                />
            </Form.Item>
            <Form.Item
                name="endTime"
                label={
                    <div className="font-inter-semibold text-[16px] leading-[18px] text-[#fff]">
                        {`End date (optional)`}
                    </div>
                }
                required={false}
            >
                <DateTimePicker disabledDate={disabledEndDate} />
            </Form.Item>
        </>
    );
};

export const CheckNftItem = ({ checkNftInfo, setCheckNftInfo }) => {
    const [keyword, setKeyword] = useState<string>('');
    const [nftList, setNftList] = useState<UniqueCollectionData[]>([]);
    const collectionDataList = useCollectionDataList();

    useEffect(() => {
        return () => {
            setCheckNftInfo(null);
        };
    }, []);

    useEffect(() => {
        getNftList();
    }, [collectionDataList]);

    const keywordChange = (e) => {
        setKeyword(e.target.value);
    };

    useEffect(() => {
        getNftList();
    }, [keyword]);

    const getNftList = () => {
        if (!keyword) {
            setNftList(collectionDataList);
            return;
        }
        const list = collectionDataList.filter((item) => item.info.name.indexOf(keyword) >= 0);
        setNftList(list);
    };

    const checkNft = (item) => {
        if (checkNftInfo && item.info.collection === checkNftInfo.info.collection) {
            setCheckNftInfo(null);
            return;
        }
        setCheckNftInfo(item);
    };

    return (
        <div>
            <div className="font-inter-semibold text-[16px] leading-[18px] text-[#fff]">
                Search in your NFT collections
            </div>
            <div className="mt-[12px] flex items-center justify-between gap-x-[20px]">
                <div className="flex-1">
                    <Input
                        className="!h-[48px] w-full !rounded-[8px] !bg-[#283047] pl-[15px] text-white placeholder:font-inter-medium placeholder:text-[#D0D0D0]"
                        onChange={keywordChange}
                        placeholder="Type some keyword"
                    />
                </div>
                <div className="h-[48px] w-[145px] cursor-pointer rounded-[8px] bg-[#283047] px-[10px] text-center font-inter-semibold text-[14px] leading-[48px]">
                    <span className="opacity-60">Internet Computer</span>
                </div>
            </div>
            <div className="mt-[12px] grid max-h-[420px] w-full grid-cols-4 gap-[10px] overflow-y-auto">
                {nftList.map((item, idx) => {
                    return (
                        <div
                            key={`item_nft_${idx}`}
                            className={cn(
                                'cursor-pointer rounded-[8px] border p-2',
                                checkNftInfo &&
                                    checkNftInfo.info.collection === item.info.collection
                                    ? 'border-[#fff]'
                                    : '',
                            )}
                            onClick={() => checkNft(item)}
                        >
                            <AspectRatio className="flex items-center justify-center" ratio={1}>
                                <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-[8px]">
                                    <img
                                        className="h-full object-contain"
                                        src={item.info.logo}
                                        alt=""
                                    />
                                    {checkNftInfo &&
                                        checkNftInfo.info.collection === item.info.collection && (
                                            <div className="absolute left-0 top-0 flex h-full w-full items-center justify-center rounded-[8px]">
                                                <CheckCircleOutlined className="text-[30px] text-[#e0e9e1]" />
                                            </div>
                                        )}
                                </div>
                            </AspectRatio>
                            <div className="h-[24px] w-full overflow-hidden truncate text-ellipsis">
                                {item.info.name}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
