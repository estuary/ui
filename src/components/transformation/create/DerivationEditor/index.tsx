import { Box, Grid, Stack } from '@mui/material';
import EntitySaveButton from 'components/shared/Entity/Actions/SaveButton';
import MigrationList from 'components/transformation/create/DerivationEditor/Catalog/MigrationList';
import TransformList from 'components/transformation/create/DerivationEditor/Catalog/TransformList';
import DerivationEditorHeader from 'components/transformation/create/DerivationEditor/Header';
import ShuffleKeys from 'components/transformation/create/DerivationEditor/ShuffleKeys';
import SQLDataPreview from 'components/transformation/create/DerivationEditor/SQLDataPreview';
import SQLEditor from 'components/transformation/create/DerivationEditor/SQLEditor';
import EmptySQLEditor from 'components/transformation/create/DerivationEditor/SQLEditor/Empty';
import GitPodButton from 'components/transformation/create/GitPodButton';
import { intensifiedOutline } from 'context/Theme';
import { isEmpty } from 'lodash';
import { useMemo } from 'react';
import { CustomEvents } from 'services/logrocket';
import {
    useFormStateStore_exitWhenLogsClose,
    useFormStateStore_resetState,
    useFormStateStore_setFormState,
} from 'stores/FormState/hooks';
import { FormStatus } from 'stores/FormState/types';
import {
    useTransformationCreate_attributeType,
    useTransformationCreate_catalogName,
    useTransformationCreate_migrations,
    useTransformationCreate_transformConfigs,
} from 'stores/TransformationCreate/hooks';

interface Props {
    postWindowOpen: (window: Window | null) => void;
    closeDialog: () => void;
}

const EDITOR_HEIGHT = 363;

function DerivationEditor({ postWindowOpen, closeDialog }: Props) {
    // Form State Store
    const setFormState = useFormStateStore_setFormState();
    const resetFormState = useFormStateStore_resetState();
    const exitWhenLogsClose = useFormStateStore_exitWhenLogsClose();

    // Transformation Create Store
    const catalogName = useTransformationCreate_catalogName();
    const transformConfigs = useTransformationCreate_transformConfigs();
    const migrations = useTransformationCreate_migrations();
    const attributeType = useTransformationCreate_attributeType();

    const helpers = {
        callFailed: (formState: any) => {
            setFormState({
                status: FormStatus.FAILED,
                exitWhenLogsClose: false,
                ...formState,
            });
        },
        exit: () => {
            resetFormState();
            closeDialog();
        },
    };

    const handlers = {
        closeLogs: () => {
            setFormState({
                showLogs: false,
            });

            if (exitWhenLogsClose) {
                helpers.exit();
            }
        },
    };

    const showEditor = useMemo(
        () =>
            attributeType === 'transform'
                ? !isEmpty(transformConfigs)
                : !isEmpty(migrations),
        [attributeType, migrations, transformConfigs]
    );

    return (
        <Grid container>
            <DerivationEditorHeader />

            <Grid container wrap="nowrap">
                <Grid
                    item
                    xs={3}
                    sx={{
                        minWidth: 200,
                        display: 'flex',
                        flexDirection: 'column',
                    }}
                >
                    <TransformList />

                    <MigrationList />
                </Grid>

                <Grid
                    item
                    xs={5}
                    sx={{
                        minWidth: 300,
                        display: 'flex',
                        flexDirection: 'column',
                    }}
                >
                    <Box
                        sx={{
                            borderBottom: (theme) =>
                                intensifiedOutline[theme.palette.mode],
                            borderRight: (theme) =>
                                intensifiedOutline[theme.palette.mode],
                            borderLeft: (theme) =>
                                intensifiedOutline[theme.palette.mode],
                        }}
                    >
                        {catalogName && showEditor ? (
                            <SQLEditor
                                entityName={catalogName}
                                editorHeight={EDITOR_HEIGHT}
                            />
                        ) : (
                            <EmptySQLEditor editorHeight={EDITOR_HEIGHT} />
                        )}
                    </Box>

                    <ShuffleKeys />
                </Grid>

                <Grid
                    item
                    xs={4}
                    sx={{
                        minWidth: 300,
                        display: 'flex',
                        flexDirection: 'column',
                    }}
                >
                    <SQLDataPreview />
                </Grid>
            </Grid>

            <Grid item xs={12} sx={{ mt: 2 }}>
                <Stack
                    spacing={2}
                    direction="row"
                    sx={{ justifyContent: 'flex-end' }}
                >
                    <GitPodButton
                        postWindowOpen={postWindowOpen}
                        buttonVariant="outlined"
                    />

                    <EntitySaveButton
                        callFailed={helpers.callFailed}
                        taskNames={
                            typeof catalogName === 'string'
                                ? [catalogName]
                                : undefined
                        }
                        closeLogs={handlers.closeLogs}
                        logEvent={CustomEvents.COLLECTION_CREATE}
                    />
                </Stack>
            </Grid>
        </Grid>
    );
}

export default DerivationEditor;
