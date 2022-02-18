import axios from 'axios';
import { useState } from 'react';

type SourceTypesService = {
    isFetching: boolean;
    sourceTypes: any;
    sourceTypeError: any;
};

const useSourceTypes = (): SourceTypesService => {
    const [sourceTypes, setSourceTypes] = useState<object | null>(null);
    const [sourceTypeError, setError] = useState<string | null>(null);
    const [isFetching, setIsFetching] = useState<boolean>(true);

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

    return { isFetching, sourceTypes, sourceTypeError };
};

export default useSourceTypes;
