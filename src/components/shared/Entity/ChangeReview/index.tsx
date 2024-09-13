import { DiffEditor } from '@monaco-editor/react';
import { useTheme } from '@mui/material';
import { monacoEditorComponentBackground } from 'context/Theme';

import useDraftSpecEditor from 'hooks/useDraftSpecEditor';
import { stringifyJSON } from 'services/stringify';
import { useDetailsFormStore } from 'stores/DetailsForm/Store';
import { useFormStateStore_liveSpec } from 'stores/FormState/hooks';

const HEIGHT = 400;

function ChangeReview() {
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
            options={{ readOnly: true }}
        />
    );
}

export default ChangeReview;