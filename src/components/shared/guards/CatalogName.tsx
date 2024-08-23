import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'hooks/searchParams/useGlobalSearchParams';
import EntityNotFound from 'pages/error/EntityNotFound';
import { logRocketEvent } from 'services/shared';
import { CustomEvents } from 'services/types';
import { BaseComponentProps } from 'types';
import { hasLength } from 'utils/misc-utils';
import { validateCatalogName } from 'validation';

function CatalogNameGuard({ children }: BaseComponentProps) {
    const catalogName = useGlobalSearchParams(GlobalSearchParams.CATALOG_NAME);

    if (hasLength(validateCatalogName(catalogName))) {
        logRocketEvent(CustomEvents.ERROR_INVALID_CATALOG_NAME, {
            catalogName,
        });
        return <EntityNotFound />;
    }

    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <>{children}</>;
}

export default CatalogNameGuard;
