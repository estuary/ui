import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'src/hooks/searchParams/useGlobalSearchParams';
import EntityNotFound from 'src/pages/error/EntityNotFound';
import type { BaseComponentProps } from 'src/types';
import { hasLength } from 'src/utils/misc-utils';
import { validateCatalogName } from 'src/validation';

function CatalogNameGuard({ children }: BaseComponentProps) {
    const catalogName = useGlobalSearchParams(GlobalSearchParams.CATALOG_NAME);

    if (hasLength(validateCatalogName(catalogName, false, true))) {
        return <EntityNotFound catalogName={catalogName} />;
    }

    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <>{children}</>;
}

export default CatalogNameGuard;
