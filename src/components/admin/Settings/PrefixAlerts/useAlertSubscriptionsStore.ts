import type { PostgrestError } from '@supabase/postgrest-js';
import type { ReducedAlertSubscription } from 'src/api/types';
import type {
    SubscriptionMetadata,
    SubscriptionMetadataDictionary,
} from 'src/components/admin/Settings/PrefixAlerts/types';
import type { AlertTypeInfo } from 'src/gql-types/graphql';
import type { Schema } from 'src/types';

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import produce from 'immer';
import { isEmpty, omit } from 'lodash';
import { type CombinedError } from 'urql';

import { hasOwnProperty, sortByAlertType } from 'src/utils/misc-utils';
import { bundleSubscriptionsByPrefix } from 'src/utils/notification-utils';
import { devtoolsOptions } from 'src/utils/store-utils';

interface AlertSubscriptionState {
    addTemplatedSubscription: () => void;
    alertTypeOptions: AlertTypeInfo[];
    alertTypeOptionsFetching: boolean;
    catalogPrefix: string;
    initializationError: CombinedError | PostgrestError | null | undefined;
    initializeAlertTypeOptions: (
        values: AlertTypeInfo[],
        fetching: boolean
    ) => void;
    markSubscriptionForDeletion: (
        catalogPrefix: string,
        subscriptionId: string
    ) => void;
    mutableSubscriptionMetadata: SubscriptionMetadata;
    prefixErrorsExist: boolean;
    serverErrors: (CombinedError | PostgrestError | null | undefined)[];
    subscriptionMetadata: SubscriptionMetadataDictionary;
    resetState: () => void;
    setEmailErrorsExist: (value: boolean, subscriptionId: string) => void;
    setGlobalPrefixSettings: (value: Schema, targetSetting?: string) => void;
    setInitializationError: (
        value: AlertSubscriptionState['initializationError']
    ) => void;
    setServerErrors: (
        values: AlertSubscriptionState['serverErrors'],
        override?: boolean
    ) => void;
    setSingleAlertType: (
        value: string,
        selected: boolean,
        catalogPrefix?: string,
        email?: string
    ) => void;
    setSubscribedEmail: (value: string, subscriptionId: string) => void;
    setSubscribedPrefix: (value: string, errors: string | null) => void;
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
    | 'initializationError'
    | 'mutableSubscriptionMetadata'
    | 'prefixErrorsExist'
    | 'serverErrors'
    | 'subscriptionMetadata'
> => ({
    alertTypeOptions: [],
    alertTypeOptionsFetching: false,
    catalogPrefix: '',
    initializationError: null,
    mutableSubscriptionMetadata: { settings: {}, subscriptions: [] },
    prefixErrorsExist: false,
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
                        state.alertTypeOptions = values.sort((first, second) =>
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

            setGlobalPrefixSettings: (value, targetSetting) =>
                set(
                    produce((state: AlertSubscriptionState) => {
                        if (isEmpty(value) && !targetSetting) {
                            state.mutableSubscriptionMetadata.settings = {};

                            return;
                        }

                        state.mutableSubscriptionMetadata.settings =
                            isEmpty(value) && targetSetting
                                ? omit(
                                      state.mutableSubscriptionMetadata
                                          .settings,
                                      targetSetting
                                  )
                                : {
                                      ...state.mutableSubscriptionMetadata
                                          .settings,
                                      ...value,
                                  };
                    }),
                    false,
                    'global prefix settings set'
                ),

            markSubscriptionForDeletion: (_catalogPrefix, subscriptionId) =>
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

            setInitializationError: (value) =>
                set(
                    produce((state: AlertSubscriptionState) => {
                        state.initializationError = value;
                    }),
                    false,
                    'initialization error set'
                ),

            setServerErrors: (values, override) =>
                set(
                    produce((state: AlertSubscriptionState) => {
                        const filteredErrors = values.filter(
                            (value) => typeof value !== 'undefined'
                        );

                        state.serverErrors = override
                            ? filteredErrors
                            : state.serverErrors.concat(filteredErrors);
                    }),
                    false,
                    'server errors set'
                ),

            setSingleAlertType: (value, selected, catalogPrefix, email) =>
                set(
                    produce((state: AlertSubscriptionState) => {
                        if (!catalogPrefix || !email) {
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
                            (subscription) => subscription.email === email
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
                                    email,
                                    id: crypto.randomUUID(),
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

            setSubscribedPrefix: (value, errors) =>
                set(
                    produce((state: AlertSubscriptionState) => {
                        state.catalogPrefix = value.endsWith('/')
                            ? value
                            : `${value}/`;

                        state.prefixErrorsExist = Boolean(errors);

                        if (
                            state.catalogPrefix.length > 0 &&
                            hasOwnProperty(
                                state.subscriptionMetadata,
                                state.catalogPrefix
                            )
                        ) {
                            state.mutableSubscriptionMetadata =
                                state.subscriptionMetadata[state.catalogPrefix];

                            return;
                        }

                        state.mutableSubscriptionMetadata = {
                            settings: {},
                            subscriptions:
                                state.mutableSubscriptionMetadata.subscriptions.map(
                                    (subscription) => ({
                                        ...subscription,
                                        catalogPrefix: state.catalogPrefix,
                                    })
                                ),
                        };
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
