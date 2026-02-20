import type { DetailsUsageState } from 'src/stores/DetailsUsage/types';

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

import produce from 'immer';

import { DataGrains } from 'src/components/graphs/types';
import { persistOptions } from 'src/stores/DetailsUsage/shared';
import { devtoolsOptions } from 'src/utils/store-utils';

export const useDetailsUsageStore = create<DetailsUsageState>()(
    persist(
        devtools((set) => {
            return {
                range: {
                    amount: 6,
                    grain: DataGrains.hourly,
                },
                statType: 'bytes',
                setRange: (newVal) => {
                    set(
                        produce((state) => {
                            state.range = newVal;
                        }),
                        false,
                        'setRange'
                    );
                },
                setStatType: (newVal) => {
                    set(
                        produce((state) => {
                            state.statType = newVal;
                        }),
                        false,
                        'setStatType'
                    );
                },
            };
        }, devtoolsOptions(persistOptions.name)),
        persistOptions
    )
);
useDetailsUsageStore.setState({
    range: {
        amount: 6,
        grain: DataGrains.hourly,
    },
    statType: 'bytes',
});
