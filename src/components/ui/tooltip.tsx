import { Tooltip as AntdTooltip, TooltipProps } from 'antd';
import './index.less';

export default function Tooltip({ children, ...props }: TooltipProps) {
    return (
        <AntdTooltip
            {...props}
            color="white"
            overlayClassName="antd-tooltip"
            overlayInnerStyle={{
                color: 'white',
                width: 'fit-content',
                fontFamily: 'Inter-Semibold',
                ...props.overlayInnerStyle,
            }}
        >
            {children}{' '}
        </AntdTooltip>
    );
}
