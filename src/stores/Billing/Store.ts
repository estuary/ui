import produce from 'immer';
import { isEqual } from 'lodash';
import { BillingState, DataVolumeByTask } from 'stores/Billing/types';
import {
    getInitialHydrationData,
    getStoreWithHydrationSettings,
} from 'stores/Hydration';
import { BillingStoreNames } from 'stores/names';
import {
    evaluateSpecType,
    formatBillingCatalogStats,
    stripTimeFromDate,
} from 'utils/billing-utils';
import { devtoolsOptions } from 'utils/store-utils';
import { create } from 'zustand';
import { devtools, NamedSet } from 'zustand/middleware';

const getInitialStateData = (): Pick<
    BillingState,
    'billingHistory' | 'dataByTaskGraphDetails'
> => {
    return {
        billingHistory: [],
        dataByTaskGraphDetails: {},
    };
};

export const getInitialState = (set: NamedSet<BillingState>): BillingState => {
    return {
        ...getInitialStateData(),
        ...getStoreWithHydrationSettings('Billing', set),

        setBillingHistory: (value) => {
            set(
                produce((state: BillingState) => {
                    state.billingHistory = formatBillingCatalogStats(value);
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
                        const dataVolumeByTask: DataVolumeByTask = {
                            date: stripTimeFromDate(query.ts),
                            dataVolume:
                                query.bytes_written_by_me +
                                query.bytes_read_by_me,
                            specType: evaluateSpecType(query),
                        };

                        if (
                            Object.hasOwn(
                                state.dataByTaskGraphDetails,
                                query.catalog_name
                            )
                        ) {
                            const existingStatIndex =
                                state.dataByTaskGraphDetails[
                                    query.catalog_name
                                ].findIndex((stat) =>
                                    isEqual(
                                        stat.date,
                                        stripTimeFromDate(query.ts)
                                    )
                                );

                            if (existingStatIndex === -1) {
                                state.dataByTaskGraphDetails[
                                    query.catalog_name
                                ].push(dataVolumeByTask);
                            } else {
                                state.dataByTaskGraphDetails[
                                    query.catalog_name
                                ][existingStatIndex] = dataVolumeByTask;
                            }
                        } else {
                            state.dataByTaskGraphDetails = {
                                ...state.dataByTaskGraphDetails,
                                [query.catalog_name]: [dataVolumeByTask],
                            };
                        }
                    });
                }),
                false,
                'Data By Task Graph Details Set'
            );
        },

        resetState: () => {
            set(
                { ...getInitialStateData(), ...getInitialHydrationData() },
                false,
                'State Reset'
            );
        },
    };
};

export const createBillingStore = (key: BillingStoreNames.GENERAL) => {
    return create<BillingState>()(
        devtools((set) => getInitialState(set), devtoolsOptions(key))
    );
};
