import { Button, Dialog } from '@mui/material';
import ProgressDialog from 'components/tables/RowActions/ProgressDialog';
import RowActionConfirmation from 'components/tables/RowActions/Shared/Confirmation';
import { useConfirmationModalContext } from 'context/Confirmation';
import { useZustandStore } from 'context/Zustand/provider';
import { useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import {
    SelectableTableStore,
    selectableTableStoreSelectors,
} from 'stores/Tables/Store';
import { SelectTableStoreNames } from 'stores/names';
import ConfirmationAlert from '../Shared/ConfirmationAlert';
import RevokeGrant from './RevokeGrant';

interface Props {
    selectTableStoreName:
        | SelectTableStoreNames.ACCESS_GRANTS_USERS
        | SelectTableStoreNames.ACCESS_GRANTS_PREFIXES;
}

function DeleteButton({ selectTableStoreName }: Props) {
    const intl = useIntl();

    const confirmationModalContext = useConfirmationModalContext();

    const [showProgress, setShowProgress] = useState<boolean>(false);
    const [targets, setTargets] = useState<{ id: string; message: string }[]>(
        []
    );

    const setAllSelected = useZustandStore<
        SelectableTableStore,
        SelectableTableStore['setAllSelected']
    >(selectTableStoreName, selectableTableStoreSelectors.selected.setAll);

    const selectedRows = useZustandStore<
        SelectableTableStore,
        SelectableTableStore['selected']
    >(selectTableStoreName, selectableTableStoreSelectors.selected.get);

    const selectionsExist = selectedRows.size > 0;

    const handlers = {
        showConfirmationDialog: () => {
            const grants: { id: string; message: string }[] = [];

            selectedRows.forEach((value, _key) => {
                if (
                    selectTableStoreName ===
                    SelectTableStoreNames.ACCESS_GRANTS_USERS
                ) {
                    const identifier: string =
                        value?.user_full_name ??
                        value?.user_email ??
                        value?.subject_role ??
                        'User';

                    grants.push({
                        id: value.id,
                        message: intl.formatMessage(
                            { id: 'admin.users.confirmation.listItem' },
                            { identifier, capability: value.capability }
                        ),
                    });
                } else {
                    grants.push({
                        id: value.id,
                        message: intl.formatMessage(
                            { id: 'admin.prefix.confirmation.listItem' },
                            {
                                subjectRole: value.subject_role,
                                capability: value.capability,
                                objectRole: value.object_role,
                            }
                        ),
                    });
                }
            });

            confirmationModalContext
                ?.showConfirmation({
                    message: (
                        <RowActionConfirmation
                            selected={grants.map(({ message }) => message)}
                            message={
                                <ConfirmationAlert messageId="admin.grants.confirmation.alert" />
                            }
                        />
                    ),
                })
                .then(async (confirmed: any) => {
                    if (confirmed) {
                        setShowProgress(true);
                        setTargets(grants);
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
                <FormattedMessage id="cta.revoke" />
            </Button>

            <Dialog open={showProgress} maxWidth="md">
                {targets.length > 0 ? (
                    <ProgressDialog
                        selectedEntities={targets}
                        finished={handlers.resetState}
                        renderComponent={(item, index, onFinish) => (
                            <RevokeGrant
                                key={`revoke-grant-${index}`}
                                grant={item}
                                onFinish={onFinish}
                                runningMessageID="common.revoking"
                                selectTableStoreName={selectTableStoreName}
                                successMessageID="common.revoked"
                            />
                        )}
                    />
                ) : null}
            </Dialog>
        </>
    );
}

export default DeleteButton;
