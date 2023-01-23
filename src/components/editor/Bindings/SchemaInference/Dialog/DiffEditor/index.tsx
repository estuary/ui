import { DiffEditor } from '@monaco-editor/react';
import { Box, Typography, useTheme } from '@mui/material';
import { BindingsEditorSchemaSkeleton } from 'components/collection/CollectionSkeletons';
import InferenceDiffEditorFooter from 'components/editor/Bindings/SchemaInference/Dialog/DiffEditor/Footer';
import InferenceDiffEditorHeader from 'components/editor/Bindings/SchemaInference/Dialog/DiffEditor/Header';
import {
    useBindingsEditorStore_collectionData,
    useBindingsEditorStore_inferredSpec,
    useBindingsEditorStore_loadingInferredSchema,
} from 'components/editor/Bindings/Store/hooks';
import { DEFAULT_HEIGHT } from 'components/editor/MonacoEditor';
import AlertBox from 'components/shared/AlertBox';
import {
    defaultOutline,
    monacoEditorComponentBackground,
    monacoEditorWidgetBackground,
} from 'context/Theme';
import { useMemo } from 'react';
import { FormattedMessage } from 'react-intl';
import { stringifyJSON } from 'services/stringify';

interface Props {
    height?: number;
}

function InferenceDiffEditor({ height = DEFAULT_HEIGHT }: Props) {
    const theme = useTheme();

    // Bindings Editor Store
    const inferredSpec = useBindingsEditorStore_inferredSpec();
    const collectionData = useBindingsEditorStore_collectionData();

    const original = useMemo(() => {
        if (collectionData) {
            return stringifyJSON(collectionData.spec);
        }

        return null;
    }, [collectionData]);

    const loadingInferredSchema =
        useBindingsEditorStore_loadingInferredSchema();

    return (
        <Box sx={{ my: 3, border: defaultOutline[theme.palette.mode] }}>
            <InferenceDiffEditorHeader />

            {inferredSpec && original ? (
                <>
                    <DiffEditor
                        height={`${height}px`}
                        original={original}
                        modified={stringifyJSON(inferredSpec)}
                        theme={
                            monacoEditorComponentBackground[theme.palette.mode]
                        }
                        options={{ readOnly: true }}
                    />

                    <InferenceDiffEditorFooter />
                </>
            ) : (
                <Box
                    sx={{
                        p: 1,
                        backgroundColor:
                            monacoEditorWidgetBackground[theme.palette.mode],
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
    );
}

export default InferenceDiffEditor;
