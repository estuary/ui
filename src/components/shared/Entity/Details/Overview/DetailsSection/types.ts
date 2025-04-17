import type { LiveSpecsQuery_details } from 'src/hooks/useLiveSpecs';

export interface DetailsSectionProps {
    entityName: string;
    latestLiveSpec: LiveSpecsQuery_details | null;
    loading: boolean;
}
