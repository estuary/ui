import { DiffEditor } from '@monaco-editor/react';
import { DataObject } from '@mui/icons-material';
import { Box, Typography, useTheme } from '@mui/material';
import { BindingsEditorSchemaSkeleton } from 'components/collection/CollectionSkeletons';
import MessageWithLink from 'components/content/MessageWithLink';
import ApplySchemaButton from 'components/editor/Bindings/SchemaInference/ApplySchemaButton';
import DiffEditorHeader from 'components/editor/Bindings/SchemaInference/DiffEditorHeader';
import {
    handleInferredSchemaFailure,
    handleInferredSchemaSuccess,
} from 'components/editor/Bindings/SchemaInference/service-utils';
import { CollectionData } from 'components/editor/Bindings/types';
import {
    DEFAULT_HEIGHT,
    DEFAULT_TOOLBAR_HEIGHT,
} from 'components/editor/MonacoEditor';
import AlertBox from 'components/shared/AlertBox';
import { monacoEditorWidgetBackground } from 'context/Theme';
import { Dispatch, SetStateAction, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useEffectOnce, useLocalStorage } from 'react-use';
import getInferredSchema from 'services/schema-inference';
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

function InferredSchemaPopper({
    catalogName,
    collectionData,
    setCollectionData,
    height = DEFAULT_HEIGHT,
    toolbarHeight = DEFAULT_TOOLBAR_HEIGHT,
}: Props) {
    const theme = useTheme();

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
                <DiffEditorHeader
                    catalogName={catalogName}
                    collectionData={collectionData}
                    inferredSchema={inferredSchema}
                    schemaUpdateErrored={schemaUpdateErrored}
                    loading={loading}
                    setInferredSchema={setInferredSchema}
                    setSchemaUpdateErrored={setSchemaUpdateErrored}
                    setLoading={setLoading}
                    toolbarHeight={toolbarHeight}
                />

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

            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                }}
            >
                <ApplySchemaButton
                    catalogName={catalogName}
                    collectionData={collectionData}
                    inferredSchema={inferredSchema}
                    schemaUpdateErrored={schemaUpdateErrored}
                    loading={loading}
                    setCollectionData={setCollectionData}
                    setSchemaUpdateErrored={setSchemaUpdateErrored}
                    setLoading={setLoading}
                />
            </Box>
        </>
    );
}

export default InferredSchemaPopper;
