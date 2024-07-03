import { authenticatedRoutes } from 'app/routes';
import { GlobalSearchParams } from 'hooks/searchParams/useGlobalSearchParams';
import { ArrowRight } from 'iconoir-react';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPathWithParams } from 'utils/misc-utils';
import { EntityNodeData } from './EntityNode';
import NodeAction from './NodeAction';

const getDetailsPageURLPath = (entityType: string): string => {
    if (entityType === 'collection') {
        return authenticatedRoutes.collections.details.overview.fullPath;
    }

    if (entityType === 'capture') {
        return authenticatedRoutes.captures.details.overview.fullPath;
    }

    return authenticatedRoutes.materializations.details.overview.fullPath;
};

interface Props {
    catalogName: EntityNodeData['label'];
    entityType: EntityNodeData['type'];
    relationship: EntityNodeData['relationship'];
}

function DetailsButton({ catalogName, entityType, relationship }: Props) {
    const navigate = useNavigate();

    const route = useMemo(() => {
        const basePath =
            relationship === 'self' ? null : getDetailsPageURLPath(entityType);

        if (basePath) {
            return getPathWithParams(basePath, {
                [GlobalSearchParams.CATALOG_NAME]: catalogName,
            });
        }

        return null;
    }, [catalogName, entityType, relationship]);

    if (!route) {
        return null;
    }

    return (
        <NodeAction
            onClick={(event) => {
                event.preventDefault();

                navigate(route);
            }}
            tooltipId="details.scopedSystemGraph.tooltip.action.details"
        >
            <ArrowRight style={{ fontSize: 6 }} />
        </NodeAction>
    );
}

export default DetailsButton;
