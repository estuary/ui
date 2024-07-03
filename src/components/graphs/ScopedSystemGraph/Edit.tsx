import { authenticatedRoutes } from 'app/routes';
import { GlobalSearchParams } from 'hooks/searchParams/useGlobalSearchParams';
import { EditPencil } from 'iconoir-react';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPathWithParams } from 'utils/misc-utils';
import { EntityNodeData } from './EntityNode';
import NodeAction from './NodeAction';

type AllowedPaths = keyof Pick<
    typeof authenticatedRoutes,
    'captures' | 'materializations'
>;

interface Props {
    entityType: EntityNodeData['type'];
    liveSpecId: string;
}

function EditButton({ entityType, liveSpecId }: Props) {
    const navigate = useNavigate();

    const route = useMemo(() => {
        const path: AllowedPaths | null =
            entityType === 'capture'
                ? 'captures'
                : entityType === 'materialization'
                ? 'materializations'
                : null;

        if (path) {
            return getPathWithParams(authenticatedRoutes[path].edit.fullPath, {
                [GlobalSearchParams.LIVE_SPEC_ID]: liveSpecId,
            });
        }

        return null;
    }, [liveSpecId, entityType]);

    if (!route) {
        return null;
    }

    return (
        <NodeAction
            onClick={(event) => {
                event.preventDefault();

                navigate(route);
            }}
            tooltipId="details.scopedSystemGraph.tooltip.action.edit"
        >
            <EditPencil style={{ fontSize: 6 }} />
        </NodeAction>
    );
}

export default EditButton;
