import { Stack, TableCell, Tooltip, useTheme } from '@mui/material';
import type { PostgrestError } from '@supabase/postgrest-js';
import { INVALID_TOKEN_INTERVAL, updateRefreshTokenValidity } from 'api/tokens';
import SafeLoadingButton from 'components/SafeLoadingButton';
import Error from 'components/shared/Error';
import { sample_blue } from 'context/Theme';
import { useZustandStore } from 'context/Zustand/provider';
import { WarningCircle } from 'iconoir-react';
import { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { SelectTableStoreNames } from 'stores/names';
import type { SelectableTableStore } from 'stores/Tables/Store';
import { selectableTableStoreSelectors } from 'stores/Tables/Store';

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
