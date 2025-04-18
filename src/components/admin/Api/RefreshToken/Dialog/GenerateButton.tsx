import type { SelectableTableStore } from 'src/stores/Tables/Store';

import { isEmpty } from 'lodash';
import { FormattedMessage, useIntl } from 'react-intl';

import { createRefreshToken } from 'src/api/tokens';
import { useRefreshTokenStore } from 'src/components/admin/Api/RefreshToken/Store/create';
import SafeLoadingButton from 'src/components/SafeLoadingButton';
import { useZustandStore } from 'src/context/Zustand/provider';
import { SelectTableStoreNames } from 'src/stores/names';
import { selectableTableStoreSelectors } from 'src/stores/Tables/Store';
import { hasLength } from 'src/utils/misc-utils';

const TOKEN_VALIDITY = '1 year';

function GenerateButton() {
    const intl = useIntl();

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

        // The refresh token ID and secret are needed by Flow, therefore it was decided
        // to base64 encode the data returned in the response and present that as the
        // one-time secret presented to the user.
        const token = Buffer.from(JSON.stringify(response.data)).toString(
            'base64'
        );

        if (!hasLength(token)) {
            setServerError(
                intl.formatMessage({
                    id: 'admin.cli_api.refreshToken.dialog.alert.tokenEncodingFailed',
                })
            );

            return;
        }

        setToken(token);
    };

    return (
        <SafeLoadingButton
            disabled={!hasLength(description) || saving}
            loading={saving}
            onClick={onClick}
            sx={{ flexGrow: 1 }}
            variant="contained"
        >
            <FormattedMessage id="admin.cli_api.refreshToken.cta.generate" />
        </SafeLoadingButton>
    );
}

export default GenerateButton;
