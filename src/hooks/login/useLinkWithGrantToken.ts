import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'src/hooks/searchParams/useGlobalSearchParams';
import { getPathWithParams } from 'src/utils/misc-utils';

function useLinkWithGrantToken(href: string) {
    const grantToken = useGlobalSearchParams(GlobalSearchParams.GRANT_TOKEN);

    if (grantToken) {
        return getPathWithParams(href, {
            [GlobalSearchParams.GRANT_TOKEN]: grantToken,
        });
    }

    return href;
}

export default useLinkWithGrantToken;
