import { RouteObject } from 'react-router-dom';
import PdfViewer from '@/views/pdfViewer';

const whitepaper: RouteObject[] = [
    {
        path: '/whitepaper',
        element: <PdfViewer />,
    },
];

export default whitepaper;
