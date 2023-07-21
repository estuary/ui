import 'react-reflex/styles.css';

import { BaseComponentProps } from 'types';

import GrantGuard from 'app/guards/GrantGaurd';

import useBrowserTitle from 'hooks/useBrowserTitle';

import LegalGuard from './LegalGuard';
import TenantGuard from './TenantGuard';
import UserGuard from './User';

function AppGuards({ children }: BaseComponentProps) {
    useBrowserTitle('routeTitle.loginLoading');

    return (
        <UserGuard>
            <LegalGuard>
                <GrantGuard>
                    <TenantGuard>{children}</TenantGuard>
                </GrantGuard>
            </LegalGuard>
        </UserGuard>
    );
}

export default AppGuards;
