import { PostgrestError } from '@supabase/postgrest-js';
import produce from 'immer';
import { PrefixSubscriptionDictionary } from 'utils/notification-utils';
import { devtoolsOptions } from 'utils/store-utils';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { EmailDictionary } from './types';

interface AlertSubscriptionState {
    existingEmails: EmailDictionary;
    initializationError: PostgrestError | null | undefined;
    initializeState: (
        prefix: string | undefined,
        subscriptions: AlertSubscriptionState['subscriptions'],
        error: AlertSubscriptionState['initializationError']
    ) => void;
    prefix: string;
    prefixErrorsExist: boolean;
    saveErrors: (PostgrestError | null | undefined)[];
    subscriptions: PrefixSubscriptionDictionary | null | undefined;
    resetState: () => void;
    setSaveErrors: (value: AlertSubscriptionState['saveErrors']) => void;
    setUpdatedEmails: (value: AlertSubscriptionState['updatedEmails']) => void;
    updatePrefix: (value: string, errors: string | null) => void;
    updatedEmails: EmailDictionary;
}

const getInitialState = (): Pick<
    AlertSubscriptionState,
    | 'existingEmails'
    | 'initializationError'
    | 'prefix'
    | 'prefixErrorsExist'
    | 'saveErrors'
    | 'subscriptions'
    | 'updatedEmails'
> => ({
    existingEmails: {},
    initializationError: null,
    prefix: '',
    prefixErrorsExist: false,
    saveErrors: [],
    subscriptions: undefined,
    updatedEmails: {},
});

const name = 'estuary.alert-subscriptions-store';

const useAlertSubscriptionsStore = create<AlertSubscriptionState>()(
    devtools((set) => {
        return {
            ...getInitialState(),

            initializeState: (prefix, subscriptions, error) =>
                set(
                    produce((state: AlertSubscriptionState) => {
                        if (prefix) {
                            state.prefix = prefix;
                        }

                        if (
                            subscriptions === null ||
                            subscriptions === undefined
                        ) {
                            state.existingEmails = {};
                        } else {
                            Object.entries(subscriptions).forEach(
                                ([key, value]) => {
                                    state.existingEmails[key] =
                                        value.userSubscriptions.map(
                                            ({ email }) => email
                                        );
                                }
                            );
                        }

                        state.subscriptions = subscriptions;
                        state.initializationError = error;
                    }),
                    false,
                    'state initialized'
                ),

            resetState: () => set(getInitialState(), false, 'state reset'),

            setSaveErrors: (value) =>
                set(
                    produce((state: AlertSubscriptionState) => {
                        state.saveErrors = value;
                    }),
                    false,
                    'save errors set'
                ),

            setUpdatedEmails: (value) =>
                set(
                    produce((state: AlertSubscriptionState) => {
                        state.updatedEmails = value;
                    }),
                    false,
                    'updated emails set'
                ),

            updatePrefix: (value, errors) =>
                set(
                    produce((state: AlertSubscriptionState) => {
                        state.prefix = value;
                        state.prefixErrorsExist = Boolean(errors);
                    }),
                    false,
                    'prefix updated'
                ),
        };
    }, devtoolsOptions(name))
);

export default useAlertSubscriptionsStore;
