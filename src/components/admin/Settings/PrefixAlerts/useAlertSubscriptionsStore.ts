import type { PostgrestError } from '@supabase/postgrest-js';
import type { ReducedAlertSubscription } from 'src/api/types';
import type { SubscriptionMetadataDictionary } from 'src/components/admin/Settings/PrefixAlerts/types';
import type { AlertTypeInfo } from 'src/gql-types/graphql';
import type { CombinedError } from 'urql';

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import produce from 'immer';

import { hasOwnProperty } from 'src/utils/misc-utils';
import { bundleSubscriptionsByPrefix } from 'src/utils/notification-utils';
import { devtoolsOptions } from 'src/utils/store-utils';

interface AlertSubscriptionState {
    alertTypes: AlertTypeInfo[];
    catalogPrefix: string;
    emailErrorsExist: boolean;
    initializationError: CombinedError | PostgrestError | null | undefined;
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
    setSubscribedEmail: (value: string) => void;
    setSubscribedPrefix: (value: string, errors: string | null) => void;
    setSubscriptionMetadata: (value: ReducedAlertSubscription[]) => void;
}

const getInitialState = (): Pick<
    AlertSubscriptionState,
    | 'alertTypes'
    | 'catalogPrefix'
    | 'emailErrorsExist'
    | 'initializationError'
    | 'prefixErrorsExist'
    | 'saveErrors'
    | 'subscription'
    | 'subscriptionMetadata'
> => ({
    alertTypes: [],
    catalogPrefix: '',
    emailErrorsExist: false,
    initializationError: null,
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
                                state.subscriptionMetadata,
                                catalogPrefix
                            )
                        ) {
                            state.subscriptionMetadata[catalogPrefix] = {
                                settings: {},
                                subscriptions: [
                                    { alertTypes, catalogPrefix, email },
                                ],
                            };

                            return;
                        }

                        const existingSubscriptions =
                            state.subscriptionMetadata[catalogPrefix]
                                .subscriptions;

                        const targetIndex = existingSubscriptions.findIndex(
                            (subscription) => subscription.email === email
                        );

                        if (targetIndex === -1) {
                            state.subscriptionMetadata[catalogPrefix] = {
                                settings: {},
                                subscriptions: [
                                    ...existingSubscriptions,
                                    { alertTypes, catalogPrefix, email },
                                ],
                            };

                            return;
                        }

                        state.subscriptionMetadata[catalogPrefix].subscriptions[
                            targetIndex
                        ].alertTypes = alertTypes;
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

            setSubscribedEmail: (value) =>
                set(
                    produce((state: AlertSubscriptionState) => {
                        state.subscription.email = value;
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
        };
    }, devtoolsOptions(name))
);

export default useAlertSubscriptionsStore;
