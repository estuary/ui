import { Button } from '@mui/material';

import { FormattedMessage } from 'react-intl';
import { useNavigate } from 'react-router';

import { authenticatedRoutes } from 'src/app/routes';
import { useZustandStore } from 'src/context/Zustand/provider';
import { GlobalSearchParams } from 'src/hooks/searchParams/useGlobalSearchParams';
import { SelectTableStoreNames } from 'src/stores/names';
import {
    SelectableTableStore,
    selectableTableStoreSelectors,
} from 'src/stores/Tables/Store';
import { getPathWithParams } from 'src/utils/misc-utils';

// TODO (materialize collections) materializing specific collections
//  has not been implemented. Updated typing before implementing to
//  make coding easier.
interface Props {
    selectableTableStoreName:
        | SelectTableStoreNames.CAPTURE
        | SelectTableStoreNames.COLLECTION
        | SelectTableStoreNames.ENTITY_SELECTOR
        | SelectTableStoreNames.MATERIALIZATION;
}

function Materialize({ selectableTableStoreName }: Props) {
    const navigate = useNavigate();

    const selectedRows = useZustandStore<
        SelectableTableStore,
        SelectableTableStore['selected']
    >(selectableTableStoreName, selectableTableStoreSelectors.selected.get);

    const hasSelections = selectedRows.size > 0;

    const handlers = {
        materialize: () => {
            const selectedRowsArray: string[] = [];

            selectedRows.forEach((value, _key) => {
                selectedRowsArray.push(value);
            });

            if (selectedRowsArray.length > 0) {
                navigate(
                    getPathWithParams(
                        authenticatedRoutes.materializations.create.fullPath,
                        {
                            [GlobalSearchParams.PREFILL_LIVE_SPEC_ID]:
                                selectedRowsArray,
                        }
                    )
                );
            }
        },
    };

    return (
        <Button
            variant="outlined"
            disabled={!hasSelections}
            onClick={handlers.materialize}
        >
            <FormattedMessage id="cta.materialize" />
        </Button>
    );
}

export default Materialize;
