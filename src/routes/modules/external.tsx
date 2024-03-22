import { RouteObject } from 'react-router-dom';
import ExternalActivity from '@/views/external/activity';

const world: RouteObject[] = [
    {
        path: '/external/activity',
        element: <ExternalActivity />,
    },
];

export default world;
