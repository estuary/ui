import type { SelectTableStoreNames } from 'src/stores/names';

export interface BaseStatsProps {
    failed?: boolean;
    read?: boolean;
    val?: number | null | undefined;
}

export interface StatsCellProps extends BaseStatsProps {
    formatter: (val: number) => string;
    statType: 'bytes' | 'docs';
}

export interface StatsHeaderProps {
    selectableTableStoreName: SelectTableStoreNames;
    header?: string;
    hideFilter?: boolean;
    firstHeaderSuffix?: 'data.written' | 'data.read' | 'data.in';
    secondHeaderSuffix?: 'data.written' | 'data.out';
}
