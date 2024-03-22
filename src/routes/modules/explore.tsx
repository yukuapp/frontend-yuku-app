import React from 'react';
import { Navigate, RouteObject } from 'react-router-dom';
import ExploreArtCreatingMain from '@/views/explore/art';
import ExploreArtApply from '@/views/explore/art/apply';
import ExploreArtCreating from '@/views/explore/art/creating';
import ArtistCreator from '@/views/explore/art/creator';
import ExploreOatClaimPage from '@/views/explore/oat/claim';
import ExploreOatProjectPage from '@/views/explore/oat/project';
import MarketNftDetailPage from '@/views/market/nft';

const explore: RouteObject[] = [
    {
        path: '/oat/:project',
        element: <ExploreOatProjectPage />,
    },
    {
        path: '/oat/:project/claim/:event',
        element: <ExploreOatClaimPage />,
    },
    {
        path: '/artist/creator',
        element: <ArtistCreator />,
    },
    {
        path: '/art/create',
        element: <ExploreArtCreatingMain />,
    },
    {
        path: '/art/create-nft',
        element: <ExploreArtCreating />,
    },
    {
        path: '/art/apply',
        element: <ExploreArtApply />,
    },
    {
        path: '/art/:collection/:token_identifier_or_index',
        element: <MarketNftDetailPage />,
    },
    {
        path: '/oat',
        element: <Navigate to="/explore/oat" />,
    },
    {
        path: '/art',
        element: <Navigate to="/explore/art" />,
    },
];

export default explore;
