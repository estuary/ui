export interface BaseStatsProps {
    failed?: boolean;
    read?: boolean;
    val?: number | null | undefined;
}

export interface StatsCellProps extends BaseStatsProps {
    formatter: (val: number) => string;
    statType: 'bytes' | 'docs';
}
