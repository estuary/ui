import axios from 'axios';
import { useCallback, useEffect, useState } from 'react';

type ConnectorsService = {
    isFetchingConnectors: boolean;
    connectors: any;
    fetchingConnectorsError: any;
    fetchConnectors: any;
};

const useConnectors = (): ConnectorsService => {
    const [connectors, setConnectors] = useState<object | null>(null);
    const [fetchingConnectorsError, setError] = useState<string | null>(null);
    const [isFetchingConnectors, setIsFetching] = useState<boolean>(false);

    const fetchConnectors = useCallback(async () => {
        setIsFetching(true);
        setError(null);
        axios.get(`http://localhost:3009/connectors`).then(
            (response) => {
                console.log('response', response);
                setIsFetching(false);
                setConnectors(response.data);
            },
            (error) => {
                console.log('Error', error);
                setIsFetching(false);
                setError(
                    error.response ? error.response.data.message : error.message
                );
            }
        );
    }, []);

    useEffect(() => {
        (async () => {
            await fetchConnectors();
        })();
    }, [fetchConnectors]);

    return {
        isFetchingConnectors,
        connectors,
        fetchingConnectorsError,
        fetchConnectors,
    };
};

export default useConnectors;
