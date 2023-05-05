import { Button, Dialog } from '@mui/material';
import { unauthenticatedRoutes } from 'app/routes';
import ConfirmationMessage from 'components/tables/RowActions/AccessLinks/ConfirmationMessage';
import DisableDirective from 'components/tables/RowActions/AccessLinks/DisableDirective';
import ProgressDialog from 'components/tables/RowActions/ProgressDialog';
import RowActionConfirmation from 'components/tables/RowActions/Shared/Confirmation';
import { useConfirmationModalContext } from 'context/Confirmation';
import { useZustandStore } from 'context/Zustand/provider';
import { GlobalSearchParams } from 'hooks/searchParams/useGlobalSearchParams';
import { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { SelectTableStoreNames } from 'stores/names';
import {
    SelectableTableStore,
    selectableTableStoreSelectors,
} from 'stores/Tables/Store';
import { getPathWithParams } from 'utils/misc-utils';

const selectableTableStoreName = SelectTableStoreNames.ACCESS_GRANTS_LINKS;

const baseURL = `${window.location.origin}${unauthenticatedRoutes.login.path}`;

function DisableButton() {
    const confirmationModalContext = useConfirmationModalContext();

    const [showProgress, setShowProgress] = useState<boolean>(false);
    const [targets, setTargets] = useState<
        { directiveId: string; accessLink: string }[]
    >([]);

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
            const selectedLinkConfigs: {
                directiveId: string;
                accessLink: string;
            }[] = [];

            selectedRows.forEach((value, key) => {
                const accessLink = getPathWithParams(baseURL, {
                    [GlobalSearchParams.GRANT_TOKEN]: value,
                });

                selectedAccessLinks.push(accessLink);

                selectedDirectiveIds.push(key);

                selectedLinkConfigs.push({ directiveId: key, accessLink });
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
                                successMessageID="common.disabled"
                                runningMessageID="common.disabling"
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
