import { DataByHourRange, DataByHourStatType } from 'components/graphs/types';
import produce from 'immer';
import { devtoolsOptions } from 'utils/store-utils';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface DetailsUsageState {
    range: DataByHourRange;
    setRange: (val: DataByHourRange) => void;
    statType: DataByHourStatType;
    setStatType: (val: DataByHourStatType) => void;
}

const useDetailsUsageStore = create<DetailsUsageState>()(
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
                    'Set range'
                );
            },
            setStatType: (newVal) => {
                set(
                    produce((state) => {
                        state.statType = newVal;
                    }),
                    false,
                    'Set statType'
                );
            },
        };
    }, devtoolsOptions('DetailsUsageStore'))
);

export default useDetailsUsageStore;
