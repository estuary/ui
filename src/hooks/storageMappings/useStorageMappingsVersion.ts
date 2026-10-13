import { useSyncExternalStore } from 'react';

let storageMappingsVersion = 0;
const storageMappingsListeners = new Set<() => void>();

export function useStorageMappingsVersion() {
    const version = useSyncExternalStore(
        subscribeToStorageMappings,
        getStorageMappingsVersion,
        getStorageMappingsVersion
    );

    return { version, notifyChange };
}

function notifyChange() {
    storageMappingsVersion += 1;
    storageMappingsListeners.forEach((listener) => listener());
}

function subscribeToStorageMappings(listener: () => void) {
    storageMappingsListeners.add(listener);
    return () => {
        storageMappingsListeners.delete(listener);
    };
}

function getStorageMappingsVersion() {
    return storageMappingsVersion;
}
