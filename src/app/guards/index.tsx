import useBrowserTitle from 'hooks/useBrowserTitle';
import 'react-reflex/styles.css';
import { BaseComponentProps } from 'types';
import LegalGuard from './LegalGuard';
import TenantGuard from './TenantGuard';
import UserGuard from './User';

function AppGuards({ children }: BaseComponentProps) {
    console.log('Guards:Wrapper');

    useBrowserTitle('browserTitle.loginLoading');

    return (
        <UserGuard>
            <LegalGuard>
                <TenantGuard>{children}</TenantGuard>
            </LegalGuard>
        </UserGuard>
    );
}

export default AppGuards;
