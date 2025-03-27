import type { BaseComponentProps } from 'src/types';

import GrantGuard from 'src/app/guards/GrantGuard';
import LegalGuard from 'src/app/guards/LegalGuard';
import TenantGuard from 'src/app/guards/TenantGuard';
import UserGuard from 'src/app/guards/User';

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
