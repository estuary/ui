import { LoadingButton } from '@mui/lab';
import { createRefreshToken } from 'api/tokens';
import { useZustandStore } from 'context/Zustand/provider';
import { isEmpty } from 'lodash';
import { FormattedMessage } from 'react-intl';
import {
    SelectableTableStore,
    selectableTableStoreSelectors,
} from 'stores/Tables/Store';
import { SelectTableStoreNames } from 'stores/names';
import { hasLength } from 'utils/misc-utils';
import { useRefreshTokenStore } from '../Store/create';

const TOKEN_VALIDITY = '1 year';

function GenerateButton() {
    const hydrate = useZustandStore<
        SelectableTableStore,
        SelectableTableStore['hydrate']
    >(
        SelectTableStoreNames.REFRESH_TOKENS,
        selectableTableStoreSelectors.query.hydrate
    );

    const description = useRefreshTokenStore((state) => state.description);
    const saving = useRefreshTokenStore((state) => state.saving);
    const setSaving = useRefreshTokenStore((state) => state.setSaving);
    const setToken = useRefreshTokenStore((state) => state.setToken);
    const setServerError = useRefreshTokenStore(
        (state) => state.setServerError
    );

    const onClick = async (event: React.MouseEvent<HTMLElement>) => {
        event.preventDefault();

        setServerError(null);
        setSaving(true);

        const response = await createRefreshToken(
            true,
            TOKEN_VALIDITY,
            description
        );

        setSaving(false);

        if (response.error || isEmpty(response.data)) {
            setServerError(response.error);

            return;
        }

        hydrate();
        setToken(response.data.secret);
    };

    return (
        <LoadingButton
            disabled={!hasLength(description) || saving}
            loading={saving}
            onClick={onClick}
            sx={{ flexGrow: 1 }}
            variant="contained"
        >
            <span>
                <FormattedMessage id="admin.cli_api.refreshToken.cta.generate" />
            </span>
        </LoadingButton>
    );
}

export default GenerateButton;
