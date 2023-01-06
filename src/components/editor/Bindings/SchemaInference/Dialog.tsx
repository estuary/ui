import { DiffEditor } from '@monaco-editor/react';
import { DataObject } from '@mui/icons-material';
import {
    Box,
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Stack,
    styled,
    Tooltip,
    tooltipClasses,
    TooltipProps,
    Typography,
    useTheme,
} from '@mui/material';
import { createDraftSpec, modifyDraftSpec } from 'api/draftSpecs';
import { getLiveSpecsByCatalogName } from 'api/liveSpecsExt';
import { BindingsEditorSchemaSkeleton } from 'components/collection/CollectionSkeletons';
import MessageWithLink from 'components/content/MessageWithLink';
import { useBindingsEditorStore_setCollectionData } from 'components/editor/Bindings/Store/hooks';
import { BindingsEditorState } from 'components/editor/Bindings/Store/types';
import { CollectionData } from 'components/editor/Bindings/types';
import { DEFAULT_HEIGHT } from 'components/editor/MonacoEditor';
import { useEditorStore_persistedDraftId } from 'components/editor/Store/hooks';
import AlertBox from 'components/shared/AlertBox';
import {
    glassBkgWithoutBlur,
    monacoEditorHeaderBackground,
    monacoEditorWidgetBackground,
    secondaryButtonBackground,
    secondaryButtonHoverBackground,
} from 'context/Theme';
import { isEmpty, isEqual } from 'lodash';
import { Dispatch, SetStateAction, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useEffectOnce, useLocalStorage } from 'react-use';
import getInferredSchema from 'services/schema-inference';
import { stringifyJSON } from 'services/stringify';
import { CallSupabaseResponse } from 'services/supabase';
import { useResourceConfig_currentCollection } from 'stores/ResourceConfig/hooks';
import { Schema } from 'types';
import {
    getStoredGatewayAuthConfig,
    LocalStorageKeys,
} from 'utils/localStorage-utils';

interface Props {
    collectionData: CollectionData;
    open: boolean;
    setOpen: Dispatch<SetStateAction<boolean>>;
    height?: number;
}

const CustomWidthTooltip = styled(({ className, ...props }: TooltipProps) => (
    <Tooltip {...props} classes={{ popper: className }} />
))({
    [`& .${tooltipClasses.tooltip}`]: {
        maxWidth: 400,
    },
    [`& .${tooltipClasses.popper}`]: {
        overflowWrap: 'break-word',
    },
});

const processDraftSpecResponse = (
    draftSpecResponse: CallSupabaseResponse<any>,
    schemaUpdateErrored: boolean,
    setSchemaUpdateErrored: Dispatch<SetStateAction<boolean>>,
    setCollectionData: BindingsEditorState['setCollectionData'],
    setOpen: Dispatch<SetStateAction<boolean>>
) => {
    if (draftSpecResponse.error) {
        setSchemaUpdateErrored(true);
    } else if (draftSpecResponse.data && draftSpecResponse.data.length > 0) {
        if (schemaUpdateErrored) {
            setSchemaUpdateErrored(false);
        }

        setCollectionData({
            spec: draftSpecResponse.data[0].spec,
            belongsToDraft: true,
        });

        setOpen(false);
    } else {
        setSchemaUpdateErrored(true);
    }
};

const TITLE_ID = 'inferred-schema-dialog-title';

function SchemaInferenceDialog({
    collectionData,
    open,
    setOpen,
    height = DEFAULT_HEIGHT,
}: Props) {
    const theme = useTheme();

    // Bindings Editor Store
    const setCollectionData = useBindingsEditorStore_setCollectionData();

    // Draft Editor Store
    const persistedDraftId = useEditorStore_persistedDraftId();

    // Resource Config Store
    const currentCollection = useResourceConfig_currentCollection();

    const [loading, setLoading] = useState<boolean>(true);
    const [inferredSchema, setInferredSchema] = useState<
        Schema | null | undefined
    >(null);
    const [documentsRead, setDocumentsRead] = useState<
        number | null | undefined
    >(null);

    const [schemaUpdateErrored, setSchemaUpdateErrored] =
        useState<boolean>(false);

    const [gatewayConfig] = useLocalStorage(
        LocalStorageKeys.GATEWAY,
        getStoredGatewayAuthConfig()
    );

    useEffectOnce(() => {
        if (currentCollection && gatewayConfig?.gateway_url) {
            getInferredSchema(gatewayConfig, currentCollection)
                .then(
                    (response) => {
                        setInferredSchema(
                            !isEmpty(response.schema)
                                ? {
                                      ...collectionData.spec,
                                      schema: response.schema,
                                  }
                                : null
                        );

                        setDocumentsRead(response.documents_read);
                    },
                    (error) => {
                        setInferredSchema(
                            error?.code === 404 ? null : undefined
                        );

                        setDocumentsRead(undefined);
                    }
                )
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    });

    const handlers = {
        closeConfirmationDialog: (event: React.MouseEvent<HTMLElement>) => {
            event.preventDefault();

            setOpen(false);
        },
        updateServer: async (event: React.MouseEvent<HTMLElement>) => {
            event.preventDefault();

            if (currentCollection && persistedDraftId && inferredSchema) {
                setSchemaUpdateErrored(false);
                setLoading(true);

                if (collectionData.belongsToDraft) {
                    const draftSpecResponse = await modifyDraftSpec(
                        inferredSchema,
                        {
                            draft_id: persistedDraftId,
                            catalog_name: currentCollection,
                        }
                    );

                    processDraftSpecResponse(
                        draftSpecResponse,
                        schemaUpdateErrored,
                        setSchemaUpdateErrored,
                        setCollectionData,
                        setOpen
                    );
                } else {
                    const liveSpecsResponse = await getLiveSpecsByCatalogName(
                        currentCollection,
                        'collection'
                    );

                    if (liveSpecsResponse.error) {
                        setSchemaUpdateErrored(true);
                    } else if (liveSpecsResponse.data) {
                        const { last_pub_id } = liveSpecsResponse.data[0];

                        const draftSpecResponse = await createDraftSpec(
                            persistedDraftId,
                            currentCollection,
                            inferredSchema,
                            'collection',
                            last_pub_id
                        );

                        processDraftSpecResponse(
                            draftSpecResponse,
                            schemaUpdateErrored,
                            setSchemaUpdateErrored,
                            setCollectionData,
                            setOpen
                        );
                    }
                }

                setLoading(false);
            } else {
                setSchemaUpdateErrored(true);
            }
        },
    };

    return currentCollection ? (
        <Dialog
            open={open}
            maxWidth="lg"
            aria-labelledby={TITLE_ID}
            sx={{
                '& .MuiPaper-root.MuiDialog-paper': {
                    backgroundColor: glassBkgWithoutBlur[theme.palette.mode],
                    borderRadius: 5,
                },
            }}
        >
            <DialogTitle
                component="div"
                sx={{ display: 'flex', alignItems: 'center' }}
            >
                <DataObject />

                <Typography variant="h6" sx={{ ml: 1 }}>
                    <FormattedMessage id="workflows.collectionSelector.schemaInference.header" />
                </Typography>
            </DialogTitle>

            <DialogContent>
                <Typography sx={{ mb: 2 }}>
                    <FormattedMessage id="workflows.collectionSelector.schemaInference.message" />
                </Typography>

                <Typography sx={{ mb: 4 }}>
                    <FormattedMessage
                        id="workflows.collectionSelector.schemaInference.message.schemaDiff"
                        values={{ documents_read: documentsRead ?? 0 }}
                    />
                </Typography>

                {schemaUpdateErrored ? (
                    <AlertBox
                        severity="error"
                        short
                        title={
                            <Typography>
                                <FormattedMessage id="workflows.collectionSelector.schemaInference.alert.generalError.header" />
                            </Typography>
                        }
                    >
                        <MessageWithLink messageID="workflows.collectionSelector.schemaInference.alert.patchService.message" />
                    </AlertBox>
                ) : null}

                <Box sx={{ my: 3 }}>
                    <Box
                        sx={{
                            p: 1,
                            height: 54,
                            backgroundColor:
                                monacoEditorHeaderBackground[
                                    theme.palette.mode
                                ],
                        }}
                    >
                        <Stack
                            direction="row"
                            sx={{
                                height: '100%',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                            }}
                        >
                            <CustomWidthTooltip
                                title={currentCollection}
                                placement="bottom-start"
                            >
                                <Typography noWrap sx={{ mr: 2 }}>
                                    {currentCollection}
                                </Typography>
                            </CustomWidthTooltip>

                            {loading ? (
                                <Box sx={{ px: 1, pt: 1 }}>
                                    <CircularProgress size="1.5rem" />
                                </Box>
                            ) : null}
                        </Stack>
                    </Box>

                    {inferredSchema ? (
                        <>
                            <DiffEditor
                                height={`${height}px`}
                                original={stringifyJSON(collectionData.spec)}
                                modified={stringifyJSON(inferredSchema)}
                                theme={
                                    theme.palette.mode === 'light'
                                        ? 'vs'
                                        : 'vs-dark'
                                }
                            />

                            <Box
                                sx={{
                                    p: 1,
                                    backgroundColor:
                                        monacoEditorWidgetBackground[
                                            theme.palette.mode
                                        ],
                                }}
                            >
                                <Typography variant="caption">
                                    <FormattedMessage
                                        id="workflows.collectionSelector.schemaInference.message.documentsRead"
                                        values={{
                                            documents_read: documentsRead ?? 0,
                                        }}
                                    />
                                </Typography>
                            </Box>
                        </>
                    ) : (
                        <Box
                            sx={{
                                p: 1,
                                backgroundColor:
                                    monacoEditorWidgetBackground[
                                        theme.palette.mode
                                    ],
                            }}
                        >
                            {loading ? (
                                <BindingsEditorSchemaSkeleton />
                            ) : inferredSchema === null ? (
                                <AlertBox
                                    severity="warning"
                                    short
                                    title={
                                        <Typography>
                                            <FormattedMessage id="workflows.collectionSelector.schemaInference.alert.noDocuments.header" />
                                        </Typography>
                                    }
                                >
                                    <Typography>
                                        <FormattedMessage id="workflows.collectionSelector.schemaInference.alert.noDocuments.message" />
                                    </Typography>
                                </AlertBox>
                            ) : (
                                <AlertBox
                                    severity="error"
                                    short
                                    title={
                                        <Typography>
                                            <FormattedMessage id="workflows.collectionSelector.schemaInference.alert.generalError.header" />
                                        </Typography>
                                    }
                                >
                                    <Typography>
                                        <FormattedMessage id="workflows.collectionSelector.schemaInference.alert.inferenceService.message" />
                                    </Typography>
                                </AlertBox>
                            )}
                        </Box>
                    )}
                </Box>
            </DialogContent>

            <DialogActions>
                <Button
                    onClick={handlers.closeConfirmationDialog}
                    sx={{
                        'backgroundColor':
                            secondaryButtonBackground[theme.palette.mode],
                        '&:hover': {
                            backgroundColor:
                                secondaryButtonHoverBackground[
                                    theme.palette.mode
                                ],
                        },
                    }}
                >
                    <FormattedMessage id="cta.cancel" />
                </Button>

                <Button
                    disabled={
                        !inferredSchema ||
                        isEqual(collectionData.spec, inferredSchema) ||
                        loading
                    }
                    onClick={handlers.updateServer}
                >
                    <FormattedMessage id="workflows.collectionSelector.schemaInference.cta.continue" />
                </Button>
            </DialogActions>
        </Dialog>
    ) : null;
}

export default SchemaInferenceDialog;
