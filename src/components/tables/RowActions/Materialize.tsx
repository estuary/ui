import { Button } from '@mui/material';
import { authenticatedRoutes } from 'app/Authenticated';
import {
    SelectableTableStore,
    selectableTableStoreSelectors,
} from 'components/tables/Store';
import { SelectTableStoreNames, useZustandStore } from 'context/Zustand';
import { GlobalSearchParams } from 'hooks/searchParams/useGlobalSearchParams';
import { FormattedMessage } from 'react-intl';
import { useNavigate } from 'react-router';
import { getPathWithParams } from 'utils/misc-utils';

interface Props {
    selectableTableStoreName:
        | SelectTableStoreNames.CAPTURE
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

            selectedRows.forEach((_value, key) => {
                selectedRowsArray.push(key);
            });

            if (selectedRowsArray.length > 0) {
                navigate(
                    getPathWithParams(
                        authenticatedRoutes.materializations.create.fullPath,
                        {
                            [GlobalSearchParams.LIVE_SPEC_ID]:
                                selectedRowsArray,
                        }
                    )
                );
            }
        },
    };

    return (
        <Button disabled={!hasSelections} onClick={handlers.materialize}>
            <FormattedMessage id="cta.materialize" />
        </Button>
    );
}

export default Materialize;
