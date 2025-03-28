import GrantGuard from 'src/app/guards/GrantGuard';

import 'react-reflex/styles.css';

import type { BaseComponentProps } from 'src/types';
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
