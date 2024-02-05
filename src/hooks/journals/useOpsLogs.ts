import { useJournalData } from 'hooks/journals/useJournalData';

import { useEffect, useMemo, useState } from 'react';
import { OpsLogFlowDocument } from 'types';
import { maxBytes } from 'components/tables/Logs/shared';
import { useIntl } from 'react-intl';
import { LoadDocumentsOffsets } from './shared';

function useOpsLogs(name: string, collectionName: string) {
    const intl = useIntl();

    const [nothingInLastFetch, setNothingInLastFetch] = useState(false);
    const [olderFinished, setOlderFinished] = useState(false);
    const [lastParsed, setLastParsed] = useState<number>(0);
    const [docs, setDocs] = useState<OpsLogFlowDocument[]>([]);
    const [bytes, setBytes] = useState(maxBytes);

    // TODO (typing)
    //  need to handle typing
    const { data, error, loading, refresh } = useJournalData(
        name,
        collectionName,
        {
            maxBytes: bytes,
        }
    );

    const documents = useMemo(
        () => (data?.documents ?? []) as OpsLogFlowDocument[],
        [data?.documents]
    );

    useEffect(() => {
        if (data?.adjustedBytes && data.adjustedBytes > 0) {
            setBytes(data.adjustedBytes);
        }
    }, [bytes, data?.adjustedBytes]);

    useEffect(() => {
        // Get the mete data out of the response
        const meta = data?.meta;

        // Figure out what the last document offset is
        const parsedEnd = meta?.docsMetaResponse.offset
            ? parseInt(meta.docsMetaResponse.offset, 10)
            : null;

        if (!parsedEnd || documents.length <= 0) {
            return;
        }

        // Since journalData is read kinda async we need to wait to
        //  update documents until we know the meta data changed
        if (parsedEnd !== lastParsed) {
            // If the parsed is lower than the other
            const newDocs = documents;

            // if (parsedEnd === 0) {
            //     console.log('hit the end of logs');
            //     newDocs.unshift({
            //         _meta: {
            //             uuid: UUID_START_OF_LOGS,
            //         },
            //         level: 'waiting',
            //         message: intl.formatMessage({
            //             id: 'ops.logsTable.allOldLogsLoaded',
            //         }),
            //         ts: '',
            //     });
            // }

            setNothingInLastFetch(false);
            setDocs(newDocs);
        } else if (lastParsed > 0) {
            setNothingInLastFetch(true);
        }
    }, [data?.meta, docs, documents, intl, lastParsed]);

    useEffect(() => {
        // Get the mete data out of the response
        const meta = data?.meta;

        // Figure out what the last document offset is
        const parsedEnd = meta?.docsMetaResponse.offset
            ? parseInt(meta.docsMetaResponse.offset, 10)
            : null;

        // Keep track of where we last read data from so we can keep stepping backwards through the file
        setLastParsed(parsedEnd ?? 0);

        // If we have hit 0 then we now we hit the start of the data any nothing older is available
        if (parsedEnd === 0) {
            setOlderFinished(true);
        }
    }, [data?.meta]);

    return useMemo(
        () => ({
            docs,
            error,
            lastParsed,
            loading,
            nothingInLastFetch,
            olderFinished,
            refresh: (newOffset?: LoadDocumentsOffsets) => {
                setNothingInLastFetch(false);
                refresh(newOffset);
            },
        }),
        [
            docs,
            error,
            lastParsed,
            loading,
            nothingInLastFetch,
            olderFinished,
            refresh,
        ]
    );
}

export default useOpsLogs;
