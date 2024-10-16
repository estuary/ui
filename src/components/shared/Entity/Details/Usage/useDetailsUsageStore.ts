import {
    DataByHourRange,
    DataByHourStatType,
    DataGrains,
} from 'components/graphs/types';
import produce from 'immer';
import { convertRangeToSettings, RangeSettings } from 'services/luxon';
import { devtoolsOptions } from 'utils/store-utils';
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface DetailsUsageState {
    range: RangeSettings;
    setRange: (val: DataByHourRange) => void;
    statType: DataByHourStatType;
    setStatType: (val: DataByHourStatType) => void;
}

const name = 'estuary.details-usage-store';
const version = 1;

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
        }, devtoolsOptions(name)),
        { name, version }
    )
);

export default useDetailsUsageStore;
