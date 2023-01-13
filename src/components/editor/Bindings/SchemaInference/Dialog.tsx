import { DiffEditor } from '@monaco-editor/react';
import { DataObject } from '@mui/icons-material';
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Typography,
    useTheme,
} from '@mui/material';
import { BindingsEditorSchemaSkeleton } from 'components/collection/CollectionSkeletons';
import MessageWithLink from 'components/content/MessageWithLink';
import InferenceDiffEditorHeader from 'components/editor/Bindings/SchemaInference/Dialog/DiffEditor/Header';
import UpdateSchemaButton from 'components/editor/Bindings/SchemaInference/Dialog/UpdateSchemaButton';
import {
    useBindingsEditorStore_inferredSpec,
    useBindingsEditorStore_loadingInferredSchema,
    useBindingsEditorStore_setInferredSpec,
    useBindingsEditorStore_setLoadingInferredSchema,
} from 'components/editor/Bindings/Store/hooks';
import { CollectionData } from 'components/editor/Bindings/types';
import { DEFAULT_HEIGHT } from 'components/editor/MonacoEditor';
import AlertBox from 'components/shared/AlertBox';
import {
    defaultOutline,
    glassBkgWithoutBlur,
    monacoEditorComponentBackground,
    monacoEditorWidgetBackground,
    secondaryButtonBackground,
    secondaryButtonHoverBackground,
} from 'context/Theme';
import { isEmpty } from 'lodash';
import { Dispatch, SetStateAction, useMemo, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useEffectOnce, useLocalStorage, useUnmountPromise } from 'react-use';
import getInferredSchema from 'services/schema-inference';
import { stringifyJSON } from 'services/stringify';
import { useResourceConfig_currentCollection } from 'stores/ResourceConfig/hooks';
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

const TITLE_ID = 'inferred-schema-dialog-title';

const DOCUMENT_THRESHOLD = 10000;

function SchemaInferenceDialog({
    collectionData,
    open,
    setOpen,
    height = DEFAULT_HEIGHT,
}: Props) {
    const theme = useTheme();

    // Bindings Editor Store
    const inferredSpec = useBindingsEditorStore_inferredSpec();
    const setInferredSpec = useBindingsEditorStore_setInferredSpec();

    const loadingInferredSchema =
        useBindingsEditorStore_loadingInferredSchema();
    const setLoadingInferredSchema =
        useBindingsEditorStore_setLoadingInferredSchema();

    // Resource Config Store
    const currentCollection = useResourceConfig_currentCollection();

    const [documentsRead, setDocumentsRead] = useState<
        number | null | undefined
    >(null);

    const [schemaUpdateErrored] = useState<boolean>(false);

    const [gatewayConfig] = useLocalStorage(
        LocalStorageKeys.GATEWAY,
        getStoredGatewayAuthConfig()
    );

    const originalSchema = useMemo(() => {
        return Object.hasOwn(collectionData.spec, 'readSchema')
            ? collectionData.spec.readSchema
            : collectionData.spec.schema;
    }, [collectionData.spec]);

    const resolveWhileMounted = useUnmountPromise();

    useEffectOnce(() => {
        if (currentCollection && gatewayConfig?.gateway_url) {
            resolveWhileMounted(
                getInferredSchema(gatewayConfig, currentCollection)
            )
                .then(
                    (response) => {
                        if (Object.hasOwn(collectionData.spec, 'schema')) {
                            const { schema, ...additionalSpecKeys } =
                                collectionData.spec;

                            setInferredSpec(
                                !isEmpty(response.schema)
                                    ? {
                                          writeSchema:
                                              collectionData.spec.schema,
                                          readSchema: response.schema,
                                          ...additionalSpecKeys,
                                      }
                                    : null
                            );
                        } else if (
                            Object.hasOwn(collectionData.spec, 'writeSchema')
                        ) {
                            const { writeSchema, ...additionalSpecKeys } =
                                collectionData.spec;

                            setInferredSpec(
                                !isEmpty(response.schema)
                                    ? {
                                          writeSchema:
                                              collectionData.spec.writeSchema,
                                          readSchema: response.schema,
                                          ...additionalSpecKeys,
                                      }
                                    : null
                            );
                        }

                        setDocumentsRead(response.documents_read);
                    },
                    (error) => {
                        setInferredSpec(error?.code === 404 ? null : undefined);

                        setDocumentsRead(undefined);
                    }
                )
                .finally(() => setLoadingInferredSchema(false));
        } else {
            setLoadingInferredSchema(false);
        }
    });

    const handlers = {
        closeConfirmationDialog: (event: React.MouseEvent<HTMLElement>) => {
            event.preventDefault();

            setOpen(false);
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
                    <FormattedMessage id="workflows.collectionSelector.schemaInference.message.schemaDiff" />
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

                {documentsRead && documentsRead < DOCUMENT_THRESHOLD ? (
                    <AlertBox
                        severity="warning"
                        short
                        title={
                            <Typography>
                                <FormattedMessage id="workflows.collectionSelector.schemaInference.alert.lowDocumentCount.header" />
                            </Typography>
                        }
                    >
                        <FormattedMessage id="workflows.collectionSelector.schemaInference.alert.lowDocumentCount.message" />
                    </AlertBox>
                ) : null}

                <Box sx={{ my: 3, border: defaultOutline[theme.palette.mode] }}>
                    <InferenceDiffEditorHeader />

                    {inferredSpec ? (
                        <>
                            <DiffEditor
                                height={`${height}px`}
                                original={stringifyJSON(originalSchema)}
                                modified={stringifyJSON(
                                    inferredSpec.readSchema
                                )}
                                theme={
                                    monacoEditorComponentBackground[
                                        theme.palette.mode
                                    ]
                                }
                                options={{ readOnly: true }}
                            />

                            <Box
                                sx={{
                                    p: 1,
                                    backgroundColor:
                                        monacoEditorWidgetBackground[
                                            theme.palette.mode
                                        ],
                                    borderTop:
                                        defaultOutline[theme.palette.mode],
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
                            {loadingInferredSchema ? (
                                <BindingsEditorSchemaSkeleton />
                            ) : inferredSpec === null ? (
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

                <UpdateSchemaButton
                    collectionData={collectionData}
                    setOpen={setOpen}
                />
            </DialogActions>
        </Dialog>
    ) : null;
}

export default SchemaInferenceDialog;
