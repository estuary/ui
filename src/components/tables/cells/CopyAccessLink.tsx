import { TableCell, Tooltip } from '@mui/material';

import { useIntl } from 'react-intl';

import { unauthenticatedRoutes } from 'src/app/routes';
import CopyToClipboardButton from 'src/components/shared/buttons/CopyToClipboardButton';
import { GlobalSearchParams } from 'src/hooks/searchParams/useGlobalSearchParams';
import { getPathWithParams } from 'src/utils/misc-utils';

interface Props {
    token: string;
}

const baseURL = `${window.location.origin}${unauthenticatedRoutes.login.path}`;

function CopyAccessLink({ token }: Props) {
    const intl = useIntl();

    const accessLink = getPathWithParams(baseURL, {
        [GlobalSearchParams.GRANT_TOKEN]: token,
    });

    return (
        <TableCell>
            <Tooltip title={accessLink}>
                <CopyToClipboardButton writeValue={accessLink}>
                    {intl.formatMessage({
                        id: 'cta.inviteLink',
                    })}
                </CopyToClipboardButton>
            </Tooltip>
        </TableCell>
    );
}

export default CopyAccessLink;
