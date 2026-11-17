import { useEffect, useState } from 'react';

import { Box, Stack, Typography } from '@mui/material';

import { FormattedMessage } from 'react-intl';

import ResourceConfig from 'src/components/collection/ResourceConfig';
import CollectionSchemaEditor from 'src/components/collection/schema/Editor';
import DisabledWarning from 'src/components/collection/schema/Editor/DisabledWarning';
import CollectionSchemaEditorSkeleton from 'src/components/collection/schema/Editor/Skeleton';
import ControlledEditor from 'src/components/editor/Bindings/ControlledEditor';
import SchemaEditCLIButton from 'src/components/editor/Bindings/SchemaEdit/CLIButton';
import SchemaEditToggle from 'src/components/editor/Bindings/SchemaEdit/Toggle';
import {
    useBindingsEditorStore_collectionData,
    useBindingsEditorStore_collectionInitializationAlert,
    useBindingsEditorStore_schemaUpdateErrored,
} from 'src/components/editor/Bindings/Store/hooks';
import BindingsTabs, { tabProps } from 'src/components/editor/Bindings/Tabs';
import DraftSpecEditorHydrator from 'src/components/editor/Store/DraftSpecsHydrator';
import {
    useEditorStore_persistedDraftId,
    useEditorStore_setCurrentCatalog,
    useEditorStore_setSpecs,
} from 'src/components/editor/Store/hooks';
import AlertBox from 'src/components/shared/AlertBox';
import ExternalLink from 'src/components/shared/ExternalLink';
import { useEntityType } from 'src/context/EntityContext';
import useBackgroundTest from 'src/hooks/fieldSelection/useBackgroundTest';
import useFieldSelectionRefresh from 'src/hooks/fieldSelection/useFieldSelectionRefresh';
import useInitializeCollectionDraft from 'src/hooks/useInitializeCollectionDraft';
import {
    useBinding_currentBindingUUID,
    useBinding_currentCollection,
} from 'src/stores/Binding/hooks';

interface Props {
    itemType: string;
    readOnly?: boolean;
}

function BindingsEditor({ itemType, readOnly = false }: Props) {
    const entityType = useEntityType();

    const initializeCollectionDraft = useInitializeCollectionDraft();
    const { refreshRequired } = useBackgroundTest();
    const { refresh } = useFieldSelectionRefresh();

    // Binding Store
    const currentCollection = useBinding_currentCollection();
    const currentBindingUUID = useBinding_currentBindingUUID();

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

    if (currentCollection && currentBindingUUID) {
        return (
            <Box sx={{ p: 1 }}>
                <BindingsTabs
                    selectedTab={activeTab}
                    setSelectedTab={setActiveTab}
                />

                <Box sx={{ p: 1 }}>
                    {tabProps[activeTab].value === 'config' ? (
                        <ResourceConfig
                            bindingUUID={currentBindingUUID}
                            collectionName={currentCollection}
                            readOnly={readOnly}
                            refreshRequired={refreshRequired}
                            refresh={refresh}
                        />
                    ) : collectionData || collectionData === null ? (
                        <Stack spacing={2}>
                            {schemaUpdateErrored ? (
                                <AlertBox severity="warning" short>
                                    An error was encountered fetching your
                                    updated collection schema to display. This
                                    does not mean that there was a problem
                                    updating the server. Open the CLI popper and
                                    click the Synchronize Schema button to try
                                    again.
                                </AlertBox>
                            ) : null}

                            {collectionInitializationAlert ? (
                                <AlertBox
                                    short
                                    severity={
                                        collectionInitializationAlert.severity
                                    }
                                    title={<>Editor initialization failed</>}
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
                                    <Typography
                                        variant="formSectionHeader"
                                        sx={{ mr: 1 }}
                                    >
                                        Collection Schema
                                        <ExternalLink link="https://docs.estuary.dev/concepts/collections/#schemas">
                                            Docs
                                        </ExternalLink>
                                    </Typography>

                                    <Stack direction="row" spacing={1}>
                                        <SchemaEditCLIButton />

                                        <SchemaEditToggle />
                                    </Stack>
                                </Box>
                            ) : (
                                <Typography variant="h6" sx={{ mr: 1 }}>
                                    Collection Schema
                                </Typography>
                            )}

                            <DisabledWarning />

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
                            title={<>No collection schema to display</>}
                        >
                            <Typography>
                                {`This is normally caused by the ${itemType} being disabled during ${entityType} creation.`}
                            </Typography>
                            <Typography>
                                {`To see the schema, refresh the ${itemType} using the button to the left.`}
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
