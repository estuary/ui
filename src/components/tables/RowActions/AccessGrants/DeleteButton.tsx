import { Button, Dialog } from '@mui/material';
import ProgressDialog from 'src/components/tables/RowActions/ProgressDialog';
import { useConfirmationModalContext } from 'src/context/Confirmation';
import { useZustandStore } from 'src/context/Zustand/provider';
import useAccessGrantRemovalDescriptions from 'src/hooks/useAccessGrantRemovalDescriptions';
import { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { SelectTableStoreNames } from 'src/stores/names';
import {
    SelectableTableStore,
    selectableTableStoreSelectors,
} from 'src/stores/Tables/Store';
import ConfirmationAlert from '../Shared/ConfirmationAlert';
import ConfirmationWithExplanation from '../Shared/ConfirmationWithExplination';
import GrantWhatIsChanging from './GrantWhatIsChanging';
import RevokeGrant from './RevokeGrant';
import {
    AccessGrantDeleteButtonProps,
    AccessGrantRowConfirmation,
} from './types';

// TODO (capabilities) - need to see if they remove their own capabilities
//  and then refresh local cache of access grants.
function DeleteButton({ selectTableStoreName }: AccessGrantDeleteButtonProps) {
    const { describeAllRemovals } = useAccessGrantRemovalDescriptions();

    const confirmationModalContext = useConfirmationModalContext();

    const [showProgress, setShowProgress] = useState<boolean>(false);
    const [targets, setTargets] = useState<AccessGrantRowConfirmation[]>([]);

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
            const grants: AccessGrantRowConfirmation[] = [];

            selectedRows.forEach((value, _key) => {
                const identifier =
                    selectTableStoreName ===
                    SelectTableStoreNames.ACCESS_GRANTS_USERS
                        ? (value?.user_full_name ??
                          value?.user_email ??
                          value?.subject_role ??
                          'User')
                        : value.subject_role;

                grants.push({
                    id: value.id,
                    details: describeAllRemovals(value),
                    message: (
                        <GrantWhatIsChanging
                            capability={value.capability}
                            identifier={identifier}
                            grantScope={value.object_role}
                        />
                    ),
                });
            });

            confirmationModalContext
                ?.showConfirmation({
                    dialogProps: {
                        maxWidth: 'md',
                    },
                    message: (
                        <ConfirmationWithExplanation
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
                        finished={handlers.resetState}
                        selectedEntities={targets}
                        renderComponent={(
                            item: AccessGrantRowConfirmation,
                            index,
                            onFinish
                        ) => (
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
