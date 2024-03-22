import { ReactLenis } from '@studio-freight/react-lenis';
import Sidebar from './components/sidebar';
import './index.less';

function AIAvatarCreate() {
    return (
        <ReactLenis root>
            <div className="mt-[44px] flex md:mt-[75px]">
                <Sidebar />
                <div className="flex flex-1">create</div>
            </div>
        </ReactLenis>
    );
}

export default AIAvatarCreate;
