import { Box, Stack, Typography, useTheme } from '@mui/material';
import { BindingsEditorSchemaSkeleton } from 'components/collection/CollectionSkeletons';
import ResourceConfig from 'components/collection/ResourceConfig';
import MessageWithLink from 'components/content/MessageWithLink';
import ControlledEditor from 'components/editor/Bindings/ControlledEditor';
import SchemaEditButton from 'components/editor/Bindings/SchemaEdit/Button';
import SchemaInferenceButton from 'components/editor/Bindings/SchemaInference/Button';
import {
    useBindingsEditorStore_collectionData,
    useBindingsEditorStore_collectionInitializationAlert,
    useBindingsEditorStore_schemaUpdateErrored,
} from 'components/editor/Bindings/Store/hooks';
import BindingsTabs, { tabProps } from 'components/editor/Bindings/Tabs';
import DraftSpecEditor from 'components/editor/DraftSpec';
import {
    useEditorStore_persistedDraftId,
    useEditorStore_setCurrentCatalog,
    useEditorStore_setSpecs,
} from 'components/editor/Store/hooks';
import AlertBox from 'components/shared/AlertBox';
import useInitializeCollectionDraft from 'components/shared/Entity/Edit/useInitializeCollectionDraft';
import {
    defaultOutline,
    monacoEditorHeaderBackground,
    monacoEditorWidgetBackground,
} from 'context/Theme';
import { ReactNode, useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useResourceConfig_currentCollection } from 'stores/ResourceConfig/hooks';

interface Props {
    loading: boolean;
    skeleton: ReactNode;
    readOnly?: boolean;
}

const EDITOR_HEIGHT = 404;
const EDITOR_TOOLBAR_HEIGHT = 29;
const EDITOR_TOTAL_HEIGHT = EDITOR_TOOLBAR_HEIGHT + EDITOR_HEIGHT + 2;

function BindingsEditor({ loading, skeleton, readOnly = false }: Props) {
    const theme = useTheme();

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
                                    </Typography>

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
                                collectionData.belongsToDraft ? (
                                    <DraftSpecEditor
                                        localZustandScope={true}
                                        editorHeight={EDITOR_HEIGHT}
                                    />
                                ) : (
                                    <ControlledEditor />
                                )
                            ) : (
                                <Box
                                    sx={{
                                        height: EDITOR_TOTAL_HEIGHT,
                                        border: defaultOutline[
                                            theme.palette.mode
                                        ],
                                    }}
                                >
                                    <Box
                                        sx={{
                                            minHeight: EDITOR_TOOLBAR_HEIGHT,
                                            backgroundColor:
                                                monacoEditorHeaderBackground[
                                                    theme.palette.mode
                                                ],
                                            borderBottom:
                                                defaultOutline[
                                                    theme.palette.mode
                                                ],
                                        }}
                                    />

                                    <Box
                                        sx={{
                                            height: EDITOR_HEIGHT,
                                            p: 1,
                                            backgroundColor:
                                                monacoEditorWidgetBackground[
                                                    theme.palette.mode
                                                ],
                                        }}
                                    >
                                        <BindingsEditorSchemaSkeleton />
                                    </Box>
                                </Box>
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
