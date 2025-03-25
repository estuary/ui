import type { SelectTableStoreNames } from 'stores/names';
import type { SelectableTableStore } from 'stores/Tables/Store';
import { Button } from '@mui/material';
import { authenticatedRoutes } from 'app/routes';
import { useZustandStore } from 'context/Zustand/provider';
import { GlobalSearchParams } from 'hooks/searchParams/useGlobalSearchParams';
import { FormattedMessage } from 'react-intl';
import { useNavigate } from 'react-router';
import { selectableTableStoreSelectors } from 'stores/Tables/Store';
import { getPathWithParams } from 'utils/misc-utils';

interface Props {
    selectableTableStoreName:
        | SelectTableStoreNames.CAPTURE
        | SelectTableStoreNames.COLLECTION
        | SelectTableStoreNames.ENTITY_SELECTOR
        | SelectTableStoreNames.MATERIALIZATION;
}

function Transform({ selectableTableStoreName }: Props) {
    const navigate = useNavigate();

    const selectedRows = useZustandStore<
        SelectableTableStore,
        SelectableTableStore['selected']
    >(selectableTableStoreName, selectableTableStoreSelectors.selected.get);

    const hasSelections = selectedRows.size > 0;

    const handlers = {
        transform: () => {
            const selectedRowsArray: string[] = [];

            selectedRows.forEach((value, _key) => {
                selectedRowsArray.push(value);
            });

            if (selectedRowsArray.length > 0) {
                navigate(
                    getPathWithParams(
                        authenticatedRoutes.collections.create.new.fullPath,
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
            onClick={handlers.transform}
        >
            <FormattedMessage id="cta.transform" />
        </Button>
    );
}

export default Transform;
