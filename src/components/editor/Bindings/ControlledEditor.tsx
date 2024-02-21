import Editor from '@monaco-editor/react';
import { Box, Stack, useTheme } from '@mui/material';
import {
    useBindingsEditorStore_collectionData,
    useBindingsEditorStore_schemaUpdateErrored,
    useBindingsEditorStore_schemaUpdated,
} from 'components/editor/Bindings/Store/hooks';
import OutOfSync from 'components/editor/Status/OutOfSync';
import ReadOnly from 'components/editor/Status/ReadOnly';
import Synchronizing from 'components/editor/Status/Synchronizing';
import {
    defaultOutline,
    monacoEditorComponentBackground,
    monacoEditorHeaderBackground,
} from 'context/Theme';
import { stringifyJSON } from 'services/stringify';
import { useBinding_currentBindingUUID } from 'stores/Binding/hooks';
import { ICON_SIZE, getEditorTotalHeight } from 'utils/editor-utils';

const EDITOR_HEIGHT = 396;
const EDITOR_TOOLBAR_HEIGHT = 29;
const EDITOR_TOTAL_HEIGHT = getEditorTotalHeight(
    EDITOR_HEIGHT,
    EDITOR_TOOLBAR_HEIGHT
);

function ControlledEditor() {
    const theme = useTheme();

    // Binding Store
    const currentBindingUUID = useBinding_currentBindingUUID();

    // Bindings Editor Store
    const collectionData = useBindingsEditorStore_collectionData();

    const schemaUpdated = useBindingsEditorStore_schemaUpdated();
    const schemaUpdateErrored = useBindingsEditorStore_schemaUpdateErrored();

    if (currentBindingUUID && collectionData) {
        return (
            <Box
                sx={{
                    height: EDITOR_TOTAL_HEIGHT,
                    border: defaultOutline[theme.palette.mode],
                }}
            >
                <Stack
                    spacing={1}
                    direction="row"
                    sx={{
                        minHeight:
                            schemaUpdateErrored || !schemaUpdated
                                ? EDITOR_TOOLBAR_HEIGHT
                                : 20,
                        py: 0.5,
                        px: 1,
                        alignItems: 'center',
                        justifyContent: 'end',
                        backgroundColor:
                            monacoEditorHeaderBackground[theme.palette.mode],
                        borderBottom: defaultOutline[theme.palette.mode],
                    }}
                >
                    {schemaUpdateErrored ? (
                        <OutOfSync iconSize={ICON_SIZE} />
                    ) : schemaUpdated ? (
                        <ReadOnly iconSize={ICON_SIZE} />
                    ) : (
                        <Synchronizing iconSize={ICON_SIZE} />
                    )}
                </Stack>

                <Editor
                    height={EDITOR_HEIGHT}
                    value={stringifyJSON(collectionData.spec)}
                    defaultLanguage="json"
                    theme={monacoEditorComponentBackground[theme.palette.mode]}
                    saveViewState={false}
                    path={currentBindingUUID}
                    options={{ readOnly: true }}
                />
            </Box>
        );
    } else {
        return null;
    }
}

export default ControlledEditor;
