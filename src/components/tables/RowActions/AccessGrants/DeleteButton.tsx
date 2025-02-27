import { Button, Dialog } from '@mui/material';
import ProgressDialog from 'components/tables/RowActions/ProgressDialog';
import RowActionConfirmation from 'components/tables/RowActions/Shared/Confirmation';
import { useConfirmationModalContext } from 'context/Confirmation';
import { useUserStore } from 'context/User/useUserContextStore';
import { useZustandStore } from 'context/Zustand/provider';
import { useCallback, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { SelectTableStoreNames } from 'stores/names';
import {
    SelectableTableStore,
    selectableTableStoreSelectors,
} from 'stores/Tables/Store';
import { useShallow } from 'zustand/react/shallow';
import ConfirmationAlert from '../Shared/ConfirmationAlert';
import RevokeGrant from './RevokeGrant';
import { RowConfirmation } from './types';

interface Props {
    selectTableStoreName:
        | SelectTableStoreNames.ACCESS_GRANTS_USERS
        | SelectTableStoreNames.ACCESS_GRANTS_PREFIXES;
}

function DeleteButton({ selectTableStoreName }: Props) {
    const intl = useIntl();

    const userEmail = useUserStore(
        useShallow((state) => state.userDetails?.email)
    );

    const potentiallyDangerousUpdate = useCallback(
        (value: any) => {
            if (value.object_role === 'ops/dp/public/') {
                return true;
            }

            if (value.capability === 'admin') {
                if (value.subject_role === value.object_role) {
                    return true;
                }

                if (userEmail && value.user_email === userEmail) {
                    return true;
                }
            }

            return false;
        },
        [userEmail]
    );

    const confirmationModalContext = useConfirmationModalContext();

    const [showProgress, setShowProgress] = useState<boolean>(false);
    const [targets, setTargets] = useState<RowConfirmation[]>([]);

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
            const grants: RowConfirmation[] = [];

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
                        highlight: potentiallyDangerousUpdate(value),
                        message: intl.formatMessage(
                            { id: 'admin.users.confirmation.listItem' },
                            { identifier, capability: value.capability }
                        ),
                    });
                } else {
                    grants.push({
                        id: value.id,
                        highlight: potentiallyDangerousUpdate(value),
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
                            message={
                                <ConfirmationAlert messageId="admin.grants.confirmation.alert" />
                            }
                            selected={grants}
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
                <FormattedMessage id="cta.remove" />
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
                                runningMessageID="common.removing"
                                selectTableStoreName={selectTableStoreName}
                                successMessageID="common.removed"
                            />
                        )}
                    />
                ) : null}
            </Dialog>
        </>
    );
}

export default DeleteButton;
