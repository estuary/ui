import { Button, Dialog } from '@mui/material';
import DeleteConfirmation from 'components/tables/RowActions/Delete/Confirmation';
import DeleteProgress from 'components/tables/RowActions/Delete/Progress';
import ProgressDialog from 'components/tables/RowActions/ProgressDialog';
import {
    SelectableTableStore,
    selectableTableStoreSelectors,
} from 'components/tables/Store';
import { useConfirmationModalContext } from 'context/Confirmation';
import { useZustandStore } from 'hooks/useZustand';
import { useState } from 'react';
import { FormattedMessage } from 'react-intl';

function DeleteButton() {
    const confirmationModalContext = useConfirmationModalContext();

    const [showProgress, setShowProgress] = useState(false);
    const [deleting, setDeleting] = useState<any[]>([]);

    const selectedRows = useZustandStore<
        SelectableTableStore,
        SelectableTableStore['selected']
    >(selectableTableStoreSelectors.selected.get);

    const setAllSelected = useZustandStore<
        SelectableTableStore,
        SelectableTableStore['setAllSelected']
    >(selectableTableStoreSelectors.selected.setAll);

    const rows = useZustandStore<
        SelectableTableStore,
        SelectableTableStore['rows']
    >(selectableTableStoreSelectors.rows.get);

    const hasSelections = selectedRows.size > 0;

    const handlers = {
        delete: () => {
            if (hasSelections) {
                const deleteList: string[] = [];
                const deletingSpecs: any[] = [];

                selectedRows.forEach((value: any, key: string) => {
                    deleteList.push(rows.get(key).catalog_name);
                    deletingSpecs.push(rows.get(key));
                });

                confirmationModalContext
                    ?.showConfirmation({
                        message: <DeleteConfirmation deleting={deleteList} />,
                    })
                    .then(async (confirmed: any) => {
                        if (confirmed) {
                            setShowProgress(true);
                            setDeleting(deletingSpecs);
                        }
                    })
                    .catch(() => {});
            }
        },
        finished: () => {
            setDeleting([]);
            setAllSelected(false);
            setShowProgress(false);
        },
    };
    return (
        <>
            <Button onClick={() => handlers.delete()}>
                <FormattedMessage id="cta.delete" />
            </Button>
            <Dialog open={showProgress}>
                {deleting.length > 0 ? (
                    <ProgressDialog
                        selectedEntities={deleting}
                        finished={handlers.finished}
                        renderComponent={(item, index, onFinish) => (
                            <DeleteProgress
                                key={`Item-delete-${index}`}
                                deleting={item}
                                onFinish={onFinish}
                            />
                        )}
                    />
                ) : null}
            </Dialog>
        </>
    );
}

export default DeleteButton;
