import { useMemo } from 'react';

import useDraftSpecEditor from 'src/hooks/useDraftSpecEditor';

function useCollectionDef(
    entityName: string | undefined,
    localZustandScope: boolean | undefined,
    editorSchemaScope: string | undefined
) {
    const { draftSpec } = useDraftSpecEditor(
        entityName,
        localZustandScope,
        editorSchemaScope
    );

    return useMemo(() => {
        return {
            hasReadSchema: true,
            hasWriteSchema: true,
            model: draftSpec?.spec,
        };
    }, [draftSpec?.spec]);
}

export default useCollectionDef;
