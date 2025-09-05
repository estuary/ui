export interface ActiveOrResolvedCellsProps {
    firedAt: string;
    resolvedAt: string | null;
    currentlyActive?: boolean;
    hideResolvedAt?: boolean;
}
