import { createContext, useContext } from 'react';

import { DataPlaneNode } from 'src/api/dataPlanesGql';
import {
    FragmentStore,
    useStorageMappingService,
} from 'src/api/storageMappingsGql';

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
    const value: ConnectionTestContextValue = {
        catalog_prefix,
        results: new Map(),
    };

    return (
        <ConnectionTestContext.Provider value={value}>
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

    const results = context.results;

    const { testConnection, testSingleConnection } = useStorageMappingService();

    const testAll = async (
        dataPlanes: DataPlaneNode[],
        stores: FragmentStore[]
    ) => {
        if (!context.catalog_prefix) {
            throw new Error('Catalog prefix is not defined in context');
        }

        const results = await testConnection(
            context.catalog_prefix,
            dataPlanes,
            stores
        );

        console.log('Connection test results:', results);
        for (const result of results) {
            const dataPlane = dataPlanes.find(
                (dp) => dp.dataPlaneName === result.dataPlaneName
            );
            if (!dataPlane) {
                console.log('No matching data plane found for result', result);
                continue;
            }

            console.log('store vs stores', result.fragmentStore, stores);
            const store = stores.find((s) => s.bucket === result.fragmentStore);
            if (!store) {
                console.log('No matching store found for result', result);
                continue;
            }

            for (const store of stores) {
                console.log('Testing store:', store);
                const key: ConnectionTestKey = [dataPlane, store];
                context.results.set(key, {
                    status: result.error ? 'error' : 'success',
                    errorMessage: result.error ?? undefined,
                });
            }
        }
    };

    const retry = async (dataPlane: DataPlaneNode, store: FragmentStore) => {
        if (!context.catalog_prefix) {
            throw new Error('Catalog prefix is not defined in context');
        }

        const key: ConnectionTestKey = [dataPlane, store];
        context.results.set(key, { status: 'testing' });
        const result = await testSingleConnection(
            context.catalog_prefix,
            dataPlane,
            store
        );
        context.results.set(key, {
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
        retry,
        testAll,
        resultFor,
    };
}
