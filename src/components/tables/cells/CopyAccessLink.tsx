import { unauthenticatedRoutes } from 'src/app/routes';
import CopyToClipboardButton from 'src/components/shared/buttons/CopyToClipboardButton';
import { GlobalSearchParams } from 'src/hooks/searchParams/useGlobalSearchParams';
import { getPathWithParams } from 'src/utils/misc-utils';

interface Props {
    token: string;
    ssoProviderId?: string | null;
}

const LOGIN_LINK_URL = `${window.location.origin}${unauthenticatedRoutes.login.path}`;
const SSO_LOGIN_LINK_URL = `${window.location.origin}${unauthenticatedRoutes.sso.login.fullPath}`;

export function CopyAccessLink({ token, ssoProviderId }: Props) {
    const params: Record<string, string> = {
        [GlobalSearchParams.GRANT_TOKEN]: token,
    };

    if (ssoProviderId) {
        params[GlobalSearchParams.SSO_PROVIDER_ID] = ssoProviderId;
    }

    const accessLink = getPathWithParams(
        ssoProviderId ? SSO_LOGIN_LINK_URL : LOGIN_LINK_URL,
        params
    );

    return (
        <CopyToClipboardButton writeValue={accessLink}>
            Copy Link
        </CopyToClipboardButton>
    );
}
