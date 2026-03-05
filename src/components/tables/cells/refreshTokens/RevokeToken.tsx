import type { PostgrestError } from '@supabase/postgrest-js';
import type { SelectableTableStore } from 'src/stores/Tables/Store';

import { useState } from 'react';

import { Button, Stack, TableCell, Tooltip, useTheme } from '@mui/material';

import { WarningCircle } from 'iconoir-react';
import { useIntl } from 'react-intl';

import {
    INVALID_TOKEN_INTERVAL,
    updateRefreshTokenValidity,
} from 'src/api/tokens';
import Error from 'src/components/shared/Error';
import { sample_blue } from 'src/context/Theme';
import { useZustandStore } from 'src/context/Zustand/provider';
import { SelectTableStoreNames } from 'src/stores/names';
import { selectableTableStoreSelectors } from 'src/stores/Tables/Store';

interface Props {
    id: string;
}

function RevokeTokenButton({ id }: Props) {
    const intl = useIntl();
    const theme = useTheme();

    const hydrate = useZustandStore<
        SelectableTableStore,
        SelectableTableStore['hydrate']
    >(
        SelectTableStoreNames.REFRESH_TOKENS,
        selectableTableStoreSelectors.query.hydrate
    );

    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<PostgrestError | null>(null);

    const revokeToken = async (event: React.MouseEvent<HTMLElement>) => {
        event.preventDefault();

        setSaving(true);
        setError(null);

        const response = await updateRefreshTokenValidity(
            id,
            INVALID_TOKEN_INTERVAL
        );

        if (response.error) {
            setError(response.error);
            setSaving(false);

            return;
        }

        hydrate();
        setSaving(false);
    };

    return (
        <TableCell>
            <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                <Button
                    color={error ? 'error' : 'primary'}
                    loading={Boolean(saving)}
                    onClick={revokeToken}
                    variant="text"
                >
                    {intl.formatMessage({ id: 'cta.remove' })}
                </Button>

                {error ? (
                    <Tooltip
                        placement="bottom-end"
                        title={
                            <Error
                                condensed
                                error={error}
                                linkOptions={{
                                    sx: { color: sample_blue[200] },
                                }}
                                noAlertBox
                                severity="error"
                            />
                        }
                    >
                        <WarningCircle
                            style={{ color: theme.palette.error.main }}
                        />
                    </Tooltip>
                ) : null}
            </Stack>
        </TableCell>
    );
}

export default RevokeTokenButton;
