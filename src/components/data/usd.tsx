import { useTokenRate } from '@/hooks/interval/token_rate';
import { cn } from '@/common/cn';
import { exponentNumber } from '@/common/data/numbers';
import { TokenInfo } from '@/types/nft';

function Usd({
    value,
    className,
}: {
    value: {
        value: string | undefined;
        decimals?:
            | { type: 'unit'; value: number | string } // For example, 100000000
            | { type: 'exponent'; value: number | string }; // For example, 8
        symbol?: string; // Whether to display the unit
        token?: TokenInfo; // With exponent and symbol, prioritizing independent configuration
        scale?: number | ((n: number) => number); // Decimal places to round, parameter is the actual value
        paddingEnd?: number;
    };
    className?: string;
}) {
    const { icp_usd, ogy_usd } = useTokenRate();

    if (value.value === undefined) return <span>--</span>;

    const decimals = (() => {
        if (value.decimals?.type === 'unit') {
            if (!`${value.decimals.value}`.match(/^10+$/))
                throw new Error(`wrong decimals: ${value.decimals.value}`);
            return Math.log10(Number(value.decimals.value));
        }
        if (value.decimals?.type === 'exponent') return Number(value.decimals.value);
        if (value.token?.decimals) return Number(value.token.decimals);
        return 0; // Default, no change
    })();

    const symbol = (() => {
        if (value.symbol) return value.symbol;
        if (value.token?.symbol) return value.token.symbol;
        return undefined; // Default, no unit displayed
    })();

    const v = Number(exponentNumber(value.value, -decimals));

    let vv: number | undefined = undefined;
    switch (symbol) {
        case 'ICP':
            if (icp_usd !== undefined) vv = v * Number(icp_usd);
            break;
        case 'OGY':
            if (ogy_usd !== undefined) vv = v * Number(ogy_usd);
            break;
    }

    if (vv === undefined) return <span className={cn(['usd', className])}>--</span>;

    let show: string = `${vv}`;

    if (value?.scale !== undefined) {
        if (typeof value.scale === 'number') show = vv.toFixed(value.scale);
        if (typeof value.scale === 'function') show = vv.toFixed(value.scale(vv));
    }

    // Whether to pad 0 at the end
    if (value?.paddingEnd && value.paddingEnd > 0) {
        if (show.indexOf('.') === -1) show = show + '.';
        const index = show.indexOf('.');
        for (let i = show.length - 1 - index; i < value.paddingEnd; i++) show = show + '0';
    } else if (show.indexOf('.') >= 0) {
        while (show.endsWith('0')) show = show.substring(0, show.length - 1);
    }
    if (show.endsWith('.')) show = show.substring(0, show.length - 1);

    return <span className={cn(['text-xs text-white/60', className])}>(${show})</span>;
}

export default Usd;
