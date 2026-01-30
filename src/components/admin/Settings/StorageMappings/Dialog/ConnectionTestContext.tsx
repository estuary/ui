import type { ConnectionTestResult } from 'src/components/admin/Settings/StorageMappings/Dialog/schema';

import { createContext, useContext } from 'react';

import { DataPlaneNode } from 'src/api/dataPlanesGql';
import { FragmentStore } from 'src/api/storageMappingsGql';

export type ConnectionTestKey = [DataPlaneNode, FragmentStore];
export type ConnectionTestResults = Map<
    ConnectionTestKey,
    ConnectionTestResult
>;

interface ConnectionTestContextValue {
    getResult: (key: ConnectionTestKey) => ConnectionTestResult;
    retryConnection: (key: ConnectionTestKey) => void;
}

const defaultResult: ConnectionTestResult = { status: 'idle' };

const ConnectionTestContext = createContext<ConnectionTestContextValue | null>(
    null
);

export function ConnectionTestProvider({
    children,
    results,
    onRetry,
}: {
    children: React.ReactNode;
    results: ConnectionTestResults;
    onRetry: (key: ConnectionTestKey) => void;
}) {
    const value: ConnectionTestContextValue = {
        getResult: (key) => results.get(key) ?? defaultResult,
        retryConnection: onRetry,
    };

    return (
        <ConnectionTestContext.Provider value={value}>
            {children}
        </ConnectionTestContext.Provider>
    );
}

export function useConnectionTest(key: ConnectionTestKey) {
    const context = useContext(ConnectionTestContext);
    if (!context) {
        throw new Error(
            'useConnectionTest must be used within ConnectionTestProvider'
        );
    }
    return {
        result: context.getResult(key),
        retry: () => context.retryConnection(key),
    };
}
