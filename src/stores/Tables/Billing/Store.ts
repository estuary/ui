import produce from 'immer';
import { isEmpty, isEqual } from 'lodash';
import { SelectTableStoreNames } from 'stores/names';
import { BillingState } from 'stores/Tables/Billing/types';
import { getInitialState as getInitialSelectTableState } from 'stores/Tables/Store';
import {
    evaluateDataVolume,
    evaluateSpecType,
    evaluateTotalCost,
    getInitialBillingDetails,
    stripTimeFromDate,
} from 'utils/billing-utils';
import { devtoolsOptions } from 'utils/store-utils';
import { create, StoreApi } from 'zustand';
import { devtools, NamedSet } from 'zustand/middleware';

const getInitialStateData = (): Pick<
    BillingState,
    'billingDetails' | 'projectedCostStats' | 'dataByTaskGraphDetails'
> => {
    return {
        billingDetails: [],
        projectedCostStats: {},
        dataByTaskGraphDetails: {},
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
                            ([ts, stats]) => {
                                const billingDetailsIndex =
                                    state.billingDetails.findIndex((detail) =>
                                        isEqual(
                                            detail.date,
                                            stripTimeFromDate(ts)
                                        )
                                    );

                                const taskCount = stats.length;
                                const dataVolume = evaluateDataVolume(stats);
                                const totalCost = evaluateTotalCost(
                                    dataVolume,
                                    taskCount
                                );

                                if (billingDetailsIndex === -1) {
                                    const { date, month, year, details } =
                                        getInitialBillingDetails(ts);

                                    state.billingDetails.push({
                                        date,
                                        month,
                                        year,
                                        dataVolume,
                                        taskCount,
                                        details,
                                        totalCost,
                                    });
                                } else {
                                    const { date, month, year, details } =
                                        state.billingDetails[
                                            billingDetailsIndex
                                        ];

                                    state.billingDetails[billingDetailsIndex] =
                                        {
                                            date,
                                            month,
                                            year,
                                            dataVolume,
                                            taskCount,
                                            details,
                                            totalCost,
                                        };
                                }
                            }
                        );
                    }
                }),
                false,
                'Billing Details Set'
            );
        },

        setDataByTaskGraphDetails: (value) => {
            set(
                produce((state: BillingState) => {
                    const taskStatData = value.filter((query) =>
                        Object.hasOwn(query.flow_document, 'taskStats')
                    );

                    taskStatData.forEach((query) => {
                        const dataVolume =
                            query.bytes_written_by_me + query.bytes_read_by_me;

                        if (
                            Object.hasOwn(
                                state.dataByTaskGraphDetails,
                                query.catalog_name
                            )
                        ) {
                            state.dataByTaskGraphDetails[
                                query.catalog_name
                            ].push({
                                date: stripTimeFromDate(query.ts),
                                dataVolume,
                                specType: evaluateSpecType(query),
                            });
                        } else {
                            state.dataByTaskGraphDetails = {
                                ...state.dataByTaskGraphDetails,
                                [query.catalog_name]: [
                                    {
                                        date: stripTimeFromDate(query.ts),
                                        dataVolume,
                                        specType: evaluateSpecType(query),
                                    },
                                ],
                            };
                        }
                    });
                }),
                false,
                'Data By Task Graph Details Set'
            );
        },

        resetBillingState: () => {
            set(
                {
                    ...getInitialStateData(),
                    ...getInitialSelectTableState(set, get),
                },
                false,
                'State Reset'
            );
        },
    };
};

export const createBillingStore = (key: SelectTableStoreNames.BILLING) => {
    return create<BillingState>()(
        devtools((set, get) => getInitialState(set, get), devtoolsOptions(key))
    );
};
