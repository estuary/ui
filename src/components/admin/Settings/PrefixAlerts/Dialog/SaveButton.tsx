import { LoadingButton } from '@mui/lab';
import {
    createNotificationSubscription,
    deleteNotificationSubscription,
} from 'api/alerts';
import { useZustandStore } from 'context/Zustand/provider';
import { Dispatch, SetStateAction, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import {
    SelectableTableStore,
    selectableTableStoreSelectors,
} from 'stores/Tables/Store';
import { SelectTableStoreNames } from 'stores/names';
import { appendWithForwardSlash, hasLength } from 'utils/misc-utils';

interface Props {
    disabled: boolean;
    prefix: string;
    setOpen: Dispatch<SetStateAction<boolean>>;
    subscriptionsToCancel: string[];
    subscriptionsToCreate: string[];
}

function SaveButton({
    disabled,
    prefix,
    setOpen,
    subscriptionsToCancel,
    subscriptionsToCreate,
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

        const processedPrefix = appendWithForwardSlash(prefix);

        const createdSubscriptions = subscriptionsToCreate.map((email) =>
            createNotificationSubscription(processedPrefix, email)
        );

        const cancelledSubscriptions = subscriptionsToCancel.map((email) =>
            deleteNotificationSubscription(email, processedPrefix)
        );

        const responses = await Promise.all([
            ...createdSubscriptions,
            ...cancelledSubscriptions,
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
