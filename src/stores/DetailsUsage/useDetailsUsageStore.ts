import { DataGrains } from 'src/components/graphs/types';
import produce from 'immer';
import { devtoolsOptions } from 'src/utils/store-utils';
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { persistOptions } from './shared';
import { DetailsUsageState } from './types';

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
