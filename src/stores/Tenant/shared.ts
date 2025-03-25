import type { TenantState } from 'stores/Tenant/types';
import type { PersistOptions } from 'zustand/middleware';

// Previous persist states for testing migrations
// v0 - {"state":{"selectedTenant":"foo/"},"version":0}
export const persistOptions: PersistOptions<TenantState> = {
    name: 'estuary.tenants-store',
    version: 0,
};
