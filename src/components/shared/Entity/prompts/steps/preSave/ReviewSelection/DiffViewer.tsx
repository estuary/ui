import { useTheme } from '@mui/material';

import { DiffEditor } from '@monaco-editor/react';

import { monacoEditorComponentBackground } from 'src/context/Theme';
import useDraftSpecEditor from 'src/hooks/useDraftSpecEditor';
import { stringifyJSON } from 'src/services/stringify';
import { useDetailsFormStore } from 'src/stores/DetailsForm/Store';
import { useFormStateStore_liveSpec } from 'src/stores/FormState/hooks';

const HEIGHT = 400;

function DiffViewer() {
    const theme = useTheme();

    const entityName = useDetailsFormStore((state) => state.draftedEntityName);
    const { defaultValue: draftSpec, isValidating } =
        useDraftSpecEditor(entityName);

    const liveSpec = useFormStateStore_liveSpec();

    return (
        <DiffEditor
            height={`${HEIGHT}px`}
            original={liveSpec ? stringifyJSON(liveSpec) : 'loading...'}
            modified={isValidating ? 'loading...' : draftSpec}
            theme={monacoEditorComponentBackground[theme.palette.mode]}
            options={{
                readOnly: true,
            }}
        />
    );
}

export default DiffViewer;
