import { DataGrains } from 'components/graphs/types';
import produce from 'immer';
import { convertRangeToSettings } from 'services/luxon';
import { devtoolsOptions } from 'utils/store-utils';
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { persistOptions } from './shared';
import { DetailsUsageState } from './types';

const useDetailsUsageStore = create<DetailsUsageState>()(
    persist(
        devtools((set) => {
            return {
                range: convertRangeToSettings({
                    amount: 6,
                    grain: DataGrains.hourly,
                }),
                statType: 'bytes',
                setRange: (newVal) => {
                    set(
                        produce((state) => {
                            state.range = convertRangeToSettings(newVal);
                        }),
                        false,
                        'setRangeSettings'
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

export default useDetailsUsageStore;
