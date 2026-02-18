import type { DataPlaneNode } from 'src/api/dataPlanesGql';
import type { FragmentStore } from 'src/api/storageMappingsGql';

import {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useState,
} from 'react';

import { useStorageMappingService } from 'src/api/storageMappingsGql';

export interface ConnectionTestResult {
    status: 'idle' | 'testing' | 'success' | 'error';
    errorMessage?: string;
}

export type ConnectionTestKey = [DataPlaneNode, FragmentStore];
export type ConnectionTestResults = Map<
    ConnectionTestKey,
    ConnectionTestResult
>;

interface ConnectionTestContextValue {
    catalog_prefix?: string;
    results: ConnectionTestResults;
    setResult: (key: ConnectionTestKey, value: ConnectionTestResult) => void;
}

const defaultResult: ConnectionTestResult = { status: 'idle' };

const ConnectionTestContext = createContext<ConnectionTestContextValue | null>(
    null
);

export function ConnectionTestProvider({
    catalog_prefix,
    children,
}: {
    catalog_prefix?: string;
    children: React.ReactNode;
}) {
    const [results, setResults] = useState<ConnectionTestResults>(
        () => new Map()
    );

    const setResult = useCallback(
        (key: ConnectionTestKey, value: ConnectionTestResult) => {
            const [dataPlane, store] = key;
            setResults((prev) => {
                const next = new Map(prev);
                // Find existing key by value matching (Maps use reference equality)
                for (const [existingKey] of next) {
                    const [dp, s] = existingKey;
                    if (
                        dp.dataPlaneName === dataPlane.dataPlaneName &&
                        s.bucket === store.bucket
                    ) {
                        next.set(existingKey, value);
                        return next;
                    }
                }
                // No existing key found, add new entry
                next.set(key, value);
                return next;
            });
        },
        []
    );

    return (
        <ConnectionTestContext.Provider
            value={{ catalog_prefix, results, setResult }}
        >
            {children}
        </ConnectionTestContext.Provider>
    );
}

export function useConnectionTest() {
    const context = useContext(ConnectionTestContext);
    if (!context) {
        throw new Error(
            'useConnectionTest must be used within ConnectionTestProvider'
        );
    }

    const { results, setResult } = context;

    const { testConnection, testSingleConnection } = useStorageMappingService();

    const testsPassing = useMemo(() => {
        return (
            results.size > 0 &&
            [...results.values()].every((result) => result.status === 'success')
        );
    }, [results]);

    const testAll = async (
        dataPlanes: DataPlaneNode[],
        stores: FragmentStore[]
    ) => {
        if (!context.catalog_prefix) {
            throw new Error('Catalog prefix is not defined in context');
        }

        console.log(
            'Starting connection tests for data planes:',
            dataPlanes,
            'and stores:',
            stores
        );
        // Set all pairs to testing
        for (const dataPlane of dataPlanes) {
            for (const store of stores) {
                setResult([dataPlane, store], { status: 'testing' });
            }
        }

        const testResponse = await testConnection(
            context.catalog_prefix,
            dataPlanes,
            stores
        );

        console.log('Connection test results:', testResponse);
        for (const result of testResponse) {
            const dataPlane = dataPlanes.find(
                (dp) => dp.dataPlaneName === result.dataPlaneName
            );
            if (!dataPlane) {
                console.log('No matching data plane found for result', result);
                continue;
            }

            console.log('store:', result.fragmentStore, 'vs stores:', stores);
            const store = stores.find(
                ({ bucket, provider }) =>
                    bucket === result.fragmentStore.bucket &&
                    provider === result.fragmentStore.provider
            );
            if (!store) {
                console.log('No matching store found for result', result);
                continue;
            }

            const key: ConnectionTestKey = [dataPlane, store];
            const save_me: ConnectionTestResult = {
                status: result.error ? 'error' : 'success',
                errorMessage: result.error ?? undefined,
            };
            console.log('Saving result for key', key, 'as', save_me);
            setResult(key, save_me);
        }
    };

    const retry = async (dataPlane: DataPlaneNode, store: FragmentStore) => {
        if (!context.catalog_prefix) {
            throw new Error('Catalog prefix is not defined in context');
        }

        const key: ConnectionTestKey = [dataPlane, store];
        setResult(key, { status: 'testing' });
        const result = await testSingleConnection(
            context.catalog_prefix,
            dataPlane,
            store
        );
        console.log('Retry connection test result:', result);
        setResult(key, {
            status: result.error ? 'error' : 'success',
            errorMessage: result.error ?? undefined,
        });
    };

    // Helper to find a result in the Map by matching dataPlane and store values
    function resultFor(
        dataPlane: DataPlaneNode,
        store: FragmentStore
    ): ConnectionTestResult {
        for (const [key, value] of results) {
            const [dp, s] = key;
            if (
                dp.dataPlaneName === dataPlane.dataPlaneName &&
                s.bucket === store.bucket
            ) {
                return value;
            }
        }
        return defaultResult;
    }
    return {
        results: context.results,
        testsPassing,
        retry,
        testAll,
        resultFor,
    };
}
