import { authenticatedRoutes } from 'app/Authenticated';
import { useNavigate } from 'react-router';
import { ENTITY } from 'types';
import { getPathWithParam, hasLength } from 'utils/misc-utils';

export default function useEntityCreateNavigate() {
    const navigate = useNavigate();

    return (
        entity: ENTITY.CAPTURE | ENTITY.MATERIALIZATION,
        id?: string,
        replace?: boolean
    ) => {
        if (entity === ENTITY.CAPTURE) {
            navigate(
                hasLength(id)
                    ? getPathWithParam(
                          authenticatedRoutes.captures.create.fullPath,
                          authenticatedRoutes.captures.create.params
                              .connectorID,
                          id
                      )
                    : authenticatedRoutes.captures.create.fullPath,
                {
                    replace,
                }
            );
        } else {
            navigate(
                hasLength(id)
                    ? getPathWithParam(
                          authenticatedRoutes.materializations.create.fullPath,
                          authenticatedRoutes.materializations.create.params
                              .connectorId,
                          id
                      )
                    : authenticatedRoutes.materializations.create.fullPath,
                {
                    replace,
                }
            );
        }
    };
}
