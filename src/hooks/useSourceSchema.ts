import axios from 'axios';
import { useCallback, useEffect, useState } from 'react';

type SourceSchemaService = {
    isFetching: boolean;
    schema: any;
    error: any;
    image: any;
    fetchSchema: any;
}

const useSourceSchema = (
    key: string
): SourceSchemaService => {
    const [schema, setSchema] = useState<object | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [image, setImage] = useState<string | null>(null);
    const [isFetching, setIsFetching] = useState<boolean>(false);

    const fetchSchema = useCallback(async () => {
        setIsFetching(true);
        setError(null);
        axios.get(`http://localhost:3001/source/path/${encodeURIComponent(key)}`).then(
            (response) => {
                setIsFetching(false);
                setSchema(response.data.config);
                setImage(response.data.details.image);
            },
            (error) => {
                setIsFetching(false);
                setError(
                    error.response ? error.response.data.message : error.message
                );
            }
        );
    }, [key]);

    useEffect(() => {
        (async () => {
            if (key) {
                await fetchSchema();
            }
        })();
    }, [fetchSchema, key]);

    return { isFetching, schema, image, error, fetchSchema };
};

export default useSourceSchema;