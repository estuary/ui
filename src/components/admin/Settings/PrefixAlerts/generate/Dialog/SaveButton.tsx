import { LoadingButton } from '@mui/lab';
import { createNotificationSubscription } from 'api/alerts';
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
    emails: string[];
    prefix: string;
    setOpen: Dispatch<SetStateAction<boolean>>;
}

function SaveButton({ disabled, prefix, setOpen, emails }: Props) {
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

        // Bundle insertions
        const pendingSubscriptions = emails.map((email) =>
            createNotificationSubscription(processedPrefix, email)
        );

        const responses = await Promise.all(pendingSubscriptions);

        const errors = responses.filter((r) => r.error);

        if (!hasLength(errors)) {
            hydrate();
            setOpen(false);
        }

        setLoading(false);
    };

    console.log('dis', disabled);
    console.log('pref', prefix);
    console.log('em', emails);

    return (
        <LoadingButton
            variant="contained"
            size="small"
            disabled={disabled || !hasLength(prefix) || !hasLength(emails)}
            loading={loading}
            onClick={onClick}
        >
            <FormattedMessage id="cta.save" />
        </LoadingButton>
    );
}

export default SaveButton;
