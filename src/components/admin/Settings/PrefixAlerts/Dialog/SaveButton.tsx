import { LoadingButton } from '@mui/lab';
import {
    createNotificationSubscription,
    deleteNotificationSubscription,
} from 'api/alerts';
import { EmailDictionary } from 'components/admin/Settings/PrefixAlerts/types';
import { useZustandStore } from 'context/Zustand/provider';
import { Dispatch, SetStateAction, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import {
    SelectableTableStore,
    selectableTableStoreSelectors,
} from 'stores/Tables/Store';
import { SelectTableStoreNames } from 'stores/names';
import { hasLength } from 'utils/misc-utils';

interface Props {
    disabled: boolean;
    existingEmails: EmailDictionary;
    prefix: string;
    setOpen: Dispatch<SetStateAction<boolean>>;
    updatedEmails: EmailDictionary;
}

function SaveButton({
    disabled,
    existingEmails,
    prefix,
    setOpen,
    updatedEmails,
}: Props) {
    const hydrate = useZustandStore<
        SelectableTableStore,
        SelectableTableStore['hydrate']
    >(
        SelectTableStoreNames.PREFIX_ALERTS,
        selectableTableStoreSelectors.query.hydrate
    );

    const [loading, setLoading] = useState(false);

    const onClick = async (event: React.MouseEvent<HTMLElement>) => {
        event.preventDefault();
        setLoading(true);

        const subscriptionsToCancel: [string, string][] = [];
        const subscriptionsToCreate: [string, string][] = [];

        Object.entries(updatedEmails).forEach(([key, value]) => {
            const emailsExistForPrefix = Object.hasOwn(existingEmails, key);

            if (emailsExistForPrefix) {
                existingEmails[key]
                    .filter((email) => !value.includes(email))
                    .map((email): [string, string] => [key, email])
                    .forEach((subscriptionMetadata) => {
                        subscriptionsToCancel.push(subscriptionMetadata);
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

        const cancelledSubscriptions = subscriptionsToCancel.map(
            ([key, email]) => deleteNotificationSubscription(email, key)
        );

        const createdSubscriptions = subscriptionsToCreate.map(([key, email]) =>
            createNotificationSubscription(key, email)
        );

        const responses = await Promise.all([
            ...cancelledSubscriptions,
            ...createdSubscriptions,
        ]);

        const errors = responses.filter((r) => r.error);

        if (!hasLength(errors)) {
            hydrate();
            setOpen(false);
        }

        setLoading(false);
    };

    return (
        <LoadingButton
            variant="contained"
            size="small"
            disabled={disabled || !hasLength(prefix)}
            loading={loading}
            onClick={onClick}
        >
            <FormattedMessage id="cta.save" />
        </LoadingButton>
    );
}

export default SaveButton;
