import { Navigate, RouteObject } from 'react-router-dom';
import ConnectPage from '@/views/connect';
import HackPage from '@/views/hack';
import HomePage from '@/views/home';
import HomeSNSPage from '@/views/home/index_sns';
import { isDevMode } from '@/utils/app/env';
import aiavatar from './modules/aiavatar';
import event_info from './modules/event-info';
import explore from './modules/explore';
// import external from './modules/external';
import launchpad from './modules/launchpad';
import market from './modules/market';
import marketplace from './modules/marketplace';
import metaverse from './modules/metaverse';
import profile from './modules/profile';
import space from './modules/space';
import token from './modules/token';
import whitelist from './modules/whitelist';
import whitepaper from './modules/whitepaper';
import world from './modules/world';

const isDev = isDevMode();

const hacks: RouteObject[] = isDev
    ? [
          {
              path: '/hack',
              element: <HackPage />,
          },
      ]
    : [];

const routes: RouteObject[] = [
    {
        path: '/',
        element: <HomeSNSPage />,
    },
    {
        path: '/old',
        element: <HomePage />,
    },
    {
        path: '/connect',
        element: <ConnectPage />,
    },
    ...profile,
    ...explore,
    ...marketplace,
    ...launchpad,
    ...market,
    ...whitelist,
    ...hacks,
    ...space,
    ...metaverse,
    ...world,
    ...token,
    ...event_info,
    ...whitepaper,
    ...aiavatar,
    // ...external,
    {
        path: '/*',
        element: <Navigate to="/" />,
    },
];

export default routes;
