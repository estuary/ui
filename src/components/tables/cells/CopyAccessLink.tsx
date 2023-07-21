import { ReactNode, useState } from 'react';

import { Check, Copy, WarningCircle } from 'iconoir-react';
import { FormattedMessage } from 'react-intl';

import { Button, TableCell, Theme, Tooltip, useTheme } from '@mui/material';

import { unauthenticatedRoutes } from 'app/routes';

import { GlobalSearchParams } from 'hooks/searchParams/useGlobalSearchParams';

import { getPathWithParams } from 'utils/misc-utils';

interface Props {
    token: string;
}

const baseURL = `${window.location.origin}${unauthenticatedRoutes.login.path}`;

type TransientButtonState = 'success' | 'error' | undefined;

export const getButtonIcon = (
    theme: Theme,
    buttonState: TransientButtonState
): ReactNode => {
    switch (buttonState) {
        case 'success':
            return <Check style={{ color: theme.palette.success.main }} />;
        case 'error':
            return (
                <WarningCircle style={{ color: theme.palette.error.main }} />
            );
        default:
            return <Copy style={{ color: theme.palette.primary.main }} />;
    }
};

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
