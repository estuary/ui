import { Button, Dialog } from '@mui/material';
import ProgressDialog from 'components/tables/RowActions/ProgressDialog';
import RowActionConfirmation from 'components/tables/RowActions/Shared/Confirmation';
import { useConfirmationModalContext } from 'context/Confirmation';
import { useZustandStore } from 'context/Zustand/provider';
import { ReactNode, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { SelectTableStoreNames } from 'stores/names';
import {
    SelectableTableStore,
    selectableTableStoreSelectors,
} from 'stores/Tables/Store';

interface Props {
    confirmationMessage?: ReactNode;
    renderProgress: (
        item: any,
        index: number,
        onFinish: (response: any) => void
    ) => ReactNode;
    messageID: string;
    selectableTableStoreName:
        | SelectTableStoreNames.CAPTURE
        | SelectTableStoreNames.COLLECTION
        | SelectTableStoreNames.MATERIALIZATION;
}

function RowActionButton({
    confirmationMessage,
    messageID,
    renderProgress,
    selectableTableStoreName,
}: Props) {
    const confirmationModalContext = useConfirmationModalContext();

    const [showProgress, setShowProgress] = useState(false);
    const [targets, setTargets] = useState<any[]>([]);

    const selectedRows = useZustandStore<
        SelectableTableStore,
        SelectableTableStore['selected']
    >(selectableTableStoreName, selectableTableStoreSelectors.selected.get);

    const setAllSelected = useZustandStore<
        SelectableTableStore,
        SelectableTableStore['setAllSelected']
    >(selectableTableStoreName, selectableTableStoreSelectors.selected.setAll);

    const rows = useZustandStore<
        SelectableTableStore,
        SelectableTableStore['rows']
    >(selectableTableStoreName, selectableTableStoreSelectors.rows.get);

    const hasSelections = selectedRows.size > 0;

    const handlers = {
        action: () => {
            if (hasSelections) {
                const selectedNames: string[] = [];
                const selectedSpecs: any[] = [];

                selectedRows.forEach((value: any, key: string) => {
                    selectedNames.push(rows.get(key).catalog_name);
                    selectedSpecs.push(rows.get(key));
                });

                confirmationModalContext
                    ?.showConfirmation({
                        message: (
                            <RowActionConfirmation
                                selected={selectedNames}
                                message={confirmationMessage}
                            />
                        ),
                    })
                    .then(async (confirmed: any) => {
                        if (confirmed) {
                            setShowProgress(true);
                            setTargets(selectedSpecs);
                        }
                    })
                    .catch(() => {});
            }
        },
        finished: () => {
            setTargets([]);
            setAllSelected(false);
            setShowProgress(false);
        },
    };

    return (
        <>
            <Button onClick={() => handlers.action()}>
                <FormattedMessage id={messageID} />
            </Button>

            <Dialog open={showProgress} maxWidth="md">
                {targets.length > 0 ? (
                    <ProgressDialog
                        selectedEntities={targets}
                        finished={handlers.finished}
                        renderComponent={renderProgress}
                    />
                ) : null}
            </Dialog>
        </>
    );
}

export default RowActionButton;
