import { useState } from 'react';
import axios from 'services/axios';
import { BaseHook } from '../types';

interface SourceTypesService extends BaseHook {
    data: { sourceTypes: any };
}

const useSourceTypes = (): SourceTypesService => {
    const [sourceTypes, setSourceTypes] = useState<object | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    axios.get(`/sources/all`).then(
        (response) => {
            setLoading(false);
            setSourceTypes(response.data);
        },
        (fetchError) => {
            setLoading(false);
            setError(
                fetchError.response
                    ? fetchError.response.data.message
                    : fetchError.message
            );
        }
    );

    return { data: { sourceTypes }, error, loading };
};

export default useSourceTypes;
