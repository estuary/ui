import useDraftUpdater from 'hooks/useDraftUpdater';
import { useCallback } from 'react';
import { useSchemaEvolution_autoDiscover } from 'stores/SchemaEvolution/hooks';
import { Schema } from 'types';

function useSourceCapture() {
    const sourceCapture = useSchemaEvolution_autoDiscover();

    return useDraftUpdater(
        useCallback(
            (spec: Schema) => {
                const response = { ...spec };
                if (sourceCapture) {
                    response.sourceCapture = sourceCapture;
                } else if (spec.sourceCapture) {
                    delete response.sourceCapture;
                }

                return response;
            },
            [sourceCapture]
        )
    );
}

export default useSourceCapture;
