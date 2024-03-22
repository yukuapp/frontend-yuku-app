import React from 'react';
import { RouteObject } from 'react-router-dom';
import MarketplaceMainPage from '@/views/marketplace';

const marketplace: RouteObject[] = [
    {
        path: '/marketplace',
        element: <MarketplaceMainPage />,
        children: [
            {
                path: '/marketplace/:first',
                element: <MarketplaceMainPage />,
                children: [
                    {
                        path: '/marketplace/:first/:second',
                        element: <MarketplaceMainPage />,
                    },
                ],
            },
        ],
    },
];

export default marketplace;
