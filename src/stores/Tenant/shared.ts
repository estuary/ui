import type { TenantState } from 'src/stores/Tenant/types';
import type { PersistOptions } from 'zustand/middleware';

import { PersistedStoresKeys } from 'src/utils/localStorage-utils';

// Previous persist states for testing migrations
// v0 - {"state":{"selectedTenant":"foo/"},"version":0}
export const persistOptions: PersistOptions<TenantState> = {
    name: PersistedStoresKeys.TENANTS,
    version: 0,
};
