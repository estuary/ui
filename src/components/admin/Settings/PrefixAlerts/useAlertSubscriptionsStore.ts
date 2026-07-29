import type { PostgrestError } from '@supabase/postgrest-js';
import type { ReducedAlertSubscription } from 'src/api/types';
import type {
    AlertConfigOptions,
    SubscriptionMetadata,
    SubscriptionMetadataDictionary,
} from 'src/components/admin/Settings/PrefixAlerts/types';
import type { PrefixedName_ErrorStates } from 'src/components/inputs/PrefixedName/types';
import type { AlertTypeInfo } from 'src/gql-types/graphql';
import type { Schema } from 'src/types';
import type { WithRequiredProperty } from 'src/types/utils';

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import produce from 'immer';
import { isEmpty, omit } from 'lodash';
import { type CombinedError } from 'urql';

import { hasOwnProperty, sortByAlertType } from 'src/utils/misc-utils';
import { bundleSubscriptionsByPrefix } from 'src/utils/notification-utils';
import { devtoolsOptions } from 'src/utils/store-utils';
import { validateCatalogName } from 'src/validation';

interface AlertSubscriptionState {
    addTemplatedSubscription: () => void;
    alertTypeOptions: AlertTypeInfo[];
    alertTypeOptionsFetching: boolean;
    catalogPrefix: string;
    initializationErrors: (CombinedError | PostgrestError)[];
    initializeAlertTypeOptions: (
        values: AlertTypeInfo[],
        fetching: boolean
    ) => void;
    initializeGlobalPrefixSettings: (
        targetConfigs: WithRequiredProperty<AlertConfigOptions, 'standard'>
    ) => void;
    isEditFlow: boolean;
    markSubscriptionForDeletion: (subscriptionId: string) => void;
    mutableSubscriptionMetadata: SubscriptionMetadata;
    prefixErrors: PrefixedName_ErrorStates[];
    serverErrors: (CombinedError | PostgrestError)[];
    subscriptionMetadata: SubscriptionMetadataDictionary;
    resetState: () => void;
    setEmailErrorsExist: (value: boolean, subscriptionId: string) => void;
    setGlobalPrefixSettings: (
        alertCondition: Schema,
        targetSetting: string
    ) => void;
    setInitializationErrors: (
        values: (CombinedError | PostgrestError | null | undefined)[]
    ) => void;
    setIsEditFlow: (value: AlertSubscriptionState['isEditFlow']) => void;
    setServerErrors: (
        values: (CombinedError | PostgrestError | null | undefined)[],
        override?: boolean
    ) => void;
    setSingleAlertType: (
        value: string,
        selected: boolean,
        catalogPrefix?: string,
        id?: string
    ) => void;
    setSubscribedEmail: (value: string, subscriptionId: string) => void;
    setSubscribedPrefix: (value: string) => void;
    setSubscriptionMetadata: (value: ReducedAlertSubscription[]) => void;
    toggleSubscriptionViewingStatus: (subscriptionId: string) => void;
}

const getImmutableSubscriptionIndex = (
    state: AlertSubscriptionState | Partial<AlertSubscriptionState>,
    subscriptionId: string
): number => {
    if (
        !state.catalogPrefix ||
        !subscriptionId ||
        !hasOwnProperty(state, 'subscriptionMetadata') ||
        isEmpty(state.subscriptionMetadata) ||
        !hasOwnProperty(state.subscriptionMetadata, state.catalogPrefix)
    ) {
        return -1;
    }

    return state.subscriptionMetadata[
        state.catalogPrefix
    ].subscriptions.findIndex(
        (subscription) => subscription.id === subscriptionId
    );
};

const getInitialState = (): Pick<
    AlertSubscriptionState,
    | 'alertTypeOptions'
    | 'alertTypeOptionsFetching'
    | 'catalogPrefix'
    | 'initializationErrors'
    | 'isEditFlow'
    | 'mutableSubscriptionMetadata'
    | 'prefixErrors'
    | 'serverErrors'
    | 'subscriptionMetadata'
> => ({
    alertTypeOptions: [],
    alertTypeOptionsFetching: false,
    catalogPrefix: '',
    initializationErrors: [],
    isEditFlow: false,
    mutableSubscriptionMetadata: {
        configs: { effective: {}, standard: null },
        explicitConfigRef: null,
        subscriptions: [],
    },
    prefixErrors: [],
    serverErrors: [],
    subscriptionMetadata: {},
});

const name = 'estuary.alert-subscriptions-store';

const useAlertSubscriptionsStore = create<AlertSubscriptionState>()(
    devtools((set) => {
        return {
            ...getInitialState(),

            addTemplatedSubscription: () =>
                set(
                    produce((state: AlertSubscriptionState) => {
                        if (
                            !state.catalogPrefix ||
                            state.alertTypeOptions.length === 0
                        ) {
                            return;
                        }

                        const templatedSubscription = {
                            alertTypes: state.alertTypeOptions
                                .filter(
                                    (option) =>
                                        option.isDefault || option.isSystem
                                )
                                .map(({ alertType }) => alertType),
                            catalogPrefix: state.catalogPrefix,
                            email: '',
                            id: crypto.randomUUID(),
                            viewing: true,
                        };

                        state.mutableSubscriptionMetadata.subscriptions = [
                            templatedSubscription,
                            ...state.mutableSubscriptionMetadata.subscriptions,
                        ];
                    }),
                    false,
                    'templated subscription added'
                ),

            initializeAlertTypeOptions: (values, fetching) =>
                set(
                    produce((state: AlertSubscriptionState) => {
                        state.alertTypeOptions = [...values].sort(
                            (first, second) =>
                                sortByAlertType(
                                    {
                                        isSystemAlert: first.isSystem,
                                        value: first.displayName,
                                    },
                                    {
                                        isSystemAlert: second.isSystem,
                                        value: second.displayName,
                                    },
                                    'asc'
                                )
                        );
                        state.alertTypeOptionsFetching = fetching;
                    }),
                    false,
                    'alert type options initialized'
                ),

            initializeGlobalPrefixSettings: (targetConfigs) =>
                set(
                    produce((state: AlertSubscriptionState) => {
                        state.mutableSubscriptionMetadata.configs =
                            targetConfigs;

                        state.mutableSubscriptionMetadata.explicitConfigRef =
                            targetConfigs.standard;
                    }),
                    false,
                    'global prefix settings initialized'
                ),

            markSubscriptionForDeletion: (subscriptionId) =>
                set(
                    produce((state: AlertSubscriptionState) => {
                        const immutableSubscriptionIndex =
                            getImmutableSubscriptionIndex(
                                state,
                                subscriptionId
                            );

                        // If the alert subscription does not exist in the database,
                        // it can be removed entirely from the array of mutable subscriptions.
                        if (immutableSubscriptionIndex === -1) {
                            state.mutableSubscriptionMetadata.subscriptions =
                                state.mutableSubscriptionMetadata.subscriptions.filter(
                                    (subscription) =>
                                        subscription.id !== subscriptionId
                                );

                            return;
                        }

                        // If the alert subscription does exist in the database,
                        // the subscription metadata should be preserved in the
                        // array of mutable subscriptions with it marked for deletion
                        // via the corresponding GraphQL endpoint.
                        const mutableSubscriptionIndex =
                            state.mutableSubscriptionMetadata.subscriptions.findIndex(
                                (subscription) =>
                                    subscription.id === subscriptionId
                            );

                        state.mutableSubscriptionMetadata.subscriptions[
                            mutableSubscriptionIndex
                        ].deleted = true;
                    }),
                    false,
                    'mark subscription for deletion'
                ),

            resetState: () =>
                set(
                    produce((state: AlertSubscriptionState) => {
                        return {
                            ...getInitialState(),
                            subscriptionMetadata: state.subscriptionMetadata,
                        };
                    }),
                    false,
                    'state reset'
                ),

            setEmailErrorsExist: (value, subscriptionId) =>
                set(
                    produce((state: AlertSubscriptionState) => {
                        const subscriptionIndex =
                            state.mutableSubscriptionMetadata.subscriptions.findIndex(
                                (subscription) =>
                                    subscription.id === subscriptionId
                            );

                        if (subscriptionIndex === -1) {
                            return;
                        }

                        state.mutableSubscriptionMetadata.subscriptions[
                            subscriptionIndex
                        ].emailErrorsExist = value;
                    }),
                    false,
                    'email errors exist set'
                ),

            setGlobalPrefixSettings: (alertCondition, targetSetting) =>
                set(
                    produce((state: AlertSubscriptionState) => {
                        if (targetSetting.length === 0) {
                            return;
                        }

                        const configKeys = Object.keys(
                            state.mutableSubscriptionMetadata.configs
                        ) as (keyof AlertConfigOptions)[];

                        const alertConditionEmpty = isEmpty(alertCondition);

                        configKeys.forEach((key) => {
                            if (
                                state.mutableSubscriptionMetadata.configs[key]
                            ) {
                                if (alertConditionEmpty) {
                                    state.mutableSubscriptionMetadata.configs[
                                        key
                                    ][targetSetting] = omit(
                                        state.mutableSubscriptionMetadata
                                            .configs[key][targetSetting],
                                        'condition'
                                    );
                                } else {
                                    const immutableConfig =
                                        state.catalogPrefix.length > 0 &&
                                        hasOwnProperty(
                                            state.subscriptionMetadata,
                                            state.catalogPrefix
                                        )
                                            ? (state.subscriptionMetadata[
                                                  state.catalogPrefix
                                              ].configs[key] ?? {})
                                            : {};

                                    state.mutableSubscriptionMetadata.configs[
                                        key
                                    ] = {
                                        ...immutableConfig,
                                        [targetSetting]: {
                                            ...immutableConfig?.[targetSetting],
                                            ...state.mutableSubscriptionMetadata
                                                .configs[key][targetSetting],
                                            condition: alertCondition,
                                        },
                                    };
                                }

                                return;
                            }

                            if (!alertConditionEmpty) {
                                state.mutableSubscriptionMetadata.configs[key] =
                                    {
                                        [targetSetting]: {
                                            condition: alertCondition,
                                        },
                                    };
                            }
                        });
                    }),
                    false,
                    'global prefix settings set'
                ),

            setInitializationErrors: (values) =>
                set(
                    produce((state: AlertSubscriptionState) => {
                        state.initializationErrors = values.filter(
                            (error) =>
                                error !== null && typeof error !== 'undefined'
                        );
                    }),
                    false,
                    'initialization errors set'
                ),

            setIsEditFlow: (value) =>
                set(
                    produce((state: AlertSubscriptionState) => {
                        state.isEditFlow = value;
                    }),
                    false,
                    'edit workflow flag set'
                ),

            setServerErrors: (values, override) =>
                set(
                    produce((state: AlertSubscriptionState) => {
                        const filteredErrors = values.filter(
                            (error) =>
                                error !== null && typeof error !== 'undefined'
                        );

                        state.serverErrors = override
                            ? filteredErrors
                            : state.serverErrors.concat(filteredErrors);
                    }),
                    false,
                    'server errors set'
                ),

            setSingleAlertType: (value, selected, catalogPrefix, id) =>
                set(
                    produce((state: AlertSubscriptionState) => {
                        if (!catalogPrefix) {
                            return;
                        }

                        const systemAlertTypes = state.alertTypeOptions
                            .filter(({ isSystem }) => isSystem)
                            .map(({ alertType }) => alertType);

                        if (
                            systemAlertTypes.some(
                                (alertType) => alertType === value
                            )
                        ) {
                            return;
                        }

                        const targetSubscriptions =
                            state.mutableSubscriptionMetadata.subscriptions;

                        const targetIndex = targetSubscriptions.findIndex(
                            (subscription) => subscription.id === id
                        );

                        if (targetIndex === -1) {
                            const baseAlertTypes = state.alertTypeOptions
                                .filter(
                                    ({ alertType, isDefault, isSystem }) =>
                                        isSystem ||
                                        (isDefault && alertType !== value)
                                )
                                .map(({ alertType }) => alertType);

                            state.mutableSubscriptionMetadata.subscriptions = [
                                ...targetSubscriptions,
                                {
                                    alertTypes: [...baseAlertTypes, value],
                                    catalogPrefix,
                                    email: '',
                                    id: id ?? crypto.randomUUID(),
                                    viewing: true,
                                },
                            ];

                            return;
                        }

                        const { alertTypes: previousAlertTypes } =
                            state.mutableSubscriptionMetadata.subscriptions[
                                targetIndex
                            ];

                        state.mutableSubscriptionMetadata.subscriptions[
                            targetIndex
                        ].alertTypes = selected
                            ? [...previousAlertTypes, value]
                            : previousAlertTypes.filter(
                                  (alertType) => alertType !== value
                              );
                    }),
                    false,
                    'single alert type set'
                ),

            setSubscribedEmail: (value, subscriptionId) =>
                set(
                    produce((state: AlertSubscriptionState) => {
                        const subscriptionIndex =
                            state.mutableSubscriptionMetadata.subscriptions.findIndex(
                                (subscription) =>
                                    subscription.id === subscriptionId
                            );

                        if (subscriptionIndex === -1) {
                            return;
                        }

                        state.mutableSubscriptionMetadata.subscriptions[
                            subscriptionIndex
                        ].email = value;
                    }),
                    false,
                    'subscribed email set'
                ),

            setSubscribedPrefix: (value) =>
                set(
                    produce((state: AlertSubscriptionState) => {
                        state.catalogPrefix = value;

                        // Validate the prefix and store validation errors.
                        const validationErrors =
                            validateCatalogName(value, false, true) ?? [];

                        if (
                            !state.isEditFlow &&
                            Object.keys(state.subscriptionMetadata).includes(
                                value
                            )
                        ) {
                            validationErrors.push('duplicate');
                        }

                        state.prefixErrors = validationErrors;

                        // Reset mutable subscription metadata state.
                        state.mutableSubscriptionMetadata =
                            getInitialState().mutableSubscriptionMetadata;

                        // Evaluate the existing subscriptions for the prefix.
                        state.mutableSubscriptionMetadata.subscriptions =
                            state.catalogPrefix.length > 0 &&
                            hasOwnProperty(
                                state.subscriptionMetadata,
                                state.catalogPrefix
                            )
                                ? state.subscriptionMetadata[
                                      state.catalogPrefix
                                  ].subscriptions
                                : [];
                    }),
                    false,
                    'subscribed prefix set'
                ),

            setSubscriptionMetadata: (value) =>
                set(
                    produce((state: AlertSubscriptionState) => {
                        state.subscriptionMetadata =
                            bundleSubscriptionsByPrefix(value);
                    }),
                    false,
                    'subscription metadata set'
                ),

            toggleSubscriptionViewingStatus: (subscriptionId) =>
                set(
                    produce((state: AlertSubscriptionState) => {
                        const subscriptionIndex =
                            state.mutableSubscriptionMetadata.subscriptions.findIndex(
                                (subscription) =>
                                    subscription.id === subscriptionId
                            );

                        if (subscriptionIndex === -1) {
                            return;
                        }

                        const previousValue =
                            state.mutableSubscriptionMetadata.subscriptions[
                                subscriptionIndex
                            ].viewing;

                        state.mutableSubscriptionMetadata.subscriptions[
                            subscriptionIndex
                        ].viewing = !previousValue;
                    }),
                    false,
                    'subscription viewing status toggled'
                ),
        };
    }, devtoolsOptions(name))
);

export default useAlertSubscriptionsStore;
