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
        const readMessageKey = isCollection ? 'data.out' : 'data.read';
        const writtenMessageKey = isCollection ? 'data.in' : 'data.written';

        return {
            dataWritten: intl.formatMessage(
                { id: writtenMessageKey },
                {
                    type: dataMsg,
                }
            ),
            dataRead: intl.formatMessage(
                { id: readMessageKey },
                {
                    type: dataMsg,
                }
            ),
            docsWritten: intl.formatMessage(
                { id: writtenMessageKey },
                {
                    type: docsMsg,
                }
            ),
            docsRead: intl.formatMessage(
                { id: readMessageKey },
                {
                    type: docsMsg,
                }
            ),
        };
    }, [entityType, intl]);
}

export default useDataByHourGraphMessages;
