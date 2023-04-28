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
    'billingHistory' | 'dataByTaskGraphDetails' | 'selectedTenant' | 'tenants'
> => {
    return {
        billingHistory: [],
        dataByTaskGraphDetails: [],
        selectedTenant: '',
        tenants: [],
    };
};

export const getInitialState = (set: NamedSet<BillingState>): BillingState => {
    return {
        ...getInitialStateData(),
        ...getStoreWithHydrationSettings('Billing', set),

        setTenants: (value) => {
            set(
                produce((state: BillingState) => {
                    state.tenants = value.map(({ object_role }) => object_role);

                    state.selectedTenant = state.tenants[0];
                }),
                false,
                'Tenants Set'
            );
        },

        setSelectedTenant: (value) => {
            set(
                produce((state: BillingState) => {
                    state.selectedTenant = value;

                    state.billingHistory = [];
                    state.dataByTaskGraphDetails = [];

                    state.hydrated = false;
                    state.hydrationErrorsExist = false;
                }),
                false,
                'Selected Tenant Set'
            );
        },

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
                            catalogName: query.catalog_name,
                            date: stripTimeFromDate(query.ts),
                            dataVolume:
                                query.bytes_written_by_me +
                                query.bytes_read_by_me,
                            specType: evaluateSpecType(query),
                        };

                        const existingStatIndex =
                            state.dataByTaskGraphDetails.findIndex(
                                (stat) =>
                                    query.catalog_name === stat.catalogName &&
                                    isEqual(
                                        stat.date,
                                        stripTimeFromDate(query.ts)
                                    )
                            );

                        if (existingStatIndex === -1) {
                            state.dataByTaskGraphDetails.push(dataVolumeByTask);
                        } else {
                            state.dataByTaskGraphDetails[existingStatIndex] =
                                dataVolumeByTask;
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
