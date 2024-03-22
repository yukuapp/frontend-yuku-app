import React from 'react';
import { RouteObject } from 'react-router-dom';
import EventDetail from '@/views/event';

const event: RouteObject[] = [
    {
        path: '/info/event/:id',
        element: <EventDetail />,
    },
];
export default event;
