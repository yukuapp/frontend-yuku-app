import { useConnect } from '@connect2ic/react';
import { writeLastConnectType } from '@/utils/app/storage';
import { useIdentityStore } from '@/stores/identity';

function Information() {
    const connectedIdentity = useIdentityStore((s) => s.connectedIdentity);
    const setConnectedIdentity = useIdentityStore((s) => s.setConnectedIdentity);
    const { disconnect } = useConnect({
        onDisconnect: () => setConnectedIdentity(undefined),
    });

    const icpBalance = useIdentityStore((s) => s.icpBalance);
    const ogyBalance = useIdentityStore((s) => s.ogyBalance);
    const creditPoints = useIdentityStore((s) => s.creditPoints);

    return (
        <div className="hack-information">
            <h1>Information</h1>
            <div className="item connected-identity">
                <div className="label">Connected Identity</div>
                <div className="value">
                    {connectedIdentity ? (
                        <>
                            <span>{`${connectedIdentity.principal} (${connectedIdentity.connectType})`}</span>
                            <button
                                className="logout"
                                onClick={() => {
                                    writeLastConnectType('');
                                    disconnect();
                                }}
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        <span>Not logged in</span>
                    )}
                </div>
            </div>
            <div className="item balance-icp">
                <div className="label">ICP Balance</div>
                <div className="value">
                    {icpBalance ? (
                        <span>{`${Number(icpBalance.e8s) / 1e8} ICP`}</span>
                    ) : (
                        <span>--</span>
                    )}
                </div>
            </div>
            <div className="item balance-ogy">
                <div className="label">OGY Balance</div>
                <div className="value">
                    {ogyBalance ? (
                        <span>{`${Number(ogyBalance.e8s) / 1e8} OGY`}</span>
                    ) : (
                        <span>--</span>
                    )}
                </div>
            </div>
            <div className="item balance-credit-point">
                <div className="label">Credit Points</div>
                <div className="value">
                    {creditPoints ? (
                        <span>{`${Number(creditPoints.e8s) / 1e8}`}</span>
                    ) : (
                        <span>--</span>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Information;
