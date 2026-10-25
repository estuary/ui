import type { StorageMappingConnection } from 'src/api/gql/storageMappings';

import { useCallback, useState } from 'react';

import { ConnectionAccordian } from 'src/components/admin/Settings/StorageMappings/ConnectionTest/ConnectionAccordian';
import { useConnectionTestContext } from 'src/components/admin/Settings/StorageMappings/ConnectionTest/ConnectionTestContext';
import { List } from 'src/components/shared/List';

export function ConnectionList() {
    const { connections, testConnection } = useConnectionTestContext();
    console.log('** connections =', connections);

    const [expandedKey, setExpandedKey] = useState<string | null>(null);

    const handleToggle = useCallback(({ key }: StorageMappingConnection) => {
        setExpandedKey((currKey) => (currKey !== key ? key : null));
    }, []);

    const handleRetry = useCallback(
        async (connection: StorageMappingConnection) => {
            testConnection(connection.key);
        },
        [testConnection]
    );

    return (
        <List spacing={1} sx={{ contain: 'inline-size' }}>
            {connections.map((connection) => (
                <ConnectionListItem
                    key={connection.key}
                    connection={connection}
                    expanded={expandedKey === connection.key}
                    onToggle={handleToggle}
                    onRetryClick={handleRetry}
                />
            ))}
        </List>
    );
}

interface ConnectionListItemProps {
    connection: StorageMappingConnection;
    expanded?: boolean;
    onToggle?: (connection: StorageMappingConnection) => void;
    onRetryClick?: (connection: StorageMappingConnection) => Promise<void>;
}

function ConnectionListItem({
    connection,
    expanded = false,
    onToggle,
    onRetryClick,
}: ConnectionListItemProps) {
    const handleToggle = useCallback(() => {
        onToggle?.(connection);
    }, [connection, onToggle]);

    const handleRetryClick = useCallback(async () => {
        await onRetryClick?.(connection);
    }, [connection, onRetryClick]);

    return (
        <ConnectionAccordian
            key={connection.key}
            connection={connection}
            expanded={expanded}
            onToggle={handleToggle}
            onRetryClick={handleRetryClick}
        />
    );
}
