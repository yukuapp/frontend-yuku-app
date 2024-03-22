import { Link, useNavigate } from 'react-router-dom';

export const preventLink = (callback: (e: any) => void) => (e: any) => {
    callback(e);
    e.preventDefault();
    e.stopPropagation();
};

export const justPreventLink = (e: any) => {
    e.preventDefault();
    e.stopPropagation();
};

export const AssureLink = ({
    to,
    className,
    children,
}: {
    to?: string;
    className?: string;
    children: any;
}) => {
    if (!to) return <div className={className}>{children}</div>;
    return (
        <Link to={to} className={className}>
            {children}
        </Link>
    );
};

export const AssureLinkByNavigate = ({
    to,
    className,
    children,
}: {
    to?: string;
    className?: string;
    children: any;
}) => {
    const navigate = useNavigate();
    if (!to) return <div className={className}>{children}</div>;
    const goto = () => navigate(to);
    return (
        <div onClick={goto} className={className}>
            {children}
        </div>
    );
};
