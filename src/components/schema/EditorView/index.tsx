import type { EditorViewProps } from 'src/components/schema/EditorView/types';

import { Dialog, DialogActions, DialogContent, Grid } from '@mui/material';

import { useIntl } from 'react-intl';

import SkimProjectionErrors from 'src/components/collection/schema/Editor/SkimProjectionErrors';
import { useBindingsEditorStore } from 'src/components/editor/Bindings/Store/create';
import MonacoEditor from 'src/components/editor/MonacoEditor';
import KeyAutoComplete from 'src/components/schema/KeyAutoComplete';
import ValidationMessages from 'src/components/schema/ValidationMessages';
import DialogTitleWithClose from 'src/components/shared/Dialog/TitleWithClose';

const EDITOR_HEIGHT = 404;

function EditorView({ keyProps, editorProps }: EditorViewProps) {
    const intl = useIntl();

    const [editModeEnabled, setEditModeEnabled] = useBindingsEditorStore(
        (state) => [state.editModeEnabled, state.setEditModeEnabled]
    );

    return (
        <Dialog maxWidth="xl" fullWidth open={editModeEnabled}>
            <DialogTitleWithClose
                id="todo_fix_this"
                onClose={() => setEditModeEnabled(false)}
            >
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

            <DialogActions>actions</DialogActions>
        </Dialog>
    );
}

export default EditorView;
