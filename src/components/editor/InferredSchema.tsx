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
    setInferredSchema: Dispatch<SetStateAction<Schema | null | undefined>>,
    setLoading: Dispatch<SetStateAction<boolean>>
) => {
    setInferredSchema(!isEmpty(response.schema) ? response.schema : null);

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

            setLoading(true);

            if (gatewayConfig?.gateway_url) {
                getInferredSchema(gatewayConfig, catalogName).then(
                    (response) =>
                        handleInferredSchemaSuccess(
                            response,
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
                setLoading(true);

                if (collectionData.belongsToDraft) {
                    modifyDraftSpec(inferredSchema, {
                        draft_id: persistedDraftId,
                        catalog_name: catalogName,
                    }).then(
                        () => setLoading(false),
                        (error) => {
                            setLoading(false);

                            console.log('schema update error', error);
                        }
                    );
                } else {
                    const liveSpecsResponse = await getLiveSpecsByCatalogName(
                        catalogName,
                        'collection'
                    );

                    if (liveSpecsResponse.error) {
                        setLoading(false);

                        console.log(
                            'live spec call failed',
                            liveSpecsResponse.error
                        );
                    } else if (liveSpecsResponse.data) {
                        const { last_pub_id } = liveSpecsResponse.data[0];

                        console.log('expected pub', last_pub_id);

                        const draftSpecResponse = await createDraftSpec(
                            persistedDraftId,
                            catalogName,
                            inferredSchema,
                            'collection',
                            last_pub_id
                        );

                        if (draftSpecResponse.error) {
                            setLoading(false);

                            console.log(
                                'draft spec call failed',
                                draftSpecResponse.error
                            );
                        } else if (
                            draftSpecResponse.data &&
                            draftSpecResponse.data.length > 0
                        ) {
                            setCollectionData({
                                spec: draftSpecResponse.data[0].spec,
                                belongsToDraft: true,
                            });

                            setLoading(false);
                        }
                    }
                }
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

            <Box sx={{ mb: 3 }}>
                <Box
                    sx={{
                        p: 1,
                        minHeight: toolbarHeight,
                        backgroundColor: '#121212',
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
                                    <FormattedMessage id="workflows.collectionSelector.schemaInference.alert.generalError.message" />
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
                        isEqual(collectionData.spec, inferredSchema)
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
