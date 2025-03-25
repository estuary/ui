import GrantGuard from 'app/guards/GrantGuard';
import 'react-reflex/styles.css';
import type { BaseComponentProps } from 'types';
import LegalGuard from './LegalGuard';
import TenantGuard from './TenantGuard';
import UserGuard from './User';

function AppGuards({ children }: BaseComponentProps) {
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
