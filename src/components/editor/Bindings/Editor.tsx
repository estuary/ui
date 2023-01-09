import Editor from '@monaco-editor/react';
import { Box, Stack, Typography, useTheme } from '@mui/material';
import { BindingsEditorSchemaSkeleton } from 'components/collection/CollectionSkeletons';
import ResourceConfig from 'components/collection/ResourceConfig';
import MessageWithLink from 'components/content/MessageWithLink';
import SchemaEditButton from 'components/editor/Bindings/SchemaEdit/Button';
import SchemaInferenceButton from 'components/editor/Bindings/SchemaInference/Button';
import {
    useBindingsEditorStore_collectionData,
    useBindingsEditorStore_initializeCollectionData,
    useBindingsEditorStore_schemaUpdated,
    useBindingsEditorStore_schemaUpdateErrored,
} from 'components/editor/Bindings/Store/hooks';
import BindingsTabs, { tabProps } from 'components/editor/Bindings/Tabs';
import OutOfDate from 'components/editor/Status/OutOfDate';
import Updating from 'components/editor/Status/Updating';
import UpToDate from 'components/editor/Status/UpToDate';
import { useEditorStore_persistedDraftId } from 'components/editor/Store/hooks';
import AlertBox from 'components/shared/AlertBox';
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

const ICON_SIZE = 15;
const EDITOR_HEIGHT = 396;
const EDITOR_TOOLBAR_HEIGHT = 34;
const EDITOR_TOTAL_HEIGHT = EDITOR_TOOLBAR_HEIGHT + EDITOR_HEIGHT + 2;

function BindingsEditor({ loading, skeleton, readOnly = false }: Props) {
    const theme = useTheme();

    // Bindings Editor Store
    const collectionData = useBindingsEditorStore_collectionData();
    const initializeCollectionData =
        useBindingsEditorStore_initializeCollectionData();

    const schemaUpdated = useBindingsEditorStore_schemaUpdated();
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
                        <Stack spacing={2}>
                            {schemaUpdateErrored ? (
                                <AlertBox severity="warning" short>
                                    <FormattedMessage id="workflows.collectionSelector.schemaEdit.alert.message.schemaUpdateError" />
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

                            <Box
                                sx={{
                                    height: EDITOR_TOTAL_HEIGHT,
                                    border: defaultOutline[theme.palette.mode],
                                }}
                            >
                                {collectionData ? (
                                    <>
                                        <Stack
                                            spacing={1}
                                            direction="row"
                                            sx={{
                                                minHeight:
                                                    EDITOR_TOOLBAR_HEIGHT,
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
                                            {
                                                /* TODO (optimization): Determine a better placement for this loading indicator.
                                                    It serves as a progress indicator for the async call to fetch the schema of
                                                    a collection edited on the CLI. */

                                                schemaUpdateErrored ? (
                                                    <OutOfDate
                                                        iconSize={ICON_SIZE}
                                                    />
                                                ) : schemaUpdated ? (
                                                    <UpToDate
                                                        iconSize={ICON_SIZE}
                                                    />
                                                ) : (
                                                    <Updating
                                                        iconSize={ICON_SIZE}
                                                    />
                                                )
                                            }
                                        </Stack>

                                        <Editor
                                            height={EDITOR_HEIGHT}
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
                                    </>
                                ) : (
                                    <>
                                        <Box
                                            sx={{
                                                minHeight:
                                                    EDITOR_TOOLBAR_HEIGHT,
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
                                    </>
                                )}
                            </Box>
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
