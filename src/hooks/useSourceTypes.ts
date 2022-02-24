import { useState } from 'react';
import axios, { withAxios } from 'services/axios';
import { useAuth } from '../auth/Context';
import { BaseHook } from '../types';

interface SourceTypesService extends BaseHook {
    data: { sourceTypes: any };
}

const useSourceTypes = (): SourceTypesService => {
    const [sourceTypes, setSourceTypes] = useState<object | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    const auth = useAuth();

    withAxios(axios.get('/sources/all'), setError, setLoading, auth)
        .then((response: any) => {
            setSourceTypes(response.data);
        })
        .catch(() => {});

    return { data: { sourceTypes }, error, loading };
};

export default useSourceTypes;
