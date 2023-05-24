import EditorFileSelector from 'components/editor/FileSelector';
import ListAndDetails from 'components/editor/ListAndDetails';
import MonacoEditor, {
    MonacoEditorProps,
} from 'components/editor/MonacoEditor';

export interface Props extends MonacoEditorProps {
    height?: number;
}

function EditorWithFileSelector(props: Props) {
    const { localZustandScope } = props;

    return (
        <ListAndDetails
            codeEditorDetails
            list={<EditorFileSelector localZustandScope={localZustandScope} />}
            details={<MonacoEditor {...props} />}
        />
    );
}

export default EditorWithFileSelector;
