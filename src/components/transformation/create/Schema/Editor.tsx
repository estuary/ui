import MonacoEditor from 'components/editor/MonacoEditor';
import { MonacoEditorSkeleton } from 'components/editor/MonacoEditor/EditorSkeletons';
import EmptySQLEditor from 'components/transformation/create/Config/SQLEditor/Empty';
import useDraftSpecEditor from 'hooks/useDraftSpecEditor';
import { Schema } from 'types';

export interface Props {
    entityName: string;
    disabled?: boolean;
    editorHeight?: number;
}

function DerivationSchemaEditor({ entityName, disabled, editorHeight }: Props) {
    const { draftSpec, isValidating, onChange } = useDraftSpecEditor(
        entityName,
        'collection',
        false
    );

    if (draftSpec) {
        return (
            <MonacoEditor
                editorSchemaScope="schema"
                localZustandScope={false}
                disabled={disabled}
                height={editorHeight}
                toolbarHeight={37}
                onChange={async (value: Schema, path, type) => {
                    await onChange(value, path, type, 'schema');
                }}
            />
        );
    } else if (isValidating) {
        return <MonacoEditorSkeleton editorHeight={editorHeight} />;
    } else {
        return <EmptySQLEditor editorHeight={editorHeight} />;
    }
}

export default DerivationSchemaEditor;
