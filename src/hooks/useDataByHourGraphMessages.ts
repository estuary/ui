import { useMemo } from 'react';

import { useEntityType } from 'src/context/EntityContext';

function useDataByHourGraphMessages() {
    const entityType = useEntityType();

    return useMemo(() => {
        // A collection is described by what flows through it; a task is
        // described by what it moved itself.
        const isCollection = entityType === 'collection';
        const read = isCollection ? 'Out' : 'Read';
        const written = isCollection ? 'In' : 'Written';

        return {
            dataWritten: `Data ${written}`,
            dataRead: `Data ${read}`,
            docsWritten: `Docs ${written}`,
            docsRead: `Docs ${read}`,
        };
    }, [entityType]);
}

export default useDataByHourGraphMessages;
