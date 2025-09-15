import type { LiveSpecsQuery_details } from 'src/hooks/useLiveSpecs';

export interface DetailsSectionProps {
    entityName: string;
    latestLiveSpec: LiveSpecsQuery_details | null;
    loading: boolean;
}

export interface ConnectorSectionProps {
    latestLiveSpec: LiveSpecsQuery_details;
}

export interface StatusSectionProps {
    entityName: DetailsSectionProps['entityName'];
}
