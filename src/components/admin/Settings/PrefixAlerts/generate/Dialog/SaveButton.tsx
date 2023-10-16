import { LoadingButton } from '@mui/lab';
import { createNotificationPreference } from 'api/alerts';
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
    userId?: string;
}

function SaveButton({ disabled, prefix, setOpen, userId }: Props) {
    const hydrate = useZustandStore<
        SelectableTableStore,
        SelectableTableStore['hydrate']
    >(
        SelectTableStoreNames.PREFIX_ALERTS,
        selectableTableStoreSelectors.query.hydrate
    );

    const [loading, setLoading] = useState(false);

    const onClick = (event: React.MouseEvent<HTMLElement>) => {
        event.preventDefault();
        setLoading(true);

        if (userId) {
            const processedPrefix = appendWithForwardSlash(prefix);

            // Bundle insertions
            createNotificationPreference(processedPrefix, userId).then(
                (response) => {
                    if (response.error) {
                        console.log('save error 1', response.error);
                    } else if (hasLength(response.data)) {
                        hydrate();
                        setOpen(false);
                    }

                    setLoading(false);
                },
                (error) => {
                    console.log('save error 2', error);
                    setLoading(false);
                }
            );
        }
    };

    return (
        <LoadingButton
            variant="contained"
            size="small"
            disabled={disabled || !hasLength(prefix) || !userId}
            loading={loading}
            onClick={onClick}
        >
            <FormattedMessage id="cta.save" />
        </LoadingButton>
    );
}

export default SaveButton;
