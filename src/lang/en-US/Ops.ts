export const Ops: Record<string, string> = {
    'ops.logsTable.label.level': `Level`,
    'ops.logsTable.label.ts': `Timestamp`,
    'ops.logsTable.label.message': `Message`,
    'ops.logsTable.label.fields': `Fields`,
    'ops.logsTable.allOldLogsLoaded': ` Start of logs `,
    'ops.logsTable.emptyTableDefault.header': `No logs found.`,
    'ops.logsTable.emptyTableDefault.message': `We were unable to find any logs. Please press refresh to try loading again.`,
    'ops.logsTable.footer.lines': `{count} {count, plural,
        one {log}
        other {logs}
    }`,
    'ops.logsTable.hydrationError': `We encountered a problem retrieving logs.`,
    'ops.logsTable.hydrationError.message': `Please check your network connection and try again.`,
    'ops.logsTable.tailNewLogs': `stay at bottom as new logs load`,

    // These keys get generated inside the WaitingForRowBase
    'ops.logsTable.waitingForLogs.old.failed': `A network error occurred. Please reload.`,
    'ops.logsTable.waitingForLogs.new.failed': `A network error occurred. Please reload.`,
    'ops.logsTable.waitingForLogs.old.complete': `All older logs read`,
    'ops.logsTable.waitingForLogs.old': `Fetching older logs`,
    'ops.logsTable.waitingForLogs.new': `Waiting for new logs`,

    'ops.shouldNotShowLogs': `This kind of entity does not support logs`,

    // Journals
    'journals.notFound.title': `Not Found`,
    'journals.tooFewDocuments.title': `Low document count`,
    'journals.tooFewDocuments.message': `Fewer documents than desired were found. This could mean that your entity isn't seeing very much data.`,
    'journals.tooManyBytes.title': `Large documents`,
    'journals.tooManyBytes.message': `Exceeded the maximum bytes before reaching the desired number of documents. This probably means that your documents are large.`,
    'journals.tooManyBytesAndNoDocuments.title': `Read limit reached`,
    'journals.tooManyBytesAndNoDocuments.message': `We reached the limit of how much data a web browser can comfortably read, and didn't find even reach the end of one document! This probably means that your documents are huge.`,

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
