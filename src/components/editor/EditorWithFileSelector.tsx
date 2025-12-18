import type { MonacoEditorProps } from 'src/components/editor/MonacoEditor/types';

import EditorFileSelector from 'src/components/editor/FileSelector';
import ListAndDetails from 'src/components/editor/ListAndDetails';
import MonacoEditor from 'src/components/editor/MonacoEditor';

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
