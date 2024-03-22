import React from 'react';
import { RouteObject } from 'react-router-dom';
import MetaversePage from '@/views/metaverse';

const metaverse: RouteObject[] = [
    {
        path: '/3DSpace',
        element: <MetaversePage />,
    },
];

export default metaverse;
