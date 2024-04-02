import { LoadingButton } from '@mui/lab';
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
    // selectedTenant: string;
    setOpen: Dispatch<SetStateAction<boolean>>;
}

function SaveButton({
    disabled,
    // selectedTenant,
    setOpen,
}: Props) {
    const hydrate = useZustandStore<
        SelectableTableStore,
        SelectableTableStore['hydrate']
    >(
        SelectTableStoreNames.STORAGE_MAPPINGS,
        selectableTableStoreSelectors.query.hydrate
    );

    const [loading, setLoading] = useState(false);

    const onClick = async (event: React.MouseEvent<HTMLElement>) => {
        event.preventDefault();
        setLoading(true);

        const errors: string[] = [];

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
            disabled={disabled}
            loading={loading}
            onClick={onClick}
        >
            <FormattedMessage id="cta.save" />
        </LoadingButton>
    );
}

export default SaveButton;
