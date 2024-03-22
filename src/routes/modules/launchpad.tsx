import React from 'react';
import { RouteObject } from 'react-router-dom';
import LaunchpadCollectionPage from '@/views/launchpad/collection';
import LaunchpadListPage from '@/views/launchpad/list';

// const LaunchpadCollection = React.lazy(() => import('@/views2/launchpad/collection'));
// const LaunchpadMain = React.lazy(() => import('@/views2/launchpad/main'));

const launchpad: RouteObject[] = [
    {
        path: '/launchpad',
        element: <LaunchpadListPage show={true} />,
    },
    {
        path: '/launchpad/:collection',
        element: <LaunchpadCollectionPage />,
    },
];

export default launchpad;
