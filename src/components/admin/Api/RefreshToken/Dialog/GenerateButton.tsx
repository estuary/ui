import { Button } from '@mui/material';

import { useIntl } from 'react-intl';

import { useCreateRefreshToken } from 'src/api/gql/refreshTokens';
import { useRefreshTokenStore } from 'src/components/admin/Api/RefreshToken/Store/create';
import { hasLength } from 'src/utils/misc-utils';

const TOKEN_VALIDITY = 'P1Y';

function GenerateButton() {
    const intl = useIntl();

    const [, createRefreshToken] = useCreateRefreshToken();

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

        const result = await createRefreshToken({
            multiUse: true,
            validFor: TOKEN_VALIDITY,
            detail: description,
        });

        setSaving(false);

        if (result.error || !result.data?.createRefreshToken) {
            setServerError(
                result.error?.message ??
                    intl.formatMessage({
                        id: 'admin.cli_api.refreshToken.dialog.alert.tokenEncodingFailed',
                    })
            );

            return;
        }

        const { id, secret } = result.data.createRefreshToken;

        // The refresh token ID and secret are needed by Flow, therefore it was decided
        // to base64 encode the data returned in the response and present that as the
        // one-time secret presented to the user.
        const token = Buffer.from(JSON.stringify({ id, secret })).toString(
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
        <Button
            disabled={!hasLength(description) || saving}
            loading={saving}
            onClick={onClick}
            sx={{ flexGrow: 1 }}
            variant="contained"
        >
            {intl.formatMessage({
                id: 'admin.cli_api.refreshToken.cta.generate',
            })}
        </Button>
    );
}

export default GenerateButton;
