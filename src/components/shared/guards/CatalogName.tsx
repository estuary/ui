import type { BaseComponentProps } from 'types';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'hooks/searchParams/useGlobalSearchParams';
import EntityNotFound from 'pages/error/EntityNotFound';
import { hasLength } from 'utils/misc-utils';
import { validateCatalogName } from 'validation';

function CatalogNameGuard({ children }: BaseComponentProps) {
    const catalogName = useGlobalSearchParams(GlobalSearchParams.CATALOG_NAME);

    if (hasLength(validateCatalogName(catalogName, false, true))) {
        return <EntityNotFound catalogName={catalogName} />;
    }

    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <>{children}</>;
}

export default CatalogNameGuard;
