import {
    Button,
    Dialog,
    DialogContent,
    DialogTitle,
    Stack,
} from '@mui/material';
import DeleteConfirmation from 'components/tables/RowActions/Delete/Confirmation';
import DeleteProgress from 'components/tables/RowActions/Delete/Progress';
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

    const [deleting, setDeleting] = useState<any[]>([]);

    const selectedRows = useZustandStore<
        SelectableTableStore,
        SelectableTableStore['selected']
    >(selectableTableStoreSelectors.selected.get);

    const rows = useZustandStore<
        SelectableTableStore,
        SelectableTableStore['rows']
    >(selectableTableStoreSelectors.rows.get);

    const hasSelections = selectedRows.size > 0;

    const onFinish = (response: any) => {
        console.log('Finished delete', response);
    };

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
                            setDeleting(deletingSpecs);
                        }
                    })
                    .catch(() => {});
            }
        },
    };
    return (
        <>
            <Button onClick={() => handlers.delete()}>
                <FormattedMessage id="cta.delete" />
            </Button>
            <Dialog open={deleting.length > 0}>
                <DialogTitle>
                    <FormattedMessage id="common.deleting" />
                </DialogTitle>
                <DialogContent>
                    <Stack direction="column">
                        {deleting.length > 0
                            ? deleting.map((item, index) => (
                                  <DeleteProgress
                                      key={`Item-delete-${index}`}
                                      deleting={item}
                                      onFinish={onFinish}
                                  />
                              ))
                            : null}
                    </Stack>
                </DialogContent>
            </Dialog>
        </>
    );
}

export default DeleteButton;
