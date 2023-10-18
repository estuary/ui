import GrantGuard from 'app/guards/GrantGuard';
import FullPageSpinner from 'components/fullPage/Spinner';
import useBrowserTitle from 'hooks/useBrowserTitle';
import { Suspense } from 'react';
import 'react-reflex/styles.css';
import { BaseComponentProps } from 'types';
import LegalGuard from './LegalGuard';
import TenantGuard from './TenantGuard';
import UserGuard from './User';

function AppGuards({ children }: BaseComponentProps) {
    useBrowserTitle('routeTitle.loginLoading');

    return (
        <Suspense fallback={<FullPageSpinner />}>
            <UserGuard>
                <LegalGuard>
                    <GrantGuard>
                        <TenantGuard>{children}</TenantGuard>
                    </GrantGuard>
                </LegalGuard>
            </UserGuard>
        </Suspense>
    );
}

export default AppGuards;
