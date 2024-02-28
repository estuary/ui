import GrantGuard from 'app/guards/GrantGuard';
import useBrowserTitle from 'hooks/useBrowserTitle';
import 'react-reflex/styles.css';
import { BaseComponentProps } from 'types';
import LegalGuard from './LegalGuard';
import MarketplaceGuard from './MarketplaceGuard';
import TenantGuard from './TenantGuard';
import UserGuard from './User';

function AppGuards({ children }: BaseComponentProps) {
    useBrowserTitle('routeTitle.loginLoading');

    return (
        <UserGuard>
            <LegalGuard>
                <GrantGuard>
                    <TenantGuard>
                        <MarketplaceGuard>{children}</MarketplaceGuard>
                    </TenantGuard>
                </GrantGuard>
            </LegalGuard>
        </UserGuard>
    );
}

export default AppGuards;
