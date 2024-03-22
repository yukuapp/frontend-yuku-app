import { useState } from 'react';
import { Select } from 'antd';
import { cn } from '@/common/cn';
import './index.less';

const { Option } = Select;

export type FilterSelectOption<T> = {
    value: T;
    label: string;
    disabled?: boolean;
};

const TypeSelect = <T extends string>({
    defaultValue,
    options,
    onChange,
    className,
}: {
    defaultValue?: T;
    options: FilterSelectOption<T>[];
    onChange?: (option: T) => void;
    className?: string;
}) => {
    const onSelectChange = (option: T) => {
        console.log('option.', option, onChange);
        onChange && onChange(option);
    };

    const [dropDownVisible, setDropDownVisible] = useState<boolean>(false);
    return (
        <Select
            className={cn(
                '!h-[48px] w-full overflow-hidden !rounded-[8px] !border-none bg-[#283047]',
                className,
            )}
            defaultValue={defaultValue}
            placement="bottomRight"
            onChange={onSelectChange}
            bordered={false}
            virtual={true}
            popupClassName="pop-up"
            suffixIcon={
                <img
                    src="/img/market/select-arrow.svg"
                    className={cn('transition-all duration-300', dropDownVisible && 'rotate-180 ')}
                />
            }
            onDropdownVisibleChange={(e) => {
                setDropDownVisible(e);
            }}
        >
            {options.map((option) => (
                <Option
                    key={option.value}
                    className="flex h-[40px] w-full cursor-pointer items-center justify-center rounded-[8px] bg-[#283047] px-[38px] py-[15px] font-inter-medium"
                    value={option.value}
                    label={option.label}
                >
                    <div className="mr-[15px] font-inter-medium  text-[12px] font-medium text-white/80 md:text-[14px]">
                        {option.label}
                    </div>
                </Option>
            ))}
        </Select>
    );
};

export default TypeSelect;
