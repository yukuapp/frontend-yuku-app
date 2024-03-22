import { ReactLenis } from '@studio-freight/react-lenis';
import Sidebar from './components/sidebar';
import './index.less';

function AIAvatarChats() {
    return (
        <ReactLenis root>
            <div className="mt-[44px] flex md:mt-[75px]">
                <Sidebar />
                <div className="flex flex-1">chats</div>
            </div>
        </ReactLenis>
    );
}

export default AIAvatarChats;