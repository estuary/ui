import { MonacoEditorSkeleton } from 'components/editor/MonacoEditor/EditorSkeletons';
import EmptySQLEditor from 'components/transformation/create/Catalog/SQLEditor/Empty';
import MonacoEditor from 'components/transformation/create/Catalog/SQLEditor/MonacoEditor';
import useSQLEditor from 'components/transformation/create/Catalog/SQLEditor/useSQLEditor';
import { useMemo } from 'react';
import {
    useTransformationCreate_attributeType,
    useTransformationCreate_migrations,
    useTransformationCreate_selectedAttribute,
    useTransformationCreate_transformConfigs,
} from 'stores/TransformationCreate/hooks';

export interface Props {
    entityName: string;
    disabled?: boolean;
    editorHeight?: number;
}

function SQLEditor({ entityName, disabled, editorHeight }: Props) {
    const transformConfigs = useTransformationCreate_transformConfigs();
    const migrations = useTransformationCreate_migrations();
    const selectedAttribute = useTransformationCreate_selectedAttribute();
    const attributeType = useTransformationCreate_attributeType();

    const { draftSpec, isValidating, onChange } = useSQLEditor(entityName);

    const defaultSQL = useMemo(() => {
        if (
            attributeType === 'transform' &&
            Object.hasOwn(transformConfigs, selectedAttribute)
        ) {
            return transformConfigs[selectedAttribute].lambda;
        } else if (
            attributeType === 'migration' &&
            Object.hasOwn(migrations, selectedAttribute)
        ) {
            return migrations[selectedAttribute];
        } else {
            return '';
        }
    }, [attributeType, migrations, transformConfigs, selectedAttribute]);

    if (draftSpec && selectedAttribute) {
        return (
            <MonacoEditor
                defaultSQL={defaultSQL}
                localZustandScope={false}
                disabled={disabled}
                height={editorHeight}
                toolbarHeight={37}
                onChange={onChange}
            />
        );
    } else if (isValidating) {
        return <MonacoEditorSkeleton editorHeight={editorHeight} />;
    } else {
        return <EmptySQLEditor editorHeight={editorHeight} />;
    }
}

export default SQLEditor;
