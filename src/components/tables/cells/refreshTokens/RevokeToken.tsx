import { useState } from 'react';

import { Stack, TableCell, Tooltip, useTheme } from '@mui/material';

import { PostgrestError } from '@supabase/postgrest-js';
import { WarningCircle } from 'iconoir-react';
import { FormattedMessage } from 'react-intl';

import {
    INVALID_TOKEN_INTERVAL,
    updateRefreshTokenValidity,
} from 'src/api/tokens';
import SafeLoadingButton from 'src/components/SafeLoadingButton';
import Error from 'src/components/shared/Error';
import { sample_blue } from 'src/context/Theme';
import { useZustandStore } from 'src/context/Zustand/provider';
import { SelectTableStoreNames } from 'src/stores/names';
import {
    SelectableTableStore,
    selectableTableStoreSelectors,
} from 'src/stores/Tables/Store';

interface Props {
    id: string;
}

function RevokeTokenButton({ id }: Props) {
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
                <SafeLoadingButton
                    color={error ? 'error' : 'primary'}
                    loading={saving}
                    onClick={revokeToken}
                    variant="text"
                >
                    <FormattedMessage id="cta.remove" />
                </SafeLoadingButton>

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
