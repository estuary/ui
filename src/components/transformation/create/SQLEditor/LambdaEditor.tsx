import { MonacoEditorSkeleton } from 'components/editor/MonacoEditor/EditorSkeletons';
import MonacoEditor from 'components/transformation/create/SQLEditor/Editor';
import useSQLEditor from 'components/transformation/create/SQLEditor/useSQLEditor';
import {
    useTransformationCreate_selectedAttribute,
    useTransformationCreate_transformConfigs,
} from 'stores/TransformationCreate/hooks';

export interface Props {
    disabled?: boolean;
    editorHeight?: number;
    entityName: string;
}

function LambdaEditor({ disabled, editorHeight, entityName }: Props) {
    const transformConfigs = useTransformationCreate_transformConfigs();
    const selectedAttribute = useTransformationCreate_selectedAttribute();

    const { draftSpec, isValidating, onChange } = useSQLEditor(entityName);

    if (draftSpec && selectedAttribute) {
        return (
            <MonacoEditor
                changeType="transform"
                defaultSQL={transformConfigs[selectedAttribute].lambda}
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
        return null;
    }
}

export default LambdaEditor;
