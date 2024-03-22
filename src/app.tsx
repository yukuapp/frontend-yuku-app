import { useRoutes } from 'react-router-dom';
import PageLayout from '@/components/layout/page';
import { initial } from '@/hooks/app/initial';
import { watching } from '@/hooks/app/watch';
import '@/assets/css/app.less';
import routes from '@/routes';
import useGA from './hooks/app/ga';
import { useInterceptors } from './hooks/fetch-interceptors';

function App() {
    // Initialization
    initial();
    // Watch
    watching();

    // Google Analytics
    useGA();
    // Initialize routes
    const views = useRoutes(routes);
    // Intercept requests
    useInterceptors();
    return <PageLayout>{views}</PageLayout>;
}

export default App;
