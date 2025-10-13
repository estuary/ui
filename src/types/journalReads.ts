import type { JOURNAL_READ_WARNINGS } from 'src/utils/misc-utils';

export type JournalReadWarnings =
    | (typeof JOURNAL_READ_WARNINGS)[number]
    | null
    | undefined;
