import axios from 'axios';
import { useCallback, useEffect, useState } from 'react';

type SourceTypesService = {
    isFetching: boolean;
    sourceTypes: any;
    error: any;
    fetchSourceTypes: any;
};

const useSourceTypes = (): SourceTypesService => {
    const [sourceTypes, setSourceTypes] = useState<object | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isFetching, setIsFetching] = useState<boolean>(false);

    const fetchSourceTypes = useCallback(async () => {
        setIsFetching(true);
        setError(null);
        axios.get(`http://localhost:3001/sources/all`).then(
            (response) => {
                setIsFetching(false);
                setSourceTypes(response.data);
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
            await fetchSourceTypes();
        })();
    }, [fetchSourceTypes]);

    return { isFetching, sourceTypes, error, fetchSourceTypes };
};

export default useSourceTypes;
