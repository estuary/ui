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
    const {
        currentCatalogSyncing,
        defaultValue,
        draftSpec,
        isValidating,
        onChange,
    } = useDraftSpecEditor(
        entityName,
        localZustandScope,
        undefined,
        monitorCurrentCatalog
    );

    if (draftSpec) {
        return (
            <MonacoEditor
                defaultValue={defaultValue}
                disabled={disabled}
                height={editorHeight}
                localZustandScope={localZustandScope}
                manuallySynced={currentCatalogSyncing}
                onChange={onChange}
            />
        );
    } else if (isValidating) {
        return <MonacoEditorSkeleton editorHeight={editorHeight} />;
    } else {
        return null;
    }
}

export default DraftSpecEditor;
