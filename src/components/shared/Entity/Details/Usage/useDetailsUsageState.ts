import { DataByHourRange, DataByHourStatType } from 'components/graphs/types';
import produce from 'immer';
import { devtoolsOptions } from 'utils/store-utils';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface DetailsUsateState {
    range: DataByHourRange;
    setRange: (val: DataByHourRange) => void;
    statType: DataByHourStatType;
    setStatType: (val: DataByHourStatType) => void;
}

const useDetailsUsageState = create<DetailsUsateState>()(
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

export default useDetailsUsageState;
