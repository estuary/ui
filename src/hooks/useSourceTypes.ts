import { useState } from 'react';
import axios from 'services/axios';

type SourceTypesService = {
    isFetching: boolean;
    sourceTypes: any;
    sourceTypeError: any;
};

const useSourceTypes = (): SourceTypesService => {
    const [sourceTypes, setSourceTypes] = useState<object | null>(null);
    const [sourceTypeError, setError] = useState<string | null>(null);
    const [isFetching, setIsFetching] = useState<boolean>(true);

    axios.get(`/sources/all`).then(
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

    return { isFetching, sourceTypeError, sourceTypes };
};

export default useSourceTypes;
