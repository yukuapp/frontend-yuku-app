import { ConfigProvider, DatePicker, Input, theme } from 'antd';
import { CloseSquareFilled } from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import { cn } from '@/common/cn';

const commonComponentsStyle = {
    activeBorderColor: '#283047',
    hoverBorderColor: '#283047',
    errorActiveShadow: 'none !important',
    activeShadow: 'none !important',
};

const commonTokenStyle = {
    colorBgContainer: '#283047',
    colorBorder: '#283047',
};

export const AInputPassword = ({
    className,
    onChange,
}: {
    className?: string;
    onChange?: (e: string) => void;
}) => {
    const onPwdChange = (e) => onChange && onChange(e);

    return (
        <ConfigProvider
            theme={{
                algorithm: theme.darkAlgorithm,
                components: {
                    Input: commonComponentsStyle,
                },
                token: commonTokenStyle,
            }}
        >
            <Input.Password
                className={cn(
                    '!h-[48px] w-full !rounded-[8px] !border-none !bg-[#283047] pl-[15px] text-white placeholder:text-[#D0D0D0]',
                    className,
                )}
                onChange={onPwdChange}
                minLength={6}
            />
        </ConfigProvider>
    );
};

export const DateTimePicker = ({
    className,
    disabledDate,
    onChange,
    minuteStep = 30,
}: {
    className?: string;
    disabledDate: (date: Dayjs) => boolean;
    onChange?: (_: Dayjs | null, timeString: string) => void;
    minuteStep?: boolean | number;
}) => {
    const timeConfig: any = {
        defaultValue: dayjs('00:00:00', 'HH:mm:ss'),
    };

    if (minuteStep) {
        timeConfig.minuteStep = minuteStep;
    }

    return (
        <ConfigProvider
            theme={{
                algorithm: theme.darkAlgorithm,
                components: {
                    DatePicker: {
                        ...commonComponentsStyle,
                        cellActiveWithRangeBg: '#000',
                    },
                },
                token: commonTokenStyle,
            }}
        >
            <DatePicker
                className={cn(
                    '!h-[48px] w-full !rounded-[8px] !border-none !bg-[#283047] !text-white',
                    className,
                )}
                format="YYYY-MM-DD HH:mm"
                disabledDate={disabledDate}
                placeholder=""
                showTime={timeConfig}
                allowClear={{
                    clearIcon: <CloseSquareFilled />,
                }}
                showNow={false}
                onChange={onChange}
            />
        </ConfigProvider>
    );
};
