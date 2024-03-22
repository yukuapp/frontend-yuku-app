import { MouseEventHandler } from 'react';
import { cn } from '@/common/cn';

function YukuIcon({
    name,
    size,
    color,
    className,
    onClick,
    children,
}: { size?: number; color?: string; className?: string; onClick?: MouseEventHandler } & (
    | {
          name: string;
          children?: undefined;
      }
    | {
          name?: undefined;
          children: any;
      }
)) {
    const style: {
        fontSize?: string;
        lineHeight?: string;
        width?: string;
        height?: string;
        color?: string;
    } = {};

    if (size !== undefined) {
        style.fontSize = `${size}px`;
        style.lineHeight = `${size}px`;
        style.width = `${size}px`;
        style.height = `${size}px`;
    }

    if (color) style.color = color;

    return (
        <span
            className={cn(
                'yuku-icon flex items-center justify-center',
                name ? `icon-${name}` : '',
                className,
            )}
            style={style}
            onClick={onClick}
        >
            {children}
        </span>
    );
}

export default YukuIcon;
