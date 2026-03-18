import type { PostgrestError } from '@supabase/postgrest-js';
import type { EmailDictionary } from 'src/components/admin/Settings/PrefixAlerts/types';
import type { PrefixSubscriptionDictionary } from 'src/utils/notification-utils';

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import produce from 'immer';

import { devtoolsOptions } from 'src/utils/store-utils';

interface AlertSubscriptionState {
    existingEmails: EmailDictionary;
    initializationError: PostgrestError | null | undefined;
    initializeState: (
        prefix: string | undefined,
        subscriptions: AlertSubscriptionState['subscriptions'],
        error: AlertSubscriptionState['initializationError']
    ) => void;
    inputUncommitted: boolean;
    prefix: string;
    prefixErrorsExist: boolean;
    saveErrors: (PostgrestError | null | undefined)[];
    subscriptions: PrefixSubscriptionDictionary | null | undefined;
    resetState: () => void;
    setInputUncommitted: (
        value: AlertSubscriptionState['inputUncommitted']
    ) => void;
    setSaveErrors: (value: AlertSubscriptionState['saveErrors']) => void;
    setUpdatedEmails: (value: AlertSubscriptionState['updatedEmails']) => void;
    updatePrefix: (value: string, errors: string | null) => void;
    updatedEmails: EmailDictionary;
}

const getInitialState = (): Pick<
    AlertSubscriptionState,
    | 'existingEmails'
    | 'initializationError'
    | 'inputUncommitted'
    | 'prefix'
    | 'prefixErrorsExist'
    | 'saveErrors'
    | 'subscriptions'
    | 'updatedEmails'
> => ({
    existingEmails: {},
    initializationError: null,
    inputUncommitted: false,
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

            setInputUncommitted: (value) =>
                set(
                    produce((state: AlertSubscriptionState) => {
                        state.inputUncommitted = value;
                    }),
                    false,
                    'input uncommitted set'
                ),

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
