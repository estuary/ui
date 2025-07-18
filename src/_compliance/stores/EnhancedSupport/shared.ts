import type { EnhancedSupportState } from 'src/_compliance/stores/EnhancedSupport/types';
import type { PersistOptions } from 'zustand/middleware';

import { PersistedStoresKeys } from 'src/utils/localStorage-utils';

// Previous persist states for testing migrations
// v0 - TODO PROVIDE THIS
export const persistOptions: PersistOptions<EnhancedSupportState> = {
    name: PersistedStoresKeys.ENHANCED_SUPPORT,
    version: 0,
};
