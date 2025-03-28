import CollectionSchemaEditor from 'src/components/collection/schema/Editor';
import { MonacoEditorSkeleton } from 'src/components/editor/MonacoEditor/EditorSkeletons';
import EmptySQLEditor from 'src/components/transformation/create/Config/SQLEditor/Empty';
import useDraftSpecEditor from 'src/hooks/useDraftSpecEditor';

export interface Props {
    entityName: string;
    editorHeight?: number;
}

function DerivationSchemaEditor({ entityName, editorHeight }: Props) {
    const { draftSpec, isValidating } = useDraftSpecEditor(entityName);

    if (draftSpec) {
        return <CollectionSchemaEditor entityName={entityName} />;
    } else if (isValidating) {
        return <MonacoEditorSkeleton editorHeight={editorHeight} />;
    } else {
        return <EmptySQLEditor editorHeight={editorHeight} />;
    }
}

export default DerivationSchemaEditor;
