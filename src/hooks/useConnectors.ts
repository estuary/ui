import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import axios from 'services/axios';
import { BaseHook } from 'types/';
import { useAuth } from '../auth/Context';

interface ConnectorsService extends BaseHook {
    data: {
        connectors: ConnectorsResponse[];
    };
}

type ConnectorsResponse = {
    attributes: {
        name: string;
        description: string;
        maintainer: string;
        type: string;
        updated_at: Date;
    };
    links: {
        images: string;
    };
};

const useConnectors = (): ConnectorsService => {
    const [connectors, setConnectors] = useState<ConnectorsResponse[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    const navigate = useNavigate();
    const auth = useAuth();

    const fetchConnectors = useCallback(async () => {
        setLoading(true);
        setError(null);
        axios
            .get(`/connectors`)
            .then((response) => {
                if (response.data.redirect) {
                    auth.signout(() => {
                        navigate('/login', { replace: true });
                    });
                } else {
                    setConnectors(response.data.data);
                }
            })
            .catch((fetchError) => {
                setError(
                    fetchError.response
                        ? fetchError.response.data.message
                        : fetchError.message
                );
            })
            .finally(() => {
                setLoading(false);
            });
    }, [auth, navigate]);

    useEffect(() => {
        void (async () => {
            await fetchConnectors();
        })();
    }, [fetchConnectors]);

    return {
        data: { connectors },
        error,
        loading,
    };
};

export default useConnectors;
