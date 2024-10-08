import { Box, Divider, Stack } from '@mui/material';
import MagicLink from 'components/login/MagicLink';
import LoginProviders from 'components/login/Providers';
import useLoginStateHandler from 'hooks/login/useLoginStateHandler';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'hooks/searchParams/useGlobalSearchParams';
import useBrowserTitle from 'hooks/useBrowserTitle';
import { FormattedMessage } from 'react-intl';
import { SupportedProvider } from 'types/authProviders';
import { getLoginSettings } from 'utils/env-utils';
import LoginWrapper from './Wrapper';

const loginSettings = getLoginSettings();

interface Props {
    showRegistration?: boolean;
}

const BasicLogin = ({ showRegistration }: Props) => {
    const provider = useGlobalSearchParams<SupportedProvider | null>(
        GlobalSearchParams.PROVIDER
    );

    const { grantToken, isRegister, tabIndex, handleChange } =
        useLoginStateHandler(showRegistration);

    const ogKeyPrefix = `routeTitle.${isRegister ? 'register' : 'login'}`;

    useBrowserTitle('routeTitle.login', `routeTitle.login.prefix`, {
        ogDescriptionKey: `${ogKeyPrefix}.ogDescription`,
        ogTitleKey: isRegister ? `${ogKeyPrefix}.ogTitle` : undefined,
    });

    return (
        <LoginWrapper
            tabIndex={tabIndex}
            isRegister={isRegister}
            handleChange={handleChange}
        >
            <Stack direction="column" spacing={2}>
                <Box>
                    <LoginProviders
                        providers={provider ? [provider] : undefined}
                        isRegister={isRegister}
                        grantToken={grantToken}
                    />
                </Box>

                {!isRegister && loginSettings.showEmail ? (
                    <>
                        <Divider flexItem>
                            <FormattedMessage id="login.separator" />
                        </Divider>

                        <Box>
                            <MagicLink grantToken={grantToken} />
                        </Box>
                    </>
                ) : null}
            </Stack>
        </LoginWrapper>
    );
};

export default BasicLogin;
