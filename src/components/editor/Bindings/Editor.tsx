import { Box, Stack, Typography, useTheme } from '@mui/material';
import { BindingsEditorSchemaSkeleton } from 'components/collection/CollectionSkeletons';
import ResourceConfig from 'components/collection/ResourceConfig';
import MessageWithLink from 'components/content/MessageWithLink';
import SchemaEditButton from 'components/editor/Bindings/SchemaEdit/Button';
import SchemaInferenceButton from 'components/editor/Bindings/SchemaInference/Button';
import {
    useBindingsEditorStore_collectionData,
    useBindingsEditorStore_initializeCollectionData,
    useBindingsEditorStore_schemaUpdateErrored,
} from 'components/editor/Bindings/Store/hooks';
import BindingsTabs, { tabProps } from 'components/editor/Bindings/Tabs';
import { useEditorStore_persistedDraftId } from 'components/editor/Store/hooks';
import AlertBox from 'components/shared/AlertBox';
import { ReactNode, useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import ReactJson from 'react-json-view';
import { useResourceConfig_currentCollection } from 'stores/ResourceConfig/hooks';

interface Props {
    loading: boolean;
    skeleton: ReactNode;
    readOnly?: boolean;
}

function BindingsEditor({ loading, skeleton, readOnly = false }: Props) {
    const theme = useTheme();
    const jsonTheme =
        theme.palette.mode === 'dark' ? 'bright' : 'bright:inverted';

    // Bindings Editor Store
    const collectionData = useBindingsEditorStore_collectionData();
    const initializeCollectionData =
        useBindingsEditorStore_initializeCollectionData();

    const schemaUpdateErrored = useBindingsEditorStore_schemaUpdateErrored();

    // Draft Editor Store
    const persistedDraftId = useEditorStore_persistedDraftId();

    // Resource Config Store
    const currentCollection = useResourceConfig_currentCollection();

    const [activeTab, setActiveTab] = useState<number>(0);

    useEffect(() => {
        initializeCollectionData(currentCollection, persistedDraftId);
    }, [initializeCollectionData, currentCollection, persistedDraftId]);

    if (currentCollection) {
        return loading ? (
            <Box>{skeleton}</Box>
        ) : (
            <Box sx={{ p: 1 }}>
                <BindingsTabs
                    selectedTab={activeTab}
                    setSelectedTab={setActiveTab}
                />

                <Box sx={{ p: 1 }}>
                    {tabProps[activeTab].value === 'config' ? (
                        <ResourceConfig
                            collectionName={currentCollection}
                            readOnly={readOnly}
                        />
                    ) : collectionData || collectionData === null ? (
                        <Stack
                            spacing={2}
                            sx={{
                                '& .react-json-view': {
                                    backgroundColor: 'transparent !important',
                                },
                            }}
                        >
                            {schemaUpdateErrored ? (
                                <AlertBox severity="warning" short>
                                    <FormattedMessage id="workflows.collectionSelector.alert.message.schemaUpdateError" />
                                </AlertBox>
                            ) : null}

                            {persistedDraftId ? (
                                <Box
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                    }}
                                >
                                    <Box
                                        sx={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                        }}
                                    >
                                        <Typography variant="h6" sx={{ mr: 1 }}>
                                            <FormattedMessage id="workflows.collectionSelector.header.collectionSchema" />
                                        </Typography>

                                        {/* {schemaUpdated ? (
                                            <IconButton
                                                onClick={handlers.updateSchema}
                                            >
                                                <Refresh />
                                            </IconButton>
                                        ) : (
                                            <CircularProgress
                                                size="1.5rem"
                                                sx={{ ml: 1 }}
                                            />
                                        )} */}
                                    </Box>

                                    <Stack direction="row" spacing={1}>
                                        <SchemaInferenceButton />

                                        <SchemaEditButton />
                                    </Stack>
                                </Box>
                            ) : (
                                <Typography variant="h6" sx={{ mr: 1 }}>
                                    <FormattedMessage id="workflows.collectionSelector.header.collectionSchema" />
                                </Typography>
                            )}

                            {collectionData ? (
                                <ReactJson
                                    quotesOnKeys={false}
                                    src={collectionData.spec}
                                    theme={jsonTheme}
                                    displayObjectSize={false}
                                    displayDataTypes={false}
                                />
                            ) : (
                                <BindingsEditorSchemaSkeleton />
                            )}
                        </Stack>
                    ) : (
                        <AlertBox
                            severity="error"
                            short
                            title={
                                <FormattedMessage id="workflows.collectionSelector.error.title.missingCollectionSchema" />
                            }
                        >
                            <MessageWithLink messageID="error.message" />
                        </AlertBox>
                    )}
                </Box>
            </Box>
        );
    } else {
        return null;
    }
}

export default BindingsEditor;
