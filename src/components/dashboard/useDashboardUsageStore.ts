import { Grains } from 'api/stats';
import { StatType } from 'components/graphs/types';
import { getDaysInMonth, lastDayOfMonth } from 'date-fns';
import produce from 'immer';
import { devtoolsOptions } from 'utils/store-utils';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export type PresentDateRange =
    | 'today'
    | 'thisWeek'
    | 'thisMonth'
    | 'thisYear'
    | 'allTime';

interface DashboardUsageState {
    endDate: Date;
    grain: Grains;
    range: number;
    setEndDate: (value: DashboardUsageState['endDate']) => void;
    setGrain: (value: Grains) => void;
    setRange: (value: DashboardUsageState['range']) => void;
    setStatFilter: (value: DashboardUsageState['statFilter']) => void;
    setStatType: (value: StatType) => void;
    statFilter: PresentDateRange;
    statType: StatType;
}

const name = 'estuary.dashboard-usage-store';

const useDashboardUsageStore = create<DashboardUsageState>()(
    devtools((set) => {
        const initialDate = new Date();

        return {
            endDate: lastDayOfMonth(initialDate),
            statFilter: 'thisMonth',
            grain: 'daily',
            range: getDaysInMonth(initialDate),
            statType: 'bytes',
            setEndDate: (value) => {
                set(
                    produce((state: DashboardUsageState) => {
                        state.endDate = value;
                    }),
                    false,
                    'setGrain'
                );
            },
            setGrain: (value) => {
                set(
                    produce((state: DashboardUsageState) => {
                        state.grain = value;
                    }),
                    false,
                    'setGrain'
                );
            },
            setRange: (value) => {
                set(
                    produce((state: DashboardUsageState) => {
                        state.range = value;
                    }),
                    false,
                    'setRange'
                );
            },
            setStatFilter: (value) => {
                set(
                    produce((state: DashboardUsageState) => {
                        state.statFilter = value;
                    }),
                    false,
                    'setStatFilter'
                );
            },
            setStatType: (value) => {
                set(
                    produce((state: DashboardUsageState) => {
                        state.statType = value;
                    }),
                    false,
                    'setStatType'
                );
            },
        };
    }, devtoolsOptions(name))
);

export default useDashboardUsageStore;
