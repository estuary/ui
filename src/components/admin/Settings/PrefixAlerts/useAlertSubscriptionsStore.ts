import type { PostgrestError } from '@supabase/postgrest-js';
import type { ReducedAlertSubscription } from 'src/api/types';
import type { SubscriptionMetadataDictionary } from 'src/components/admin/Settings/PrefixAlerts/types';
import type { AlertTypeInfo } from 'src/gql-types/graphql';
import type { CombinedError } from 'urql';

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import produce from 'immer';

import { bundleSubscriptionsByPrefix } from 'src/utils/notification-utils';
import { devtoolsOptions } from 'src/utils/store-utils';

interface AlertSubscriptionState {
    alertTypes: AlertTypeInfo[];
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
    setAlertTypes: (values: AlertTypeInfo[], initialize?: boolean) => void;
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
    | 'emailErrorsExist'
    | 'initializationError'
    | 'prefixErrorsExist'
    | 'saveErrors'
    | 'subscription'
    | 'subscriptionMetadata'
> => ({
    alertTypes: [],
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

            resetState: () => set(getInitialState(), false, 'state reset'),

            setAlertTypes: (values, initialize) =>
                set(
                    produce((state: AlertSubscriptionState) => {
                        if (initialize) {
                            state.alertTypes = values;
                        } else {
                            state.subscription.alertTypes = values.map(
                                ({ alertType: name }) => name
                            );
                        }
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
