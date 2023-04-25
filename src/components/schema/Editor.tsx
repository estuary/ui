import MonacoEditor from 'components/editor/MonacoEditor';
import { MonacoEditorSkeleton } from 'components/editor/MonacoEditor/EditorSkeletons';
import useDraftSpecEditor from 'hooks/useDraftSpecEditor';
import { Entity } from 'types';

export interface Props {
    entityType: Entity;
    disabled?: boolean;
    localZustandScope?: boolean;
    editorHeight?: number;
    entityName?: string;
}

const editorScope = '/schema';
function Editor({
    entityType,
    disabled,
    localZustandScope = false,
    editorHeight,
    entityName,
}: Props) {
    const { draftSpec, isValidating, onChange } = useDraftSpecEditor(
        entityName,
        entityType,
        localZustandScope
    );

    if (draftSpec) {
        return (
            <MonacoEditor
                disabled={disabled}
                localZustandScope={localZustandScope}
                height={editorHeight}
                schemaPointer={editorScope}
                onChange={onChange}
            />
        );
    } else if (isValidating) {
        return <MonacoEditorSkeleton editorHeight={editorHeight} />;
    } else {
        return null;
    }
}

export default Editor;
