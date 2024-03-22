import { useState } from 'react';
import { LoadingOutlined } from '@ant-design/icons';
import { cn } from '@/common/cn';

const PdfViewer = () => {
    const [iframeLoading, setIframeLoading] = useState<boolean>(true);

    return (
        <div className="fixed left-0 top-0 z-[110] h-screen w-screen bg-[#101522]">
            <div className={cn('!absolute bottom-0 left-0 right-0 top-0 z-10 flex h-full w-full')}>
                {iframeLoading && (
                    <LoadingOutlined
                        className="!mx-auto text-[50px]"
                        style={{ color: '#7953ff' }}
                    />
                )}
            </div>
            <iframe
                src={
                    'https://bafybeigcrbkbb2lr3fsmiett2vg472afhz2cz63jtddnytamriczax27na.ipfs.w3s.link/YukuWhitepaper.pdf'
                }
                style={{
                    border: 'none',
                    overflow: 'hidden',
                    display: 'flex',
                }}
                className="!absolute z-20 h-full w-full"
                onLoad={() => setIframeLoading(false)}
            ></iframe>
        </div>
    );
};

export default PdfViewer;
