import { Box, Stack, Typography } from '@mui/material';
import ResourceConfig from 'components/collection/ResourceConfig';
import CollectionSchemaEditor from 'components/collection/schema/Editor';
import CollectionSchemaEditorSkeleton from 'components/collection/schema/Editor/Skeleton';
import ControlledEditor from 'components/editor/Bindings/ControlledEditor';
import SchemaInferenceButton from 'components/editor/Bindings/SchemaInference/Button';
import {
    useBindingsEditorStore_collectionData,
    useBindingsEditorStore_collectionInitializationAlert,
    useBindingsEditorStore_schemaUpdateErrored,
} from 'components/editor/Bindings/Store/hooks';
import BindingsTabs, { tabProps } from 'components/editor/Bindings/Tabs';
import DraftSpecEditorHydrator from 'components/editor/Store/DraftSpecsHydrator';
import {
    useEditorStore_persistedDraftId,
    useEditorStore_setCurrentCatalog,
    useEditorStore_setSpecs,
} from 'components/editor/Store/hooks';
import AlertBox from 'components/shared/AlertBox';
import ExternalLink from 'components/shared/ExternalLink';
import { useEntityType } from 'context/EntityContext';
import useInitializeCollectionDraft from 'hooks/useInitializeCollectionDraft';
import { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useResourceConfig_currentCollection } from 'stores/ResourceConfig/hooks';
import SchemaEditCLIButton from '../Bindings/SchemaEdit/CLIButton';
import SchemaEditToggle from '../Bindings/SchemaEdit/Toggle';

interface Props {
    itemType: string;
    readOnly?: boolean;
}

function BindingsEditor({ itemType, readOnly = false }: Props) {
    const entityType = useEntityType();

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
        return (
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
                                    <DraftSpecEditorHydrator
                                        entityType="collection"
                                        entityName={currentCollection}
                                        localScope
                                    >
                                        <CollectionSchemaEditor
                                            entityName={currentCollection}
                                            localZustandScope
                                        />
                                    </DraftSpecEditorHydrator>
                                ) : (
                                    <ControlledEditor />
                                )
                            ) : (
                                <CollectionSchemaEditorSkeleton />
                            )}
                        </Stack>
                    ) : (
                        <AlertBox
                            severity="warning"
                            short
                            title={
                                <FormattedMessage id="workflows.collectionSelector.error.title.missingCollectionSchema" />
                            }
                        >
                            <Typography>
                                <FormattedMessage
                                    id="workflows.collectionSelector.error.message.missingCollectionSchema"
                                    values={{
                                        itemType,
                                        entityType,
                                    }}
                                />
                            </Typography>
                            <Typography>
                                <FormattedMessage
                                    id="workflows.collectionSelector.error.fix.missingCollectionSchema"
                                    values={{
                                        itemType,
                                    }}
                                />
                            </Typography>
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
