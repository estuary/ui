import { infer } from '@estuary/flow-web';
import { isPlainObject } from 'lodash';
import { useEffect, useState } from 'react';

function useFlowInfer(schema: any) {
    const [data, setData] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const setState = (dataVal: typeof data, errorVal: typeof error) => {
            console.log('Setting state', {
                dataVal,
                errorVal,
            });
            setData(dataVal);
            setError(errorVal);
        };

        // If no schema then we can just keep the state
        if (!schema) {
            return;
        }

        // Make sure we have an object
        if (!isPlainObject(schema)) {
            setState([], 'Cannot infer anything that is not an object');
            return;
        }

        // Make an attempt to infer
        try {
            const inferResponse = infer(schema)?.properties;
            // Make sure there is a response
            if (inferResponse?.length === 0) {
                setState([], 'No properties were able to be inferred');
                return;
            }

            setState(inferResponse, null);
        } catch (err: unknown) {
            setState([], err as string);
        }
    }, [schema]);

    console.log('returning = ', {
        data,
        error,
    });

    return {
        data,
        error,
    };
}

export default useFlowInfer;
