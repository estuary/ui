import EditorWithFileSelector from 'components/editor/EditorWithFileSelector';

interface Props {
    localZustandScope: boolean;
}

function LiveSpecEditor({ localZustandScope }: Props) {
    return (
        <EditorWithFileSelector
            localZustandScope={localZustandScope}
            disabled={true}
        />
    );
}

export default LiveSpecEditor;
