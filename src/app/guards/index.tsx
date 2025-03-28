import GrantGuard from 'src/app/guards/GrantGuard';

import 'react-reflex/styles.css';

import LegalGuard from './LegalGuard';
import TenantGuard from './TenantGuard';
import UserGuard from './User';

import { BaseComponentProps } from 'src/types';

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
