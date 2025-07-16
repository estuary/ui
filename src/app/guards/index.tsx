import GrantGuard from 'src/app/guards/GrantGuard';

import 'react-reflex/styles.css';

import type { BaseComponentProps } from 'src/types';

import ConsentGuard from 'src/app/guards/ConsentGuard';
import LegalGuard from 'src/app/guards/LegalGuard';
import TenantGuard from 'src/app/guards/TenantGuard';
import UserGuard from 'src/app/guards/User';

function AppGuards({ children }: BaseComponentProps) {
    return (
        <UserGuard>
            <LegalGuard>
                <ConsentGuard>
                    <GrantGuard>
                        <TenantGuard>{children}</TenantGuard>
                    </GrantGuard>
                </ConsentGuard>
            </LegalGuard>
        </UserGuard>
    );
}

export default AppGuards;
