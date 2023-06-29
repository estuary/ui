import { Box, Stack, Typography } from '@mui/material';
import ResourceConfig from 'components/collection/ResourceConfig';
import CollectionSchemaEditor from 'components/collection/schema/Editor';
import CollectionSchemaEditorSkeleton from 'components/collection/schema/Editor/Skeleton';
import MessageWithLink from 'components/content/MessageWithLink';
import ControlledEditor from 'components/editor/Bindings/ControlledEditor';
import SchemaInferenceButton from 'components/editor/Bindings/SchemaInference/Button';
import {
    useBindingsEditorStore_collectionData,
    useBindingsEditorStore_collectionInitializationAlert,
    useBindingsEditorStore_schemaUpdateErrored,
} from 'components/editor/Bindings/Store/hooks';
import BindingsTabs, { tabProps } from 'components/editor/Bindings/Tabs';
import {
    useEditorStore_persistedDraftId,
    useEditorStore_setCurrentCatalog,
    useEditorStore_setSpecs,
} from 'components/editor/Store/hooks';
import AlertBox from 'components/shared/AlertBox';
import ExternalLink from 'components/shared/ExternalLink';
import useInitializeCollectionDraft from 'hooks/useInitializeCollectionDraft';
import { ReactNode, useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useResourceConfig_currentCollection } from 'stores/ResourceConfig/hooks';
import SchemaEditCLIButton from './SchemaEdit/CLIButton';
import SchemaEditToggle from './SchemaEdit/Toggle';

interface Props {
    loading: boolean;
    skeleton: ReactNode;
    readOnly?: boolean;
}

function BindingsEditor({ loading, skeleton, readOnly = false }: Props) {
    const initializeCollectionDraft = useInitializeCollectionDraft();

    // Bindings Editor Store
    const collectionData = useBindingsEditorStore_collectionData();
    const collectionInitializationAlert =
        useBindingsEditorStore_collectionInitializationAlert();

    const schemaUpdateErrored = useBindingsEditorStore_schemaUpdateErrored();

    // Task Draft Editor Store
    const persistedDraftId = useEditorStore_persistedDraftId();

    // Collection Draft Editor Store
    const setCurrentCatalog = useEditorStore_setCurrentCatalog({
        localScope: true,
    });

    const setCollectionSpecs = useEditorStore_setSpecs({
        localScope: true,
    });

    // Resource Config Store
    const currentCollection = useResourceConfig_currentCollection();

    const [activeTab, setActiveTab] = useState<number>(0);

    useEffect(() => {
        if (tabProps[activeTab].value === 'schema' && currentCollection) {
            setCurrentCatalog(null);
            setCollectionSpecs(null);

            void initializeCollectionDraft(currentCollection);
        }
    }, [
        initializeCollectionDraft,
        setCollectionSpecs,
        setCurrentCatalog,
        activeTab,
        currentCollection,
    ]);

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
                        <Stack spacing={2}>
                            {schemaUpdateErrored ? (
                                <AlertBox severity="warning" short>
                                    <FormattedMessage id="workflows.collectionSelector.schemaEdit.alert.message.schemaUpdateError" />
                                </AlertBox>
                            ) : null}

                            {collectionInitializationAlert ? (
                                <AlertBox
                                    short
                                    severity={
                                        collectionInitializationAlert.severity
                                    }
                                    title={
                                        <FormattedMessage id="workflows.collectionSelector.error.title.editorInitialization" />
                                    }
                                >
                                    <FormattedMessage
                                        id={
                                            collectionInitializationAlert.messageId
                                        }
                                    />
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
                                    <Typography variant="h6" sx={{ mr: 1 }}>
                                        <FormattedMessage id="workflows.collectionSelector.header.collectionSchema" />
                                        <ExternalLink link="https://docs.estuary.dev/concepts/collections/#schemas">
                                            <FormattedMessage id="terms.documentation" />
                                        </ExternalLink>
                                    </Typography>

                                    <Stack direction="row" spacing={1}>
                                        <SchemaInferenceButton />

                                        <SchemaEditCLIButton />

                                        <SchemaEditToggle />
                                    </Stack>
                                </Box>
                            ) : (
                                <Typography variant="h6" sx={{ mr: 1 }}>
                                    <FormattedMessage id="workflows.collectionSelector.header.collectionSchema" />
                                </Typography>
                            )}

                            {collectionData ? (
                                collectionData.belongsToDraft ? (
                                    <CollectionSchemaEditor
                                        entityName={currentCollection}
                                        localZustandScope
                                    />
                                ) : (
                                    <ControlledEditor />
                                )
                            ) : (
                                <CollectionSchemaEditorSkeleton />
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
