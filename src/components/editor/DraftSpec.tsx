import MonacoEditor from 'components/editor/MonacoEditor';
import { MonacoEditorSkeleton } from 'components/editor/MonacoEditor/EditorSkeletons';
import useDraftSpecEditor from 'hooks/useDraftSpecEditor';

export interface Props {
    disabled?: boolean;
    localZustandScope?: boolean;
    editorHeight?: number;
    entityName?: string;
    monitorCurrentCatalog?: boolean;
}

function DraftSpecEditor({
    disabled,
    localZustandScope = false,
    editorHeight,
    entityName,
    monitorCurrentCatalog,
}: Props) {
    const { draftSpec, isValidating, onChange, defaultValue } =
        useDraftSpecEditor(
            entityName,
            localZustandScope,
            undefined,
            monitorCurrentCatalog
        );

    console.log('draftSpec', draftSpec);

    if (draftSpec) {
        return (
            <MonacoEditor
                disabled={disabled}
                localZustandScope={localZustandScope}
                height={editorHeight}
                onChange={onChange}
                defaultValue={defaultValue}
            />
        );
    } else if (isValidating) {
        return <MonacoEditorSkeleton editorHeight={editorHeight} />;
    } else {
        return null;
    }
}

export default DraftSpecEditor;
