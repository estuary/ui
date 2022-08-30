import { authenticatedRoutes } from 'app/Authenticated';
import { useNavigate } from 'react-router';
import { ENTITY } from 'types';
import { getPathWithParam } from 'utils/misc-utils';

export default function useEntityCreateNavigate() {
    const navigate = useNavigate();

    return (
        entity: ENTITY.CAPTURE | ENTITY.MATERIALIZATION,
        id: string,
        replace?: boolean
    ) => {
        if (entity === ENTITY.CAPTURE) {
            navigate(
                getPathWithParam(
                    authenticatedRoutes.captures.create.fullPath,
                    authenticatedRoutes.captures.create.params.connectorID,
                    id
                ),
                {
                    replace,
                }
            );
        } else {
            navigate(
                getPathWithParam(
                    authenticatedRoutes.materializations.create.fullPath,
                    authenticatedRoutes.materializations.create.params
                        .connectorId,
                    id
                ),
                {
                    replace,
                }
            );
        }
    };
}
