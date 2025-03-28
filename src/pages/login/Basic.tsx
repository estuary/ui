import { Box, Divider, Stack } from '@mui/material';

import LoginWrapper from './Wrapper';
import { FormattedMessage } from 'react-intl';

import MagicLink from 'src/components/login/MagicLink';
import LoginProviders from 'src/components/login/Providers';
import useLoginStateHandler from 'src/hooks/login/useLoginStateHandler';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'src/hooks/searchParams/useGlobalSearchParams';
import useBrowserTitle from 'src/hooks/useBrowserTitle';
import { SupportedProvider } from 'src/types/authProviders';
import { getLoginSettings } from 'src/utils/env-utils';

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

    const titleKey = isRegister ? 'routeTitle.register' : 'routeTitle.login';

    useBrowserTitle(titleKey, `${titleKey}.prefix`, {
        descriptionKey: `${titleKey}.description`,
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
