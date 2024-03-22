import { cn } from '@/common/cn';
import { exponentNumber, thousandComma } from '@/common/data/numbers';
import { TokenInfo } from '@/types/nft';

// ================== Display Token Price ==================

function TokenPrice({
    value,
    className,
}: {
    value: {
        value: string | undefined; // Text without considering precision
        decimals?:
            | { type: 'unit'; value: number | string } // For example, 100000000
            | { type: 'exponent'; value: number | string }; // For example, 8
        symbol?: string; // Whether to display the unit
        token?: TokenInfo; // With exponent and symbol, prioritized over independent configuration
        scale?: number | ((n: number) => number); // Decimal places to round to, parameter is the actual value
        paddingEnd?: number;
        thousand?: {
            symbol?: 'K' | 'k'; // Whether to divide by 1000 and display
            comma?: boolean; // Whether to display comma every 3 digits
            commaFunc?: (n: string) => string; // Custom function to add commas to numbers
        };
        symbolClassName?: boolean;
    };
    className?: string;
}) {
    if (value.value === undefined)
        return <span className="text-[14px] leading-tight text-white">--</span>;
    const decimals = (() => {
        if (value.decimals?.type === 'unit') {
            if (!`${value.decimals.value}`.match(/^10+$/))
                throw new Error(`wrong decimals: ${value.decimals.value}`);
            return Math.log10(Number(value.decimals.value));
        }
        if (value.decimals?.type === 'exponent') return Number(value.decimals.value);
        if (value.token?.decimals) return Number(value.token.decimals);
        return 0; // Default: no change
    })();

    const symbol = (() => {
        if (value.symbol !== undefined) return value.symbol;
        if (value.token?.symbol) return value.token.symbol;
        return undefined; // Default: do not display unit
    })();

    let v = Number(exponentNumber(value.value, -decimals));

    let thousand_symbol: 'K' | 'k' | undefined = undefined;
    if (value.thousand !== undefined && value.thousand.symbol && v >= 1000) {
        thousand_symbol = value.thousand.symbol;
        v = v / 1000;
    }

    let show: string = `${v}`;
    if (value?.scale !== undefined) {
        if (typeof value.scale === 'number') show = v.toFixed(value.scale);
        if (typeof value.scale === 'function') show = v.toFixed(value.scale(v));
    }

    // Whether to pad zeros at the end
    if (value?.paddingEnd && value.paddingEnd > 0) {
        if (show.indexOf('.') === -1) show = show + '.';
        const index = show.indexOf('.');
        for (let i = show.length - 1 - index; i < value.paddingEnd; i++) show = show + '0';
    } else if (show.indexOf('.') >= 0) {
        while (show.endsWith('0')) show = show.substring(0, show.length - 1);
    }
    if (show.endsWith('.')) show = show.substring(0, show.length - 1);

    return (
        <span
            className={cn(
                ['font-inter-semibold text-[12px] leading-4 text-white md:text-[16px]'],
                className,
            )}
        >
            {value.thousand?.comma && value.thousand.commaFunc && value.thousand.commaFunc(show)}
            {value.thousand?.comma && !value.thousand.commaFunc && thousandComma(show)}
            {!value.thousand?.comma && show}
            {thousand_symbol ?? ''}
            {symbol && (
                <span
                    className={cn([
                        !value.symbolClassName && 'text-[12px] md:text-[14px]',
                        value.symbolClassName && 'ml-[6px]',
                    ])}
                >
                    {symbol}
                </span>
            )}
        </span>
    );
}

export default TokenPrice;
