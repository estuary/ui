import {
    getPublicationHistoryByCatalogName,
    PublicationSpecsExt_PublicationHistory,
} from 'api/publicationSpecsExt';
import { useSelectNew } from 'hooks/supabase-swr/hooks/useSelect';

function usePublicationSpecsExt_History(catalogName?: string) {
    const { data, error, mutate, isValidating } =
        useSelectNew<PublicationSpecsExt_PublicationHistory>(
            catalogName ? getPublicationHistoryByCatalogName(catalogName) : null
        );

    return {
        publications: data ? data.data : null,
        error,
        mutate,
        isValidating,
    };
}

export default usePublicationSpecsExt_History;
