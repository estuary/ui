import { Button, TableCell, Tooltip, useTheme } from '@mui/material';
import { unauthenticatedRoutes } from 'app/routes';
import { GlobalSearchParams } from 'hooks/searchParams/useGlobalSearchParams';
import { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { getPathWithParams } from 'utils/misc-utils';
import { getButtonIcon, TransientButtonState } from 'context/Theme';

interface Props {
    token: string;
}

const baseURL = `${window.location.origin}${unauthenticatedRoutes.login.path}`;

// TODO (optimization): Create a composable copy button component.
function CopyAccessLink({ token }: Props) {
    const theme = useTheme();

    const accessLink = getPathWithParams(baseURL, {
        [GlobalSearchParams.GRANT_TOKEN]: token,
    });

    const [transientButtonState, setTransientButtonState] =
        useState<TransientButtonState>(undefined);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(accessLink).then(
            () => {
                setTransientButtonState('success');

                setTimeout(() => setTransientButtonState(undefined), 2000);
            },
            () => {
                setTransientButtonState('error');

                setTimeout(() => setTransientButtonState(undefined), 2000);
            }
        );
    };

    return (
        <TableCell>
            <Tooltip title={accessLink}>
                <Button
                    variant="text"
                    size="small"
                    endIcon={getButtonIcon(theme, transientButtonState)}
                    color={transientButtonState}
                    onClick={copyToClipboard}
                >
                    <FormattedMessage id="accessGrants.table.accessLinks.label.url" />
                </Button>
            </Tooltip>
        </TableCell>
    );
}

export default CopyAccessLink;
