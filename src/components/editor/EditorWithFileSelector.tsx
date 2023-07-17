import EditorFileSelector from 'components/editor/FileSelector';
import ListAndDetails from 'components/editor/ListAndDetails';
import MonacoEditor, {
    MonacoEditorProps,
} from 'components/editor/MonacoEditor';

export interface Props extends MonacoEditorProps {
    height?: number;
    disableList?: boolean;
}

function EditorWithFileSelector(props: Props) {
    const { localZustandScope, disableList } = props;

    if (disableList) {
        return <MonacoEditor {...props} />;
    }

    return (
        <ListAndDetails
            list={<EditorFileSelector localZustandScope={localZustandScope} />}
            details={<MonacoEditor {...props} />}
        />
    );
}

export default EditorWithFileSelector;
