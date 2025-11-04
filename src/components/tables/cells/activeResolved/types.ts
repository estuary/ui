export interface ActiveOrResolvedCellsProps {
    firedAt: string;
    resolvedAt: string | null | undefined;
    currentlyActive?: boolean;
    hideResolvedAt?: boolean;
}
