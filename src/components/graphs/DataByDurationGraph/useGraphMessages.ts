import { useMemo } from 'react';
import { useIntl } from 'react-intl';
import { Entity } from 'types';

export default function useGraphMessages(entityType?: Entity) {
    const intl = useIntl();

    return useMemo(() => {
        const dataMsg = intl.formatMessage({ id: 'data.data' });
        const docsMsg = intl.formatMessage({ id: 'data.docs' });

        const isCollection = entityType === 'collection';
        const readMessageKey =
            isCollection || !entityType ? 'data.out' : 'data.read';

        const writtenMessageKey =
            isCollection || !entityType ? 'data.in' : 'data.written';

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
