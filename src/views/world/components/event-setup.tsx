import { forwardRef, Ref, useImperativeHandle, useState } from 'react';
import { Form, Upload } from 'antd';
import type { RcFile } from 'antd/es/upload/interface';
import { LoadingOutlined } from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import message from '@/components/message';
import { YukuButton } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useUploadFile2Web3storage } from '@/hooks/nft/upload';
import { SpaceOpening } from '@/apis/yuku/api';
import { cn } from '@/common/cn';
import { DateTimePicker } from './custom-theme-ui';
import Select from './select';

type Properties = { label: string; value: string };

const TYPE_OPTIONS: Properties[] = [
    { value: 'Seminars', label: 'Seminars' },
    { value: 'Conferences', label: 'Conferences' },
    { value: 'TradeShows', label: 'Trade Shows' },
    { value: 'EducationSummit', label: 'Education Summit' },
    { value: 'Workshops', label: 'Workshops' },
    { value: 'ProductLaunch', label: 'Product Launch' },
];

const SPEAK_TYPE_OPTIONS: Properties[] = [
    { value: 'SpeakMode', label: 'Speaker Mode' },
    { value: 'Freedom', label: 'Free Mode' },
];

export type ResetRef = {
    onReset: () => void;
};

type BaseInfo = {
    opening: SpaceOpening;
    speak_mode: string;
    title: string;
    event_class: string;
    description: string;
    cover_image: string | undefined;
};

const imageFileTypes: string[] = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/svg+xml',
    'video/x-matroska',
    'model/gltf-binary',
    'model/gltf+json',
];

const imageBeforeUpload = (file: RcFile) => {
    const isFileTypes = imageFileTypes.includes(file.type);
    if (!isFileTypes) {
        message.error('You can only upload JPG/PNG file!');
    }

    const isLt2M = file.size / 1024 / 1024 < 150;
    if (!isLt2M) {
        message.error('Image must smaller than 150MB!');
    }

    return isFileTypes && isLt2M;
};

const UploadButton = ({ loading }: { loading: boolean }) => (
    <div>
        {loading ? (
            <LoadingOutlined className="text-[40px]" />
        ) : (
            <img src="/img/world/upload.svg" alt="" />
        )}
    </div>
);

const EventSetup = forwardRef(
    (
        { show, goNext }: { show: boolean; goNext: (params: BaseInfo) => void },
        ref: Ref<ResetRef | undefined>,
    ) => {
        const [form] = Form.useForm();
        const [startTime, setStartTime] = useState<string | null>(null);
        const [thumbUrl, setThumbUrl] = useState<string | undefined>();
        const {
            uploadFile: uploadOriginFile,
            status: originFileLoading,
            // mimeType: mimeTypeOrigin,
        } = useUploadFile2Web3storage();

        useImperativeHandle(ref, () => ({
            onReset,
        }));

        const onReset = () => {
            setStartTime(null);
            setThumbUrl('');
            form.resetFields();
        };

        const disabledStartDate = (current: Dayjs): boolean => {
            // Can not select days before today and today
            return current && current < dayjs().startOf('minute');
        };

        const disabledEndDate = (current: Dayjs): boolean => {
            if (startTime) {
                return current && current <= dayjs(startTime).startOf('minute');
            }
            // Can not select days before today and today
            return current && current < dayjs().startOf('minute');
        };

        const customUploadThumb: (file: RcFile) => Promise<void> = async (file) => {
            try {
                setThumbUrl(undefined);

                const thumb = await uploadOriginFile(file as File);

                setThumbUrl(thumb);
            } catch (error) {
                message.error(`upload thumb file failed: ${error}`);
            }
        };

        const onSave = async () => {
            const keys = [
                'title',
                'description',
                'startTime',
                'endTime',
                'event_class',
                'speak_mode',
                'coverImg',
            ];
            const values = await form.validateFields(keys);

            const start = dayjs(values.startTime).format('YYYY-MM-DD HH:mm');
            const end = dayjs(values.endTime).format('YYYY-MM-DD HH:mm');
            const params: BaseInfo = {
                title: values.title,
                description: values.description,
                event_class: values.event_class,
                speak_mode: values.speak_mode,
                cover_image: thumbUrl,
                opening: {
                    start: dayjs(start).utc().valueOf(),
                    end: dayjs(end).utc().valueOf(),
                },
            };

            goNext(params);
        };

        return (
            <div
                className={cn(
                    'absolute left-0 top-0 flex h-full w-full flex-col justify-between',
                    show ? 'z-10 opacity-100' : 'z-1 opacity-0',
                )}
            >
                <Form layout="vertical" form={form} className="text-white">
                    <div className="flex justify-between gap-x-[30px]">
                        <div className="w-1/2">
                            <Form.Item
                                name="title"
                                label={
                                    <div className="font-inter-semibold text-[16px] leading-[18px] text-[#fff]">
                                        Title
                                    </div>
                                }
                                required={false}
                                rules={[
                                    {
                                        required: true,
                                        message: 'Please input event title!',
                                    },
                                ]}
                            >
                                <Input className="!h-[48px] w-full !rounded-[8px] !bg-[#283047] pl-[15px] font-inter-medium text-white placeholder:text-[#D0D0D0]" />
                            </Form.Item>
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
                                    className="font-inter-medium"
                                    disabledDate={disabledStartDate}
                                    onChange={(_time: Dayjs | null, timeString: string) =>
                                        setStartTime(timeString)
                                    }
                                />
                            </Form.Item>
                            <Form.Item
                                name="endTime"
                                label={
                                    <div className="font-inter-semibold text-[16px] leading-[18px] text-[#fff]">
                                        {`End date`}
                                    </div>
                                }
                                required={false}
                                rules={[
                                    {
                                        required: true,
                                        message: 'Please select end time!',
                                    },
                                ]}
                            >
                                <DateTimePicker
                                    className="font-inter-medium"
                                    disabledDate={disabledEndDate}
                                />
                            </Form.Item>
                            <Form.Item
                                name="speak_mode"
                                label={
                                    <div className="font-inter-semibold text-[16px] leading-[18px] text-[#fff]">
                                        Speak mode
                                    </div>
                                }
                                required={false}
                                rules={[
                                    {
                                        required: true,
                                        message: 'Please select speak mode!',
                                    },
                                ]}
                            >
                                <Select
                                    className="h-[48px] font-inter-medium"
                                    options={SPEAK_TYPE_OPTIONS}
                                />
                            </Form.Item>
                            <Form.Item
                                name="event_class"
                                label={
                                    <div className="font-inter-semibold text-[16px] leading-[18px] text-[#fff]">
                                        Event Type
                                    </div>
                                }
                                required={false}
                                rules={[
                                    {
                                        required: true,
                                        message: 'Please select event class!',
                                    },
                                ]}
                            >
                                <Select
                                    className="h-[48px] font-inter-medium"
                                    options={TYPE_OPTIONS}
                                />
                            </Form.Item>
                        </div>
                        <div className="w-1/2">
                            <Form.Item
                                name="description"
                                label={
                                    <div className="font-inter-semibold text-[16px] leading-[18px] text-[#fff]">
                                        Description
                                    </div>
                                }
                                required={false}
                                rules={[
                                    {
                                        required: true,
                                        message: 'Please enter Description!',
                                    },
                                ]}
                            >
                                <Textarea className="h-[204px] w-full !rounded-[8px] !bg-[#283047] font-inter-medium text-white placeholder:text-[#D0D0D0]" />
                            </Form.Item>

                            <Form.Item
                                name="coverImg"
                                label={
                                    <div className="font-inter-semibold text-[16px] leading-[18px] text-[#fff]">
                                        Image
                                    </div>
                                }
                                required={false}
                                rules={[
                                    {
                                        required: true,
                                        message: 'Please upload image!',
                                    },
                                ]}
                            >
                                <Upload
                                    directory={false}
                                    accept={imageFileTypes.toString()}
                                    maxCount={1}
                                    showUploadList={false}
                                    className="!flex h-[154px] !w-[240px] items-center justify-center rounded-[8px] bg-[#283047] text-white"
                                    action={customUploadThumb as any}
                                    listType="picture-card"
                                    beforeUpload={imageBeforeUpload}
                                >
                                    {/* data.url ||  */}
                                    {thumbUrl ? (
                                        <img
                                            src={thumbUrl}
                                            className="h-full rounded-[8px] object-cover"
                                        />
                                    ) : (
                                        <UploadButton loading={originFileLoading} />
                                    )}
                                </Upload>
                            </Form.Item>
                        </div>
                    </div>
                </Form>
                <div className="flex justify-end">
                    <YukuButton type={'CONFIRM'} onClick={() => onSave()}>
                        Next
                    </YukuButton>
                </div>
            </div>
        );
    },
);

export default EventSetup;
