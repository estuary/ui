import type { RowConfirmation } from 'src/components/tables/RowActions/types';
import type { SelectableTableStore } from 'src/stores/Tables/Store';

import { useState } from 'react';

import { Button, Dialog } from '@mui/material';

import { FormattedMessage } from 'react-intl';

import { unauthenticatedRoutes } from 'src/app/routes';
import ConfirmationMessage from 'src/components/tables/RowActions/AccessLinks/ConfirmationMessage';
import DisableDirective from 'src/components/tables/RowActions/AccessLinks/DisableDirective';
import ProgressDialog from 'src/components/tables/RowActions/ProgressDialog';
import RowActionConfirmation from 'src/components/tables/RowActions/Shared/Confirmation';
import { useConfirmationModalContext } from 'src/context/Confirmation';
import { useZustandStore } from 'src/context/Zustand/provider';
import { GlobalSearchParams } from 'src/hooks/searchParams/useGlobalSearchParams';
import { SelectTableStoreNames } from 'src/stores/names';
import { selectableTableStoreSelectors } from 'src/stores/Tables/Store';
import { getPathWithParams } from 'src/utils/misc-utils';

const selectableTableStoreName = SelectTableStoreNames.ACCESS_GRANTS_LINKS;

const baseURL = `${window.location.origin}${unauthenticatedRoutes.login.path}`;

function DisableButton() {
    const confirmationModalContext = useConfirmationModalContext();

    const [showProgress, setShowProgress] = useState<boolean>(false);
    const [targets, setTargets] = useState<RowConfirmation[]>([]);

    const setAllSelected = useZustandStore<
        SelectableTableStore,
        SelectableTableStore['setAllSelected']
    >(selectableTableStoreName, selectableTableStoreSelectors.selected.setAll);

    const selectedRows = useZustandStore<
        SelectableTableStore,
        SelectableTableStore['selected']
    >(selectableTableStoreName, selectableTableStoreSelectors.selected.get);

    const selectionsExist = selectedRows.size > 0;

    const handlers = {
        showConfirmationDialog: () => {
            const selectedAccessLinks: string[] = [];
            const selectedDirectiveIds: string[] = [];
            const selectedLinkConfigs: RowConfirmation[] = [];

            selectedRows.forEach((value, key) => {
                const accessLink = getPathWithParams(baseURL, {
                    [GlobalSearchParams.GRANT_TOKEN]: value,
                });

                selectedAccessLinks.push(accessLink);
                selectedDirectiveIds.push(key);
                selectedLinkConfigs.push({ id: key, message: accessLink });
            });

            confirmationModalContext
                ?.showConfirmation({
                    message: (
                        <RowActionConfirmation
                            selected={selectedAccessLinks}
                            message={<ConfirmationMessage />}
                        />
                    ),
                })
                .then(async (confirmed: any) => {
                    if (confirmed) {
                        setShowProgress(true);
                        setTargets(selectedLinkConfigs);
                    }
                })
                .catch(() => {});
        },
        resetState: () => {
            setTargets([]);
            setAllSelected(false);
            setShowProgress(false);
        },
    };

    return (
        <>
            <Button
                variant="outlined"
                disabled={!selectionsExist}
                onClick={handlers.showConfirmationDialog}
            >
                <FormattedMessage id="cta.disable" />
            </Button>

            <Dialog open={showProgress} maxWidth="md">
                {targets.length > 0 ? (
                    <ProgressDialog
                        selectedEntities={targets}
                        finished={handlers.resetState}
                        renderComponent={(item, index, onFinish) => (
                            <DisableDirective
                                key={`remove-directive-${index}`}
                                linkConfig={item}
                                successIntlKey="common.disabled"
                                runningIntlKey="common.disabling"
                                onFinish={onFinish}
                            />
                        )}
                    />
                ) : null}
            </Dialog>
        </>
    );
}

export default DisableButton;
