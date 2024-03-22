import { cn } from '@/common/cn';
import { thousandComma } from '@/common/data/numbers';

function ShowNumber({
    value,
    className,
}: {
    value: {
        value: string | undefined;
        scale?: number | ((n: number) => number);
        paddingEnd?: number;
        thousand?: {
            symbol?: ('K' | 'k' | 'M' | 'm')[];
            comma?: boolean;
        };
    };
    className?: string;
}) {
    if (value.value === undefined)
        return <span className={cn(['text-[12px] leading-4'], className)}>--</span>;

    let v = Number(value.value);

    let thousand_symbol: 'K' | 'k' | 'M' | 'm' | undefined = undefined;
    if (value.thousand !== undefined && value.thousand.symbol?.length) {
        if (value.thousand.symbol.includes('K') && v >= 1e3) {
            thousand_symbol = 'K';
            v = v / 1e3;
        } else if (value.thousand.symbol.includes('k') && v >= 1e3) {
            thousand_symbol = 'k';
            v = v / 1e3;
        }
        if (thousand_symbol) {
            if (value.thousand.symbol.includes('M') && v >= 1e3) {
                thousand_symbol = 'M';
                v = v / 1e3;
            } else if (value.thousand.symbol.includes('m') && v >= 1e3) {
                thousand_symbol = 'm';
                v = v / 1e3;
            }
        } else {
            if (value.thousand.symbol.includes('M') && v >= 1e6) {
                thousand_symbol = 'M';
                v = v / 1e6;
            } else if (value.thousand.symbol.includes('m') && v >= 1e6) {
                thousand_symbol = 'm';
                v = v / 1e6;
            }
        }
    }

    let show: string = `${v}`;
    if (value?.scale !== undefined) {
        if (typeof value.scale === 'number') show = v.toFixed(value.scale);
        if (typeof value.scale === 'function') show = v.toFixed(value.scale(v));
    }

    if (value?.paddingEnd && value.paddingEnd > 0) {
        if (show.indexOf('.') === -1) show = show + '.';
        const index = show.indexOf('.');
        for (let i = show.length - 1 - index; i < value.paddingEnd; i++) show = show + '0';
    } else if (show.indexOf('.') >= 0) {
        while (show.endsWith('0')) show = show.substring(0, show.length - 1);
    }
    if (show.endsWith('.')) show = show.substring(0, show.length - 1);

    return (
        <span className={cn(['text-[12px] leading-4'], className)}>
            {value.thousand?.comma ? thousandComma(show) : show}
            {thousand_symbol ?? ''}
        </span>
    );
}

export default ShowNumber;
