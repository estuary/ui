import { DiffEditor } from '@monaco-editor/react';
import { DataObject, Refresh } from '@mui/icons-material';
import {
    Box,
    Button,
    CircularProgress,
    IconButton,
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
import { CollectionData } from 'components/editor/Bindings/types';
import {
    DEFAULT_HEIGHT,
    DEFAULT_TOOLBAR_HEIGHT,
} from 'components/editor/MonacoEditor';
import { useEditorStore_persistedDraftId } from 'components/editor/Store/hooks';
import AlertBox from 'components/shared/AlertBox';
import { monacoEditor } from 'context/Theme';
import { isEmpty, isEqual } from 'lodash';
import { Dispatch, SetStateAction, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useEffectOnce, useLocalStorage } from 'react-use';
import getInferredSchema, {
    InferSchemaResponse,
} from 'services/schema-inference';
import { stringifyJSON } from 'services/stringify';
import { CallSupabaseResponse } from 'services/supabase';
import { Schema } from 'types';
import {
    getStoredGatewayAuthConfig,
    LocalStorageKeys,
} from 'utils/localStorage-utils';

interface Props {
    catalogName: string;
    collectionData: CollectionData;
    setCollectionData: Dispatch<
        SetStateAction<CollectionData | null | undefined>
    >;
    height?: number;
    toolbarHeight?: number;
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

const handleInferredSchemaSuccess = (
    response: InferSchemaResponse,
    collectionSchema: Schema,
    setInferredSchema: Dispatch<SetStateAction<Schema | null | undefined>>,
    setLoading: Dispatch<SetStateAction<boolean>>
) => {
    setInferredSchema(
        !isEmpty(response.schema)
            ? { ...collectionSchema, schema: response.schema }
            : null
    );

    setLoading(false);
};

const handleInferredSchemaFailure = (
    error: any,
    setInferredSchema: Dispatch<SetStateAction<Schema | null | undefined>>,
    setLoading: Dispatch<SetStateAction<boolean>>
) => {
    setInferredSchema(error?.code === 404 ? null : undefined);

    setLoading(false);
};

const processDraftSpecResponse = (
    draftSpecResponse: CallSupabaseResponse<any>,
    schemaUpdateErrored: boolean,
    setSchemaUpdateErrored: Dispatch<SetStateAction<boolean>>,
    setLoading: Dispatch<SetStateAction<boolean>>,
    setCollectionData: Dispatch<
        SetStateAction<CollectionData | null | undefined>
    >
) => {
    if (draftSpecResponse.error) {
        setSchemaUpdateErrored(true);
        setLoading(false);
    } else if (draftSpecResponse.data && draftSpecResponse.data.length > 0) {
        if (schemaUpdateErrored) {
            setSchemaUpdateErrored(false);
        }

        setCollectionData({
            spec: draftSpecResponse.data[0].spec,
            belongsToDraft: true,
        });

        setLoading(false);
    } else {
        setSchemaUpdateErrored(true);
        setLoading(false);
    }
};

function InferredSchema({
    catalogName,
    collectionData,
    setCollectionData,
    height = DEFAULT_HEIGHT,
    toolbarHeight = DEFAULT_TOOLBAR_HEIGHT,
}: Props) {
    const theme = useTheme();

    // Draft Editor Store
    const persistedDraftId = useEditorStore_persistedDraftId();

    const [loading, setLoading] = useState<boolean>(true);
    const [inferredSchema, setInferredSchema] = useState<
        Schema | null | undefined
    >(null);

    const [schemaUpdateErrored, setSchemaUpdateErrored] =
        useState<boolean>(false);

    const [gatewayConfig] = useLocalStorage(
        LocalStorageKeys.GATEWAY,
        getStoredGatewayAuthConfig()
    );

    useEffectOnce(() => {
        if (gatewayConfig?.gateway_url) {
            getInferredSchema(gatewayConfig, catalogName).then(
                (response) =>
                    handleInferredSchemaSuccess(
                        response,
                        collectionData.spec,
                        setInferredSchema,
                        setLoading
                    ),
                (error) =>
                    handleInferredSchemaFailure(
                        error,
                        setInferredSchema,
                        setLoading
                    )
            );
        } else {
            setLoading(false);
        }
    });

    const handlers = {
        refreshInferredSchema: (event: React.MouseEvent<HTMLElement>) => {
            event.preventDefault();

            setSchemaUpdateErrored(false);
            setLoading(true);

            if (gatewayConfig?.gateway_url) {
                getInferredSchema(gatewayConfig, catalogName).then(
                    (response) =>
                        handleInferredSchemaSuccess(
                            response,
                            collectionData.spec,
                            setInferredSchema,
                            setLoading
                        ),
                    (error) =>
                        handleInferredSchemaFailure(
                            error,
                            setInferredSchema,
                            setLoading
                        )
                );
            } else {
                setLoading(false);
            }
        },
        updateServer: async (event: React.MouseEvent<HTMLElement>) => {
            event.preventDefault();

            if (persistedDraftId && inferredSchema) {
                setSchemaUpdateErrored(false);
                setLoading(true);

                if (collectionData.belongsToDraft) {
                    const draftSpecResponse = await modifyDraftSpec(
                        inferredSchema,
                        {
                            draft_id: persistedDraftId,
                            catalog_name: catalogName,
                        }
                    );

                    processDraftSpecResponse(
                        draftSpecResponse,
                        schemaUpdateErrored,
                        setSchemaUpdateErrored,
                        setLoading,
                        setCollectionData
                    );
                } else {
                    const liveSpecsResponse = await getLiveSpecsByCatalogName(
                        catalogName,
                        'collection'
                    );

                    if (liveSpecsResponse.error) {
                        setSchemaUpdateErrored(true);
                        setLoading(false);
                    } else if (liveSpecsResponse.data) {
                        const { last_pub_id } = liveSpecsResponse.data[0];

                        const draftSpecResponse = await createDraftSpec(
                            persistedDraftId,
                            catalogName,
                            inferredSchema,
                            'collection',
                            last_pub_id
                        );

                        processDraftSpecResponse(
                            draftSpecResponse,
                            schemaUpdateErrored,
                            setSchemaUpdateErrored,
                            setLoading,
                            setCollectionData
                        );
                    }
                }
            } else {
                setSchemaUpdateErrored(true);
            }
        },
    };

    return (
        <>
            <Box sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                <DataObject />

                <Typography variant="h6" sx={{ ml: 1 }}>
                    <FormattedMessage id="workflows.collectionSelector.schemaInference.header" />
                </Typography>
            </Box>

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

            <Box sx={{ my: 3 }}>
                <Box
                    sx={{
                        p: 1,
                        minHeight: toolbarHeight,
                        backgroundColor: monacoEditor.editorHeaderBackground,
                    }}
                >
                    <Stack
                        direction="row"
                        sx={{
                            justifyContent: 'space-between',
                            alignItems: 'center',
                        }}
                    >
                        <CustomWidthTooltip
                            title={catalogName}
                            placement="bottom-start"
                        >
                            <Typography noWrap sx={{ mr: 2 }}>
                                {catalogName}
                            </Typography>
                        </CustomWidthTooltip>

                        {loading ? (
                            <Box sx={{ px: 1, pt: 1 }}>
                                <CircularProgress size="1.5rem" />
                            </Box>
                        ) : (
                            <IconButton
                                onClick={handlers.refreshInferredSchema}
                            >
                                <Refresh />
                            </IconButton>
                        )}
                    </Stack>
                </Box>

                {inferredSchema ? (
                    <DiffEditor
                        height={`${height}px`}
                        original={stringifyJSON(collectionData.spec)}
                        modified={stringifyJSON(inferredSchema)}
                        theme={
                            theme.palette.mode === 'light' ? 'vs' : 'vs-dark'
                        }
                    />
                ) : (
                    <Box
                        sx={{
                            p: 1,
                            backgroundColor:
                                monacoEditor.editorWidgetBackground,
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

            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                }}
            >
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
            </Box>
        </>
    );
}

export default InferredSchema;
