import type { EditorViewProps } from 'src/components/schema/EditorView/types';

import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    Grid,
} from '@mui/material';

import { useIntl } from 'react-intl';

import SkimProjectionErrors from 'src/components/collection/schema/Editor/SkimProjectionErrors';
import SchemaEditCLIButton from 'src/components/editor/Bindings/SchemaEdit/CLIButton';
import { useBindingsEditorStore } from 'src/components/editor/Bindings/Store/create';
import MonacoEditor from 'src/components/editor/MonacoEditor';
import KeyAutoComplete from 'src/components/schema/KeyAutoComplete';
import ValidationMessages from 'src/components/schema/ValidationMessages';
import DialogTitleWithClose from 'src/components/shared/Dialog/TitleWithClose';

const EDITOR_HEIGHT = 600;

function EditorView({ keyProps, editorProps }: EditorViewProps) {
    const intl = useIntl();

    const [editModeEnabled, setEditModeEnabled] = useBindingsEditorStore(
        (state) => [state.editModeEnabled, state.setEditModeEnabled]
    );

    const closeDialog = () => setEditModeEnabled(false);

    return (
        <Dialog maxWidth="xl" fullWidth open={editModeEnabled}>
            <DialogTitleWithClose id="todo_fix_this" onClose={closeDialog}>
                {intl.formatMessage({ id: 'schemaEditor.view.title' })}
            </DialogTitleWithClose>

            <DialogContent>
                <Grid container rowGap={2}>
                    <ValidationMessages />

                    <SkimProjectionErrors />

                    <KeyAutoComplete {...keyProps} />

                    <MonacoEditor
                        localZustandScope
                        height={EDITOR_HEIGHT}
                        {...editorProps}
                    />
                </Grid>
            </DialogContent>

            <DialogActions>
                <SchemaEditCLIButton />

                <Button variant="outlined" size="small" onClick={closeDialog}>
                    {intl.formatMessage({ id: 'cta.cancel' })}
                </Button>

                <Button size="small" onClick={closeDialog}>
                    ?Save?
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default EditorView;
