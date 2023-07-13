import EditorWithFileSelector from 'components/editor/EditorWithFileSelector';
import { useEditorStore_currentCatalog } from 'components/editor/Store/hooks';
import { useMemo } from 'react';
import { stringifyJSON } from 'services/stringify';

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
