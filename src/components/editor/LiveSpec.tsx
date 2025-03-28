import EditorWithFileSelector from 'src/components/editor/EditorWithFileSelector';
import { useEditorStore_currentCatalog } from 'src/components/editor/Store/hooks';
import { useMemo } from 'react';
import { stringifyJSON } from 'src/services/stringify';

interface Props {
    localZustandScope: boolean;
    singleSpec?: boolean;
}

function LiveSpecEditor({ localZustandScope, singleSpec }: Props) {
    const currentCatalog = useEditorStore_currentCatalog({
        localScope: localZustandScope,
    });

    const specAsString = useMemo(
        () => stringifyJSON(currentCatalog?.spec ?? null),
        [currentCatalog?.spec]
    );

    return (
        <EditorWithFileSelector
            localZustandScope={localZustandScope}
            defaultValue={specAsString}
            disabled={true}
            disableList={singleSpec}
        />
    );
}

export default LiveSpecEditor;
