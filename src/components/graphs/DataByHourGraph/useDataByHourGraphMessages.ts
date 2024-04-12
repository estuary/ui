import { useEntityType } from 'context/EntityContext';
import { useMemo } from 'react';
import { useIntl } from 'react-intl';

function useDataByHourGraphMessages() {
    const intl = useIntl();
    const entityType = useEntityType();

    return useMemo(() => {
        const dataMsg = intl.formatMessage({ id: 'data.data' });
        const docsMsg = intl.formatMessage({ id: 'data.docs' });

        const isCollection = entityType === 'collection';
        const readMessageKey = isCollection ? 'data.read' : 'data.read';
        const writtenMessageKey = isCollection
            ? 'data.written'
            : 'data.written';

        const dataWritten = intl.formatMessage(
            { id: writtenMessageKey },
            {
                type: dataMsg,
            }
        );
        const dataRead = intl.formatMessage(
            { id: readMessageKey },
            {
                type: dataMsg,
            }
        );

        const docsWritten = intl.formatMessage(
            { id: writtenMessageKey },
            {
                type: docsMsg,
            }
        );
        const docsRead = intl.formatMessage(
            { id: readMessageKey },
            {
                type: docsMsg,
            }
        );

        return {
            dataWritten,
            dataRead,
            docsWritten,
            docsRead,
        };
    }, [entityType, intl]);
}

export default useDataByHourGraphMessages;
