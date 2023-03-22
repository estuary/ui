import { parseISO } from 'date-fns';
import produce from 'immer';
import { isEmpty, sum } from 'lodash';
import { SelectTableStoreNames } from 'stores/names';
import { BillingDetails, BillingState } from 'stores/Tables/Billing/types';
import { getInitialState as getInitialSelectTableState } from 'stores/Tables/Store';
import { ProjectedCostStats } from 'types';
import { devtoolsOptions } from 'utils/store-utils';
import { create, StoreApi } from 'zustand';
import { devtools, NamedSet } from 'zustand/middleware';

const FREE_BYTES = 21474836480;
const FREE_TASK_COUNT = 2;

const evaluateTotalCost = (dataVolume: number, taskCount: number) => {
    const dataVolumeOverLimit =
        dataVolume > FREE_BYTES ? dataVolume - FREE_BYTES : 0;

    const taskCountOverLimit =
        taskCount > FREE_TASK_COUNT ? taskCount - FREE_TASK_COUNT : 0;

    return dataVolumeOverLimit * 0.75 + taskCountOverLimit * 20;
};

const evaluateDataVolume = (
    projectedCostStats: ProjectedCostStats[]
): number => {
    const taskBytes: number[] = projectedCostStats.map((query) => {
        if (Object.hasOwn(query.flow_document.taskStats, 'capture')) {
            return query.bytes_written_by_me;
        } else if (
            Object.hasOwn(query.flow_document.taskStats, 'materialize')
        ) {
            return query.bytes_read_by_me;
        } else {
            console.log('Derivation skipped');

            return 0;
        }
    });

    return sum(taskBytes);
};

const getInitialBillingDetails = (date: string): BillingDetails => {
    const [truncatedDateStr] = date.split('T', 1);
    const truncatedDate = parseISO(truncatedDateStr);

    return {
        date: truncatedDate,
        month: truncatedDate.getMonth() + 1,
        year: truncatedDate.getFullYear(),
        dataVolume: 0,
        taskCount: 0,
        details: null,
        totalCost: 0,
    };
};

const getInitialStateData = (): Pick<
    BillingState,
    'billingDetails' | 'projectedCostStats'
> => {
    return {
        billingDetails: {},
        projectedCostStats: {},
    };
};

export const getInitialState = (
    set: NamedSet<BillingState>,
    get: StoreApi<BillingState>['getState']
): BillingState => {
    return {
        ...getInitialStateData(),
        ...getInitialSelectTableState(set, get),

        setProjectedCostStats: (value) => {
            set(
                produce((state: BillingState) => {
                    const taskStatData = value.filter((query) =>
                        Object.hasOwn(query.flow_document, 'taskStats')
                    );

                    taskStatData.forEach((query) => {
                        if (Object.hasOwn(state.projectedCostStats, query.ts)) {
                            state.projectedCostStats[query.ts].push(query);
                        } else {
                            state.projectedCostStats = {
                                ...state.projectedCostStats,
                                [query.ts]: [query],
                            };
                        }
                    });
                }),
                false,
                'Projected Cost Stats Set'
            );
        },

        setBillingDetails: () => {
            set(
                produce((state: BillingState) => {
                    const { projectedCostStats } = get();

                    if (!isEmpty(projectedCostStats)) {
                        Object.entries(projectedCostStats).forEach(
                            ([date, stats]) => {
                                if (
                                    !Object.hasOwn(state.billingDetails, date)
                                ) {
                                    state.billingDetails = {
                                        ...state.billingDetails,
                                        [date]: getInitialBillingDetails(date),
                                    };
                                }

                                const taskCount = stats.length;
                                const dataVolume = evaluateDataVolume(stats);

                                state.billingDetails[date].taskCount =
                                    taskCount;

                                state.billingDetails[date].dataVolume =
                                    dataVolume;

                                state.billingDetails[date].totalCost =
                                    evaluateTotalCost(dataVolume, taskCount);
                            }
                        );
                    }
                }),
                false,
                'Billing Details Set'
            );
        },
    };
};

export const createBillingStore = (key: SelectTableStoreNames.BILLING) => {
    return create<BillingState>()(
        devtools((set, get) => getInitialState(set, get), devtoolsOptions(key))
    );
};
