import type { GroupedRowActionButtonProps } from 'src/components/tables/RowActions/Shared/types';
import type { RowConfirmation } from 'src/components/tables/RowActions/types';
import type { SelectableTableStore } from 'src/stores/Tables/Store';

import { useState } from 'react';

import { Button, Dialog } from '@mui/material';

import { useIntl } from 'react-intl';

import GroupedProgressDialog from 'src/components/tables/RowActions/GroupedProgressDialog';
import { useConfirmationModalContext } from 'src/context/Confirmation';
import { useZustandStore } from 'src/context/Zustand/provider';
import { selectableTableStoreSelectors } from 'src/stores/Tables/Store';

function GroupedRowActionButton({
    messageIntlKey,
    renderConfirmationMessage,
    renderProgress,
    selectableTableStoreName,
}: GroupedRowActionButtonProps) {
    const intl = useIntl();

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
                {intl.formatMessage({ id: messageIntlKey })}
            </Button>

            <Dialog open={showProgress} maxWidth="md">
                {targets.length > 0 ? (
                    <GroupedProgressDialog
                        selectedEntities={targets}
                        finished={handlers.finished}
                        renderComponent={renderProgress}
                    />
                ) : null}
            </Dialog>
        </>
    );
}

export default GroupedRowActionButton;
