import { Button, Dialog } from '@mui/material';
import ProgressDialog from 'src/components/tables/RowActions/ProgressDialog';
import { useConfirmationModalContext } from 'src/context/Confirmation';
import { useZustandStore } from 'src/context/Zustand/provider';
import { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import {
    SelectableTableStore,
    selectableTableStoreSelectors,
} from 'src/stores/Tables/Store';
import { RowConfirmation } from '../types';
import { RowActionButtonProps } from './types';

function RowActionButton({
    messageID,
    renderConfirmationMessage,
    renderProgress,
    selectableTableStoreName,
}: RowActionButtonProps) {
    const confirmationModalContext = useConfirmationModalContext();

    const [showProgress, setShowProgress] = useState(false);
    const [targets, setTargets] = useState<RowConfirmation[]>([]);

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

    const resetActionSettings = useZustandStore<
        SelectableTableStore,
        SelectableTableStore['resetActionSettings']
    >(
        selectableTableStoreName,
        selectableTableStoreSelectors.actionSettings.reset
    );

    const hasSelections = selectedRows.size > 0;

    const handlers = {
        action: () => {
            if (hasSelections) {
                const selectedNames: string[] = [];
                const selectedSpecs: any[] = [];

                selectedRows.forEach((_value: any, key: string) => {
                    selectedNames.push(rows.get(key).catalog_name);
                    selectedSpecs.push(rows.get(key));
                });

                confirmationModalContext
                    ?.showConfirmation({
                        message: renderConfirmationMessage(selectedNames),
                    })
                    .then(async (confirmed: any) => {
                        if (confirmed) {
                            setShowProgress(true);
                            setTargets(selectedSpecs);
                        } else {
                            resetActionSettings();
                        }
                    })
                    .catch(() => {});
            }
        },
        finished: () => {
            setTargets([]);
            setAllSelected(false);
            setShowProgress(false);
            resetActionSettings();
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
