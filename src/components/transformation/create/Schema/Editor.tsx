import CollectionSchemaEditor from 'components/collection/schema/Editor';
import { MonacoEditorSkeleton } from 'components/editor/MonacoEditor/EditorSkeletons';
import EmptySQLEditor from 'components/transformation/create/Config/SQLEditor/Empty';
import useDraftSpecEditor from 'hooks/useDraftSpecEditor';

export interface Props {
    entityName: string;
    editorHeight?: number;
}

function DerivationSchemaEditor({ entityName, editorHeight }: Props) {
    const { draftSpec, isValidating } = useDraftSpecEditor(
        entityName,
        'collection',
        false
    );

    if (draftSpec) {
        return <CollectionSchemaEditor entityName={entityName} />;
    } else if (isValidating) {
        return <MonacoEditorSkeleton editorHeight={editorHeight} />;
    } else {
        return <EmptySQLEditor editorHeight={editorHeight} />;
    }
}

export default DerivationSchemaEditor;
