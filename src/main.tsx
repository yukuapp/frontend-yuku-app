import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Connect2ICProvider } from '@connect2ic/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { initBackendType } from '@/utils/app/backend';
import { createClient } from '@/utils/connect/connect';
import '@/assets/css/main.css';
import '@/assets/yuku-icon/iconfont.css';
import App from './app';

// Initialize backend settings
initBackendType();

const connectClient = createClient();

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <BrowserRouter>
            <Connect2ICProvider client={connectClient}>
                <QueryClientProvider client={queryClient}>
                    <App />
                    <ReactQueryDevtools />
                </QueryClientProvider>
            </Connect2ICProvider>
        </BrowserRouter>
    </React.StrictMode>,
);
