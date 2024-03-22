import { NavLink } from 'react-router-dom';

function Navigator() {
    return (
        <div className="hack-navigator">
            <h1>Navigator</h1>
            <ol style={{ listStyle: 'auto' }}>
                <li>
                    <NavLink to="/">
                        Home(/){' '}
                        {`Not Started -> Feature Development -> UI Development -> Feature Testing -> UI Acceptance -> Completed`}
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/connect">
                        Login(/connect){' '}
                        {`UI Development -> Feature Testing -> UI Acceptance -> Completed`}
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/profile">
                        Profile(/profile){' '}
                        {`Feature Development -> UI Development -> Feature Testing -> UI Acceptance -> Completed`}
                    </NavLink>
                </li>
                <li>
                    <a
                        href="/profile/nka23-rvoky-suzg7-qvnev-ldniw-vhaft-idot4-zenzk-oyryp-7hqpc-iqe"
                        target="_blank"
                    >
                        Open a new page to see someone else's
                        NFT(/profile/nka23-rvoky-suzg7-qvnev-ldniw-vhaft-idot4-zenzk-oyryp-7hqpc-iqe)
                    </a>
                </li>
                <li>
                    <a
                        href="/profile/kvxmz-2wzgu-k5bco-b6xeo-rwxof-jt65n-c5i7j-b6vac-zemky-tutht-7qe"
                        target="_blank"
                    >
                        Open a new page to see someone else's NFT with
                        gold(/profile/kvxmz-2wzgu-k5bco-b6xeo-rwxof-jt65n-c5i7j-b6vac-zemky-tutht-7qe)
                    </a>
                </li>
                <li>
                    <a
                        href="/profile/hxmvo-tgd7l-46wi2-nz4at-eg7fc-o2i2t-xrjql-dwdr6-2van4-6ot3s-gqe/created"
                        target="_blank"
                    >
                        Open a new page to see someone else's created
                        NFT(/profile/hxmvo-tgd7l-46wi2-nz4at-eg7fc-o2i2t-xrjql-dwdr6-2van4-6ot3s-gqe/created)
                    </a>
                </li>
                <li>
                    <a
                        href="/profile/nka23-rvoky-suzg7-qvnev-ldniw-vhaft-idot4-zenzk-oyryp-7hqpc-iqe/favorite"
                        target="_blank"
                    >
                        Open a new page to see someone else's favorite
                        NFT(/profile/nka23-rvoky-suzg7-qvnev-ldniw-vhaft-idot4-zenzk-oyryp-7hqpc-iqe/favorite)
                    </a>
                </li>
                <li>
                    <a
                        href="/profile/nka23-rvoky-suzg7-qvnev-ldniw-vhaft-idot4-zenzk-oyryp-7hqpc-iqe/activity"
                        target="_blank"
                    >
                        Open a new page to see someone else's activity
                        records(/profile/nka23-rvoky-suzg7-qvnev-ldniw-vhaft-idot4-zenzk-oyryp-7hqpc-iqe/activity)
                    </a>
                </li>
                <li>
                    <a
                        href="/profile/gqf6k-vkxbo-4qpjk-ct3r3-hhzoh-byfbi-h37pr-zwccb-xtx6r-zuz2u-tae/auction"
                        target="_blank"
                    >
                        Open a new page to see someone else's auction
                        records(/profile/gqf6k-vkxbo-4qpjk-ct3r3-hhzoh-byfbi-h37pr-zwccb-xtx6r-zuz2u-tae/auction)
                    </a>
                </li>
            </ol>
        </div>
    );
}

export default Navigator;
