import React from 'react';
import { RouteObject } from 'react-router-dom';
import Token from '@/views/token';

const token: RouteObject[] = [
    {
        path: '/token',
        element: <Token />,
    },
];

export default token;
