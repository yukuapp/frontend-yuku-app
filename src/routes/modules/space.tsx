import React from 'react';
import { RouteObject } from 'react-router-dom';
import SpaceFrame from '@/views/space/spaceFrame';
import SpaceEditor from '@/views/world/components/space-editor';
import SpaceEventEditor from '@/views/world/components/space-event-editor';

const space: RouteObject[] = [
    {
        path: '/space/:id',
        element: <SpaceEditor />,
        children: [
            {
                path: '/space/:id/:owner',
                element: <SpaceEditor />,
            },
        ],
    },

    {
        path: '/space/event/:id',
        element: <SpaceEventEditor />,
        children: [
            {
                path: '/space/event/:id/:owner',
                element: <SpaceEventEditor />,
            },
        ],
    },

    {
        path: '/scene',
        element: <SpaceFrame />,
    },
];

export default space;
