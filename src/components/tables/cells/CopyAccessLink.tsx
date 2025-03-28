import { useState } from 'react';

import { Button, TableCell, Tooltip, useTheme } from '@mui/material';

import { FormattedMessage } from 'react-intl';

import { unauthenticatedRoutes } from 'src/app/routes';
import { getButtonIcon, TransientButtonState } from 'src/context/Theme';
import { GlobalSearchParams } from 'src/hooks/searchParams/useGlobalSearchParams';
import { getPathWithParams } from 'src/utils/misc-utils';

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
