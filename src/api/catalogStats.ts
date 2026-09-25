import type { DataGrains } from 'src/components/graphs/types';

export interface DocsAndBytes {
    docsTotal: bigint;
    bytesTotal: bigint;
}

export interface CatalogStats {
    catalogName: string;
    grain: DataGrains;
    timestamp: number;
    readByMe: DocsAndBytes;
    readFromMe: DocsAndBytes;
    writtenByMe: DocsAndBytes;
    writtenToMe: DocsAndBytes;
}

export interface CatalogStatsDetails {
    catalogName: string;
    grain: CatalogStats['grain'];
    timestamp: number;
    bytesRead?: number;
    docsRead?: number;
    bytesWritten?: number;
    docsWritten?: number;
}
