import type { PostgrestError } from '@supabase/postgrest-js';
import type { ReducedAlertSubscription } from 'src/api/types';
import type { SubscriptionMetadataDictionary } from 'src/components/admin/Settings/PrefixAlerts/types';
import type { AlertTypeInfo } from 'src/gql-types/graphql';
import type { CombinedError } from 'urql';

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import produce from 'immer';
import { cloneDeep } from 'lodash';

import { hasOwnProperty } from 'src/utils/misc-utils';
import { bundleSubscriptionsByPrefix } from 'src/utils/notification-utils';
import { devtoolsOptions } from 'src/utils/store-utils';

interface AlertSubscriptionState {
    addTemplatedSubscription: () => void;
    alertTypeOptions: AlertTypeInfo[];
    alertTypeOptionsFetching: boolean;
    catalogPrefix: string;
    emailErrorsExist: boolean;
    initializationError: CombinedError | PostgrestError | null | undefined;
    initializeAlertTypeOptions: (
        values: AlertTypeInfo[],
        fetching: boolean
    ) => void;
    initializeMutableSubscriptionMetadata: () => void;
    markSubscriptionForDeletion: (
        catalogPrefix: string,
        subscriptionId: string
    ) => void;
    mutableSubscriptionMetadata: SubscriptionMetadataDictionary;
    prefixErrorsExist: boolean;
    saveErrors: (CombinedError | PostgrestError | null | undefined)[];
    subscription: Pick<
        ReducedAlertSubscription,
        'alertTypes' | 'catalogPrefix' | 'email'
    >;
    subscriptionMetadata: SubscriptionMetadataDictionary;
    resetState: () => void;
    setAlertTypes: (
        values: AlertTypeInfo[],
        catalogPrefix?: string,
        email?: string
    ) => void;
    setEmailErrorsExist: (
        value: AlertSubscriptionState['emailErrorsExist']
    ) => void;
    setInitializationError: (
        value: AlertSubscriptionState['initializationError']
    ) => void;
    setSaveErrors: (value: AlertSubscriptionState['saveErrors']) => void;
    setSubscribedEmail: (value: string, subscriptionId: string) => void;
    setSubscribedPrefix: (value: string, errors: string | null) => void;
    setSubscriptionMetadata: (value: ReducedAlertSubscription[]) => void;
    toggleSubscriptionViewingStatus: (subscriptionId: string) => void;
}

const getSubscriptionIndex = (
    state: AlertSubscriptionState | Partial<AlertSubscriptionState>,
    subscriptionId: string,
    immutable?: boolean
): number => {
    const subscriptionMetadataTarget = immutable
        ? 'subscriptionMetadata'
        : 'mutableSubscriptionMetadata';

    if (
        !state.catalogPrefix ||
        !subscriptionId ||
        !hasOwnProperty(state, subscriptionMetadataTarget) ||
        !state[subscriptionMetadataTarget] ||
        !hasOwnProperty(state.mutableSubscriptionMetadata, state.catalogPrefix)
    ) {
        return -1;
    }

    return state[subscriptionMetadataTarget][
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
    | 'emailErrorsExist'
    | 'initializationError'
    | 'mutableSubscriptionMetadata'
    | 'prefixErrorsExist'
    | 'saveErrors'
    | 'subscription'
    | 'subscriptionMetadata'
> => ({
    alertTypeOptions: [],
    alertTypeOptionsFetching: false,
    catalogPrefix: '',
    emailErrorsExist: false,
    initializationError: null,
    mutableSubscriptionMetadata: {},
    prefixErrorsExist: false,
    saveErrors: [],
    subscription: { alertTypes: [], catalogPrefix: '', email: '' },
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

                        if (
                            !hasOwnProperty(
                                state.mutableSubscriptionMetadata,
                                state.catalogPrefix
                            )
                        ) {
                            state.mutableSubscriptionMetadata[
                                state.catalogPrefix
                            ] = {
                                settings: {},
                                subscriptions: [templatedSubscription],
                            };

                            return;
                        }

                        const targetSubscriptions =
                            state.mutableSubscriptionMetadata[
                                state.catalogPrefix
                            ].subscriptions;

                        state.mutableSubscriptionMetadata[
                            state.catalogPrefix
                        ].subscriptions = [
                            templatedSubscription,
                            ...targetSubscriptions,
                        ];
                    }),
                    false,
                    'templated subscription added'
                ),

            initializeAlertTypeOptions: (values, fetching) =>
                set(
                    produce((state: AlertSubscriptionState) => {
                        state.alertTypeOptions = values;
                        state.alertTypeOptionsFetching = fetching;
                    }),
                    false,
                    'alert type options initialized'
                ),

            initializeMutableSubscriptionMetadata: () =>
                set(
                    produce((state: AlertSubscriptionState) => {
                        state.mutableSubscriptionMetadata = cloneDeep(
                            state.subscriptionMetadata
                        );
                    }),
                    false,
                    'mutable subscription metadata initialized'
                ),

            markSubscriptionForDeletion: (_catalogPrefix, subscriptionId) =>
                set(
                    produce((state: AlertSubscriptionState) => {
                        const mutableSubscriptionIndex = getSubscriptionIndex(
                            state,
                            subscriptionId
                        );

                        if (mutableSubscriptionIndex === -1) {
                            return;
                        }

                        const immutableSubscriptionIndex = getSubscriptionIndex(
                            state,
                            subscriptionId,
                            true
                        );

                        // If the alert subscription does not exist in the database,
                        // it can be removed entirely from the array of mutable subscriptions.
                        if (immutableSubscriptionIndex === -1) {
                            state.mutableSubscriptionMetadata[
                                state.catalogPrefix
                            ].subscriptions = state.mutableSubscriptionMetadata[
                                state.catalogPrefix
                            ].subscriptions.filter(
                                (subscription) =>
                                    subscription.id !== subscriptionId
                            );

                            return;
                        }

                        // If the alert subscription does exist in the database,
                        // the subscription metadata should be preserved in the
                        // array of mutable subscriptions with it marked for deletion
                        // via the corresponding GraphQL endpoint.
                        state.mutableSubscriptionMetadata[
                            state.catalogPrefix
                        ].subscriptions[mutableSubscriptionIndex].deleted =
                            true;
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

            setAlertTypes: (values, catalogPrefix, email) =>
                set(
                    produce((state: AlertSubscriptionState) => {
                        if (!catalogPrefix || !email) {
                            return;
                        }

                        const alertTypes = values.map(
                            ({ alertType: name }) => name
                        );

                        if (
                            catalogPrefix.length === 0 ||
                            !hasOwnProperty(
                                state.mutableSubscriptionMetadata,
                                catalogPrefix
                            )
                        ) {
                            state.mutableSubscriptionMetadata[catalogPrefix] = {
                                settings: {},
                                subscriptions: [
                                    {
                                        alertTypes,
                                        catalogPrefix,
                                        email,
                                        id: crypto.randomUUID(),
                                        viewing: true,
                                    },
                                ],
                            };

                            return;
                        }

                        const targetSubscriptions =
                            state.mutableSubscriptionMetadata[catalogPrefix]
                                .subscriptions;

                        const targetIndex = targetSubscriptions.findIndex(
                            (subscription) => subscription.email === email
                        );

                        if (targetIndex === -1) {
                            state.mutableSubscriptionMetadata[catalogPrefix] = {
                                settings: {},
                                subscriptions: [
                                    ...targetSubscriptions,
                                    {
                                        alertTypes,
                                        catalogPrefix,
                                        email,
                                        id: crypto.randomUUID(),
                                        viewing: true,
                                    },
                                ],
                            };

                            return;
                        }

                        state.mutableSubscriptionMetadata[
                            catalogPrefix
                        ].subscriptions[targetIndex].alertTypes = alertTypes;
                    }),
                    false,
                    'alert types set'
                ),

            setEmailErrorsExist: (value) =>
                set(
                    produce((state: AlertSubscriptionState) => {
                        state.emailErrorsExist = value;
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

            setSaveErrors: (value) =>
                set(
                    produce((state: AlertSubscriptionState) => {
                        state.saveErrors = value;
                    }),
                    false,
                    'save errors set'
                ),

            setSubscribedEmail: (value, subscriptionId) =>
                set(
                    produce((state: AlertSubscriptionState) => {
                        const subscriptionIndex = getSubscriptionIndex(
                            state,
                            subscriptionId
                        );

                        if (subscriptionIndex === -1) {
                            return;
                        }

                        state.mutableSubscriptionMetadata[
                            state.catalogPrefix
                        ].subscriptions[subscriptionIndex].email = value;
                    }),
                    false,
                    'subscribed email set'
                ),

            setSubscribedPrefix: (value, errors) =>
                set(
                    produce((state: AlertSubscriptionState) => {
                        state.subscription.catalogPrefix = value;
                        state.catalogPrefix = value;
                        state.prefixErrorsExist = Boolean(errors);
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
                        const subscriptionIndex = getSubscriptionIndex(
                            state,
                            subscriptionId
                        );

                        if (subscriptionIndex === -1) {
                            return;
                        }

                        const previousValue =
                            state.mutableSubscriptionMetadata[
                                state.catalogPrefix
                            ].subscriptions[subscriptionIndex].viewing;

                        state.mutableSubscriptionMetadata[
                            state.catalogPrefix
                        ].subscriptions[subscriptionIndex].viewing =
                            !previousValue;
                    }),
                    false,
                    'subscription metadata set'
                ),
        };
    }, devtoolsOptions(name))
);

export default useAlertSubscriptionsStore;
