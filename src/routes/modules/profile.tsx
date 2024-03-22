import React from 'react';
import { RouteObject } from 'react-router-dom';
import Profile from '@/views/profile';
import ProfileSettingsPage from '@/views/profile/settings';

// const Profile = React.lazy(() => import('@/views2/profile'));
// const ProfileSettings = React.lazy(() => import('@/views2/profile/settings'));

const profile: RouteObject[] = [
    {
        path: '/profile',
        element: <Profile />,
        children: [
            {
                path: '/profile/:principal_or_account',
                element: <Profile />,
            },
            {
                path: '/profile/:principal_or_account/:tab',
                element: <Profile />,
            },
        ],
    },
    {
        path: '/profile/settings',
        element: <ProfileSettingsPage />,
    },
];

export default profile;
