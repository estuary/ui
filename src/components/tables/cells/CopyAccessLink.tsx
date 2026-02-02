import { TableCell, Tooltip } from '@mui/material';

import { useIntl } from 'react-intl';

import { unauthenticatedRoutes } from 'src/app/routes';
import CopyToClipboardButton from 'src/components/shared/buttons/CopyToClipboardButton';
import { useUserStore } from 'src/context/User/useUserContextStore';
import { GlobalSearchParams } from 'src/hooks/searchParams/useGlobalSearchParams';
import { getPathWithParams } from 'src/utils/misc-utils';

interface Props {
    token: string;
}

const LOGIN_LINK_URL = `${window.location.origin}${unauthenticatedRoutes.login.path}`;
const SSO_LOGIN_LINK_URL = `${window.location.origin}${unauthenticatedRoutes.sso.login.fullPath}`;

function CopyAccessLink({ token }: Props) {
    const intl = useIntl();

    const usedSSO = useUserStore((state) => state.userDetails?.usedSSO);

    const accessLink = getPathWithParams(
        usedSSO ? SSO_LOGIN_LINK_URL : LOGIN_LINK_URL,
        {
            [GlobalSearchParams.GRANT_TOKEN]: token,
        }
    );

    return (
        <TableCell>
            <Tooltip title={accessLink}>
                <span>
                    <CopyToClipboardButton writeValue={accessLink}>
                        {intl.formatMessage({
                            id: 'cta.inviteLink',
                        })}
                    </CopyToClipboardButton>
                </span>
            </Tooltip>
        </TableCell>
    );
}

export default CopyAccessLink;
