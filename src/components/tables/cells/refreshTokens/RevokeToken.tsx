import { Button, TableCell } from '@mui/material';
import { INVALID_TOKEN_INTERVAL, updateRefreshTokenValidity } from 'api/tokens';
import { useZustandStore } from 'context/Zustand/provider';
import { FormattedMessage } from 'react-intl';
import {
    SelectableTableStore,
    selectableTableStoreSelectors,
} from 'stores/Tables/Store';
import { SelectTableStoreNames } from 'stores/names';

interface Props {
    id: string;
}

function RevokeTokenButton({ id }: Props) {
    const hydrate = useZustandStore<
        SelectableTableStore,
        SelectableTableStore['hydrate']
    >(
        SelectTableStoreNames.REFRESH_TOKENS,
        selectableTableStoreSelectors.query.hydrate
    );

    const revokeToken = async (event: React.MouseEvent<HTMLElement>) => {
        event.preventDefault();

        const response = await updateRefreshTokenValidity(
            id,
            INVALID_TOKEN_INTERVAL
        );

        console.log('revoked token', response);

        if (response.error) {
            console.log('error');
        }

        hydrate();
    };

    return (
        <TableCell>
            <Button variant="text" onClick={revokeToken}>
                <FormattedMessage id="cta.revoke" />
            </Button>
        </TableCell>
    );
}

export default RevokeTokenButton;
