import React from 'react';
import { RouteObject } from 'react-router-dom';
import World from '@/views/world';

const world: RouteObject[] = [
    {
        path: '/world',
        element: <World />,
        children: [
            {
                path: '/world/:tab',
                element: <World />,
                children: [
                    {
                        path: '/world/:tab/:create',
                        element: <World />,
                    },
                ],
            },
        ],
    },
];

export default world;
