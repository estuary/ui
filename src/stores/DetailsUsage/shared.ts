import { DataGrains } from 'components/graphs/types';
import { convertRangeToSettings } from 'services/luxon';
import { PersistOptions } from 'zustand/middleware';
import { DetailsUsageState } from './types';

// Previous persist states for testing migrations
// v0 - {"state":{"range":48,"statType":"docs","foo":"sup"},"version":0}
export const persistOptions: PersistOptions<DetailsUsageState> = {
    name: 'estuary.details-usage-store',
    version: 1,
    migrate: (persistedState: any, persistedVersion) => {
        if (persistedVersion === 0 && persistedState) {
            const amount = persistedState.range ?? 6;

            // Version 0 was only storing the range as 6, 12, 24, 48
            persistedState.range = convertRangeToSettings({
                amount,
                grain: DataGrains.hourly,
            });

            if (persistedState.foo) {
                delete persistedState.foo;
            }
        }

        return persistedState;
    },
};
