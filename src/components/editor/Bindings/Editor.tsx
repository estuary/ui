import Editor from '@monaco-editor/react';
import { Box, Stack, Typography, useTheme } from '@mui/material';
import { BindingsEditorSchemaSkeleton } from 'components/collection/CollectionSkeletons';
import ResourceConfig from 'components/collection/ResourceConfig';
import MessageWithLink from 'components/content/MessageWithLink';
import SchemaEditButton from 'components/editor/Bindings/SchemaEdit/Button';
import SchemaInferenceButton from 'components/editor/Bindings/SchemaInference/Button';
import {
    useBindingsEditorStore_collectionData,
    useBindingsEditorStore_collectionInitializationError,
    useBindingsEditorStore_schemaUpdated,
    useBindingsEditorStore_schemaUpdateErrored,
} from 'components/editor/Bindings/Store/hooks';
import BindingsTabs, { tabProps } from 'components/editor/Bindings/Tabs';
import DraftSpecEditor from 'components/editor/DraftSpec';
import OutOfSync from 'components/editor/Status/OutOfSync';
import Synchronizing from 'components/editor/Status/Synchronizing';
import { useEditorStore_persistedDraftId } from 'components/editor/Store/hooks';
import AlertBox from 'components/shared/AlertBox';
import useInitializeCollectionDraft from 'components/shared/Entity/Edit/useInitializeCollectionDraft';
import {
    defaultOutline,
    monacoEditorComponentBackground,
    monacoEditorHeaderBackground,
    monacoEditorWidgetBackground,
} from 'context/Theme';
import { ReactNode, useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { stringifyJSON } from 'services/stringify';
import { useResourceConfig_currentCollection } from 'stores/ResourceConfig/hooks';

interface Props {
    loading: boolean;
    skeleton: ReactNode;
    readOnly?: boolean;
}

const ICON_SIZE = 14;
const EDITOR_HEIGHT = 404;
const EDITOR_TOOLBAR_HEIGHT = 29;
const EDITOR_TOTAL_HEIGHT = EDITOR_TOOLBAR_HEIGHT + EDITOR_HEIGHT + 2;

function BindingsEditor({ loading, skeleton, readOnly = false }: Props) {
    const theme = useTheme();

    const initializeCollectionDraft = useInitializeCollectionDraft();

    // Bindings Editor Store
    const collectionData = useBindingsEditorStore_collectionData();
    const collectionInitializationError =
        useBindingsEditorStore_collectionInitializationError();

    const schemaUpdated = useBindingsEditorStore_schemaUpdated();
    const schemaUpdateErrored = useBindingsEditorStore_schemaUpdateErrored();

    // Draft Editor Store
    const persistedDraftId = useEditorStore_persistedDraftId();

    // Resource Config Store
    const currentCollection = useResourceConfig_currentCollection();

    const [activeTab, setActiveTab] = useState<number>(0);

    useEffect(() => {
        if (tabProps[activeTab].value === 'schema') {
            void initializeCollectionDraft();
        }
    }, [initializeCollectionDraft, activeTab]);

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

                            {collectionInitializationError ? (
                                <AlertBox
                                    short
                                    severity={
                                        collectionInitializationError.severity
                                    }
                                    title={
                                        <span>
                                            Editor Initialization Failed
                                        </span>
                                    }
                                >
                                    {typeof collectionInitializationError.error ===
                                    'string'
                                        ? collectionInitializationError.error
                                        : collectionInitializationError.error
                                              .message}
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
                                    <Box
                                        sx={{
                                            height: EDITOR_TOTAL_HEIGHT,
                                            border: defaultOutline[
                                                theme.palette.mode
                                            ],
                                        }}
                                    >
                                        <Stack
                                            spacing={1}
                                            direction="row"
                                            sx={{
                                                minHeight:
                                                    schemaUpdateErrored ||
                                                    !schemaUpdated
                                                        ? EDITOR_TOOLBAR_HEIGHT
                                                        : 20,
                                                py: 0.5,
                                                px: 1,
                                                alignItems: 'center',
                                                justifyContent: 'end',
                                                backgroundColor:
                                                    monacoEditorHeaderBackground[
                                                        theme.palette.mode
                                                    ],
                                                borderBottom:
                                                    defaultOutline[
                                                        theme.palette.mode
                                                    ],
                                            }}
                                        >
                                            {schemaUpdateErrored ? (
                                                <OutOfSync
                                                    iconSize={ICON_SIZE}
                                                />
                                            ) : null}

                                            {schemaUpdated ? null : (
                                                <Synchronizing
                                                    iconSize={ICON_SIZE}
                                                />
                                            )}
                                        </Stack>

                                        <Editor
                                            height={396}
                                            value={stringifyJSON(
                                                collectionData.spec
                                            )}
                                            defaultLanguage="json"
                                            theme={
                                                monacoEditorComponentBackground[
                                                    theme.palette.mode
                                                ]
                                            }
                                            saveViewState={false}
                                            path={currentCollection}
                                            options={{ readOnly: true }}
                                        />
                                    </Box>
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
