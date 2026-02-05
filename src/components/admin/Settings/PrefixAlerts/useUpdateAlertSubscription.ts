import type { SelectableTableStore } from 'src/stores/Tables/Store';
import type {
    AlertSubscriptionCreateMutationInput,
    BaseAlertSubscriptionMutationInput,
} from 'src/types/gql';

import { useState } from 'react';

import { union } from 'lodash';

import useAlertSubscriptionsStore from 'src/components/admin/Settings/PrefixAlerts/useAlertSubscriptionsStore';
import { useCreateAlertSubscription } from 'src/components/admin/Settings/PrefixAlerts/useCreateAlertSubscription';
import { useDeleteAlertSubscription } from 'src/components/admin/Settings/PrefixAlerts/useDeleteAlertSubscription';
import { useZustandStore } from 'src/context/Zustand/provider';
import { SelectTableStoreNames } from 'src/stores/names';
import { selectableTableStoreSelectors } from 'src/stores/Tables/Store';
import { hasLength } from 'src/utils/misc-utils';

export function useUpdateAlertSubscription(closeDialog: () => void) {
    const { createSubscription } = useCreateAlertSubscription();
    const { deleteSubscription } = useDeleteAlertSubscription();

    const hydrate = useZustandStore<
        SelectableTableStore,
        SelectableTableStore['hydrate']
    >(
        SelectTableStoreNames.PREFIX_ALERTS,
        selectableTableStoreSelectors.query.hydrate
    );

    // const prefix = useAlertSubscriptionsStore((state) => state.prefix);
    // const prefixErrorsExist = useAlertSubscriptionsStore(
    //     (state) => state.prefixErrorsExist
    // );

    // const subscriptions = useAlertSubscriptionsStore(
    //     (state) => state.subscriptions
    // );

    const setServerError = useAlertSubscriptionsStore(
        (state) => state.setSaveErrors
    );

    const existingEmails = useAlertSubscriptionsStore(
        (state) => state.existingEmails
    );
    const updatedEmails = useAlertSubscriptionsStore(
        (state) => state.updatedEmails
    );

    const [loading, setLoading] = useState(false);

    const onClick = async (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        setLoading(true);
        setServerError([]);

        const subscriptionsToCancel: BaseAlertSubscriptionMutationInput[] = [];
        const subscriptionsToCreate: AlertSubscriptionCreateMutationInput[] =
            [];

        Object.entries(updatedEmails).forEach(([key, value]) => {
            const emailsExistForPrefix = Object.hasOwn(existingEmails, key);

            if (emailsExistForPrefix) {
                existingEmails[key]
                    .filter((email) => !value.includes(email))
                    .forEach((email) => {
                        subscriptionsToCancel.push({
                            prefix: key,
                            email,
                        });
                    });
            }

            const processedValues = union(
                emailsExistForPrefix
                    ? value.filter(
                          (email) => !existingEmails[key].includes(email)
                      )
                    : value
            );

            processedValues.map((email) => {
                subscriptionsToCreate.push({
                    prefix: key,
                    email,
                });
            });
        });

        const subscriptionsDeleted = deleteSubscription(subscriptionsToCancel);
        const subscriptionCreated = createSubscription(subscriptionsToCreate);

        const deleteResponse = await subscriptionsDeleted;
        const createResponse = await subscriptionCreated;

        // The create could be undefined and this was easier to mark than tweak logic
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        const errors = [...createResponse, ...deleteResponse]
            .filter((r) => r?.error)
            .map((r) => r?.error);

        if (!hasLength(errors)) {
            hydrate();
            closeDialog();
        }

        setServerError(errors);
        setLoading(false);
    };

    return { loading, onClick };
}
