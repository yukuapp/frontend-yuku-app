import { RouteObject } from 'react-router-dom';
import AIAvatar from '@/views/aiavatar';
import AIAvatarIframe from '@/views/aiavatar/aiAvatarIframe';
import AIAvatarChats from '@/views/aiavatar/chats';
import AIAvatarCreate from '@/views/aiavatar/create';
import AIAvatarHome from '@/views/aiavatar/home';
import AIAvatarUser from '@/views/aiavatar/user';

const aiavatar: RouteObject[] = [
    {
        path: '/AIAvatar',
        element: <AIAvatar />,
    },
    {
        path: '/AIAvatar/:avatarId/chat',
        element: <AIAvatarIframe />,
    },
    {
        path: '/AIAvatar/home',
        element: <AIAvatarHome />,
    },
    {
        path: '/AIAvatar/create',
        element: <AIAvatarCreate />,
    },
    {
        path: '/AIAvatar/chats',
        element: <AIAvatarChats />,
    },
    {
        path: '/AIAvatar/user',
        element: <AIAvatarUser />,
    },
];

export default aiavatar;
