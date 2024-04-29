import { Button } from '@mui/material';
import { createRefreshToken } from 'api/tokens';
import { useZustandStore } from 'context/Zustand/provider';
import { FormattedMessage } from 'react-intl';
import {
    SelectableTableStore,
    selectableTableStoreSelectors,
} from 'stores/Tables/Store';
import { SelectTableStoreNames } from 'stores/names';

function RefreshTokenGenerateButton() {
    const hydrate = useZustandStore<
        SelectableTableStore,
        SelectableTableStore['hydrate']
    >(
        SelectTableStoreNames.REFRESH_TOKENS,
        selectableTableStoreSelectors.query.hydrate
    );

    const createToken = async (event: React.MouseEvent<HTMLElement>) => {
        event.preventDefault();

        const response = await createRefreshToken(true, '1 year');

        console.log('created token', response);

        if (response.error) {
            console.log('error');
        }

        hydrate();
    };

    return (
        <Button onClick={createToken} variant="outlined">
            <FormattedMessage id="admin.cli_api.refreshToken.cta.generate" />
        </Button>
    );
}

export default RefreshTokenGenerateButton;
