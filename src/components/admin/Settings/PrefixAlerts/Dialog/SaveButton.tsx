import {
    createNotificationSubscription,
    deleteNotificationSubscription,
} from 'api/alerts';
import SafeLoadingButton from 'components/SafeLoadingButton';
import { useZustandStore } from 'context/Zustand/provider';
import { useMemo, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import {
    SelectableTableStore,
    selectableTableStoreSelectors,
} from 'stores/Tables/Store';
import { SelectTableStoreNames } from 'stores/names';
import { hasLength } from 'utils/misc-utils';
import useAlertSubscriptionsStore from '../useAlertSubscriptionsStore';

interface Props {
    closeDialog: () => void;
}

function SaveButton({ closeDialog }: Props) {
    const hydrate = useZustandStore<
        SelectableTableStore,
        SelectableTableStore['hydrate']
    >(
        SelectTableStoreNames.PREFIX_ALERTS,
        selectableTableStoreSelectors.query.hydrate
    );

    const prefix = useAlertSubscriptionsStore((state) => state.prefix);
    const prefixErrorsExist = useAlertSubscriptionsStore(
        (state) => state.prefixErrorsExist
    );

    const subscriptions = useAlertSubscriptionsStore(
        (state) => state.subscriptions
    );

    const existingEmails = useAlertSubscriptionsStore(
        (state) => state.existingEmails
    );
    const updatedEmails = useAlertSubscriptionsStore(
        (state) => state.updatedEmails
    );

    const [loading, setLoading] = useState(false);

    const disabled = useMemo(
        () =>
            Boolean(
                !hasLength(prefix) ||
                    prefixErrorsExist ||
                    subscriptions === undefined
            ),
        [prefix, prefixErrorsExist, subscriptions]
    );

    const onClick = async (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        setLoading(true);

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

            const processedValues = emailsExistForPrefix
                ? value.filter((email) => !existingEmails[key].includes(email))
                : value;

            processedValues
                .map((email): [string, string] => [key, email])
                .forEach((subscriptionMetadata) => {
                    subscriptionsToCreate.push(subscriptionMetadata);
                });
        });

        const deletedSubscriptions = Object.entries(subscriptionsToCancel).map(
            ([key, emails]) => {
                return deleteNotificationSubscription(key, emails);
            }
        );

        const createdSubscription = createNotificationSubscription(
            subscriptionsToCreate.map(([key, email]) => ({
                catalog_prefix: key,
                email,
            }))
        );

        const responses = await Promise.all([
            ...deletedSubscriptions,
            createdSubscription,
        ]);

        // The create could be undefined and this was easier to mark than tweak logic
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        const errors = responses.filter((r) => r?.error);

        if (!hasLength(errors)) {
            hydrate();
            closeDialog();
        }

        setLoading(false);
    };

    return (
        <SafeLoadingButton
            variant="contained"
            size="small"
            disabled={disabled}
            loading={loading}
            onClick={onClick}
        >
            <FormattedMessage id="cta.save" />
        </SafeLoadingButton>
    );
}

export default SaveButton;
