import GrantGuard from 'src/app/guards/GrantGuard';

import 'react-reflex/styles.css';

import type { BaseComponentProps } from 'src/types';

import AnalyticsGuard from 'src/app/guards/AnalyticsGuard';
import LegalGuard from 'src/app/guards/LegalGuard';
import TenantGuard from 'src/app/guards/TenantGuard';
import UserGuard from 'src/app/guards/User';

function AppGuards({ children }: BaseComponentProps) {
    return (
        <UserGuard>
            <LegalGuard>
                <AnalyticsGuard>
                    <GrantGuard>
                        <TenantGuard>{children}</TenantGuard>
                    </GrantGuard>
                </AnalyticsGuard>
            </LegalGuard>
        </UserGuard>
    );
}

export default AppGuards;
