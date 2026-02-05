import type { SelectableTableStore } from 'src/stores/Tables/Store';

import { useState } from 'react';

import { union } from 'lodash';

import { deleteNotificationSubscription } from 'src/api/alerts';
import useAlertSubscriptionsStore from 'src/components/admin/Settings/PrefixAlerts/useAlertSubscriptionsStore';
import { useCreateAlertSubscription } from 'src/components/admin/Settings/PrefixAlerts/useCreateAlertSubscription';
import { useZustandStore } from 'src/context/Zustand/provider';
import { SelectTableStoreNames } from 'src/stores/names';
import { selectableTableStoreSelectors } from 'src/stores/Tables/Store';
import { hasLength } from 'src/utils/misc-utils';

export function useUpdateAlertSubscription(closeDialog: () => void) {
    const { createSubscription } = useCreateAlertSubscription();

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

        const subscriptionsToCancel: { [K: string]: string[] } = {};
        const subscriptionsToCreate: [string, string][] = [];

        Object.entries(updatedEmails).forEach(([key, value]) => {
            const emailsExistForPrefix = Object.hasOwn(existingEmails, key);

            if (emailsExistForPrefix) {
                existingEmails[key]
                    .filter((email) => !value.includes(email))
                    .map((email): [string, string] => [key, email])
                    .forEach((subscriptionMetadata) => {
                        subscriptionsToCancel[subscriptionMetadata[0]] ??= [];
                        subscriptionsToCancel[subscriptionMetadata[0]].push(
                            subscriptionMetadata[1]
                        );
                    });
            }

            const processedValues = union(
                emailsExistForPrefix
                    ? value.filter(
                          (email) => !existingEmails[key].includes(email)
                      )
                    : value
            );

            processedValues
                .map((email): [string, string] => [key, email])
                .forEach((subscriptionMetadata) => {
                    subscriptionsToCreate.push(subscriptionMetadata);
                });
        });

        const subscriptionsDeleted = Object.entries(subscriptionsToCancel).map(
            ([key, emails]) => {
                return deleteNotificationSubscription(key, emails);
            }
        );

        const subscriptionCreated = createSubscription(
            subscriptionsToCreate.map(([key, email]) => ({
                catalogPrefix: key,
                email,
            }))
        );

        const deleteResponses = await Promise.all(subscriptionsDeleted);
        const createResponse = await subscriptionCreated;

        // The create could be undefined and this was easier to mark than tweak logic
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        const deletionErrors = deleteResponses
            .filter((r) => r?.error)
            .map((r) => r?.error);

        const creationErrors = createResponse
            .filter((r) => r?.error)
            .map((r) => r?.error);

        const errors = [...creationErrors, ...deletionErrors];

        if (!hasLength(errors)) {
            hydrate();
            closeDialog();
        }

        setServerError(errors);
        setLoading(false);
    };

    return { loading, onClick };
}
