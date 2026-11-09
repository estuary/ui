import { CommonMessages } from 'src/lang/en-US/CommonMessages';
import { CTAs } from 'src/lang/en-US/CTAs';

export const Ops: Record<string, string> = {
    'ops.logsTable.label': `Task Logs`,
    'ops.logsTable.label.level': `Level`,
    'ops.logsTable.label.ts': `Timestamp`,
    'ops.logsTable.label.message': `Message`,
    'ops.logsTable.emptyTableDefault.header': `No logs found.`,
    'ops.logsTable.emptyTableDefault.message': `We were unable to find any logs. Please press refresh to try loading again.`,

    // Dynamically generated in /src/components/tables/Logs/HydrationWarning.tsx
    'ops.hydrationWarning.OFFSET_NOT_YET_AVAILABLE.title': `No logs available`,

    'ops.hydrationWarning.offsetNot.instructions': `Usually this means that your task hasn't processed any data, usually because of a configuration issue (Ex. an invalid storage mapping).  Please {docLink} if you need any help determining why your task isn't producing logs.`,
    'ops.hydrationWarning.offsetNot.instructions.docLink': `${CTAs['cta.support']}`,
    'ops.hydrationWarning.offsetNot.instructions.docPath': `${CommonMessages['support.email']}`,

    // Keys generated inside WaitingForRowBase
    'ops.logsTable.waitingForLogs.old.failed': `A network error occurred. Please reload.`,
    'ops.logsTable.waitingForLogs.new.failed': `A network error occurred. Please reload.`,
    'ops.logsTable.waitingForLogs.old.complete': `All older logs read`,
    'ops.logsTable.waitingForLogs.old': `Fetching older logs`,
    'ops.logsTable.waitingForLogs.new': `Waiting for new logs`,

    // Journals
    'journals.notFound.title': `Not Found`,
    'journals.tooManyBytes.title': `Large documents`,
    'journals.tooManyBytes.message': `Exceeded the maximum bytes before reaching the desired number of documents. This probably means that your documents are large.`,
    'journals.tooManyBytesAndNoDocuments.title': `Read limit reached`,
    'journals.tooManyBytesAndNoDocuments.message': `We reached the limit of how much data a web browser can comfortably read, and did not find any documents. This probably means that your documents are huge.`,

    // Shard Status
    'shardStatus.primary': `PRIMARY`,
    'shardStatus.failed': `FAILED`,
    'shardStatus.schema': `SCHEMA UPDATING`,
    'shardStatus.schema.note': `This will automatically resolve.`,
    'shardStatus.idle': `PENDING`,
    'shardStatus.standby': `PENDING`,
    'shardStatus.backfill': `PENDING`,
    'shardStatus.disabled': `DISABLED`,
    'shardStatus.basicCollection': `Collection`,
    'shardStatus.none': `No shard status found.`,
};
