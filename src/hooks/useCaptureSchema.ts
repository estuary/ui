import axios from 'axios';
import { useCallback, useEffect, useState } from 'react';

type CaptureSchemaService = {
    isFetching: boolean;
    schema: object | null;
    error: string | null;
    fetchSchema: any;
}

const useCaptureSchema = (): CaptureSchemaService => {
    const [schema, setSchema] = useState<object | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isFetching, setIsFetching] = useState<boolean>(true);

    const fetchSchema = useCallback(async () => {
        setError(null);
        axios.get(`http://localhost:3001/capture`).then(
            (response) => {
                setIsFetching(false);
                setSchema(response.data);
            },
            (error) => {
                setIsFetching(false);
                setError(
                    error.response ? error.response.data.message : error.message
                );
            }
        );
    }, []);

    useEffect(() => {
        (async () => {
            await fetchSchema();
        })();
    }, [fetchSchema]);

    return { isFetching, schema, error, fetchSchema };
};

export default useCaptureSchema;