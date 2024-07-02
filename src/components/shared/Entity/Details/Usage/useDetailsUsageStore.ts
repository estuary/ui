import { DataByHourRange, DataByHourStatType } from 'components/graphs/types';
import produce from 'immer';
import { devtoolsOptions } from 'utils/store-utils';
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface DetailsUsageState {
    range: DataByHourRange;
    setRange: (val: DataByHourRange) => void;
    statType: DataByHourStatType;
    setStatType: (val: DataByHourStatType) => void;
}

const name = 'estuary.details-usage-store';
const version = 0;

const useDetailsUsageStore = create<DetailsUsageState>()(
    persist(
        devtools((set) => {
            return {
                range: 6,
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
        }, devtoolsOptions(name)),
        { name, version }
    )
);

export default useDetailsUsageStore;
