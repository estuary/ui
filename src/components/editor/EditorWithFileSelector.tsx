import type { MonacoEditorProps } from 'src/components/editor/MonacoEditor/types';

import MonacoEditor from 'src/components/editor/MonacoEditor';

export interface Props extends MonacoEditorProps {
    height?: number;
}

function EditorWithFileSelector(props: Props) {
    return <MonacoEditor {...props} />;
}

export default EditorWithFileSelector;
