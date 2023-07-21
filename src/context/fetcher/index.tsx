import { BaseComponentProps } from 'types';

import { GrantDetailsContextProvider } from './GrantDetails';
import { TenantContextProvider } from './Tenant';

// This context is to house any "preloading" of stuff we need to do
//  when the app is being rendered for an Authenticated user.
//  Anything in here should NOT CHANGE often... if ever.
function PreFetchDataProvider({ children }: BaseComponentProps) {
    return (
        <GrantDetailsContextProvider>
            <TenantContextProvider>{children}</TenantContextProvider>
        </GrantDetailsContextProvider>
    );
}

export default PreFetchDataProvider;
