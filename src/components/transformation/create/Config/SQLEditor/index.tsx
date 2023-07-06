import MonacoEditor from 'components/editor/MonacoEditor';
import { MonacoEditorSkeleton } from 'components/editor/MonacoEditor/EditorSkeletons';
import { useEditorStore_queryResponse_isValidating } from 'components/editor/Store/hooks';
import EmptySQLEditor from 'components/transformation/create/Config/SQLEditor/Empty';
import useSQLEditor from 'components/transformation/create/Config/SQLEditor/useSQLEditor';
import { useMemo } from 'react';
import { useTransformationCreate_selectedAttribute } from 'stores/TransformationCreate/hooks';

interface Props {
    entityName: string;
    disabled?: boolean;
    editorHeight?: number;
}

function SQLEditor({ entityName, disabled, editorHeight }: Props) {
    // Draft Editor Store
    const draftSpecValidating = useEditorStore_queryResponse_isValidating();

    // Transformation Config Store
    const selectedAttribute = useTransformationCreate_selectedAttribute();

    const { draftSpec, onChange, defaultValue } = useSQLEditor(entityName);

    const editorSchemaScope = useMemo(
        () =>
            selectedAttribute.includes('lambda')
                ? 'derive.transforms'
                : 'derive.using.sqlite.migrations',
        [selectedAttribute]
    );

    if (draftSpec && selectedAttribute) {
        return (
            <MonacoEditor
                localZustandScope={false}
                height={editorHeight}
                disabled={disabled}
                path={selectedAttribute}
                defaultLanguage="sql"
                defaultValue={defaultValue}
                editorSchemaScope={editorSchemaScope}
                onChange={onChange}
            />
        );
    } else if (draftSpecValidating) {
        return <MonacoEditorSkeleton editorHeight={editorHeight} />;
    } else {
        return <EmptySQLEditor editorHeight={editorHeight} />;
    }
}

export default SQLEditor;
