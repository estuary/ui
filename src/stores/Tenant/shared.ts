import type { PersistOptions } from 'zustand/middleware';

import type { TenantState } from 'src/stores/Tenant/types';

// Previous persist states for testing migrations
// v0 - {"state":{"selectedTenant":"foo/"},"version":0}
export const persistOptions: PersistOptions<TenantState> = {
    name: 'estuary.tenants-store',
    version: 0,
};
