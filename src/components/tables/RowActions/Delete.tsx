import { Button } from '@mui/material';
import { createDraftSpec } from 'api/draftSpecs';
import DeleteConfirmation from 'components/tables/RowActions/DeleteConfirmation';
import {
    SelectableTableStore,
    selectableTableStoreSelectors,
} from 'components/tables/Store';
import { useConfirmationModalContext } from 'context/Confirmation';
import { useZustandStore } from 'hooks/useZustand';
import { FormattedMessage } from 'react-intl';

function Delete() {
    const confirmationModalContext = useConfirmationModalContext();

    const selectedRows = useZustandStore<
        SelectableTableStore,
        SelectableTableStore['selected']
    >(selectableTableStoreSelectors.selected.get);

    const rows = useZustandStore<
        SelectableTableStore,
        SelectableTableStore['rows']
    >(selectableTableStoreSelectors.rows.get);

    const hasSelections = selectedRows.size > 0;

    const makeDeleteCall = async (deletingSpecs: any[]) => {
        console.log('Going to delete stuff now', deletingSpecs);
        const updateCalls: any[] = [];
        deletingSpecs.forEach((spec) => {
            updateCalls.push(
                createDraftSpec(spec.id, spec.catalog_name, null, 'capture')
            );
        });

        await Promise.all(updateCalls).then((values) => {
            console.log(values);
        });
    };

    const handlers = {
        delete: () => {
            if (hasSelections) {
                const deleting: string[] = [];
                const deletingSpecs: any[] = [];

                selectedRows.forEach((value: any, key: string) => {
                    deleting.push(rows.get(key).catalog_name);
                    deletingSpecs.push(rows.get(key));
                });

                confirmationModalContext
                    ?.showConfirmation({
                        message: <DeleteConfirmation deleting={deleting} />,
                    })
                    .then(async (confirmed: any) => {
                        if (confirmed) {
                            await makeDeleteCall(deletingSpecs);
                        }
                    })
                    .catch(() => {});
            }
        },
    };
    return (
        <Button onClick={() => handlers.delete()}>
            <FormattedMessage id="cta.delete" />
        </Button>
    );
}

export default Delete;
