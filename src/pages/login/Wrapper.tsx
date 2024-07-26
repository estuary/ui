import { Stack, Typography } from '@mui/material';
import FullPageDialog from 'components/fullPage/Dialog';
import Logo from 'components/navigation/Logo';
import useLoginBodyClass from 'hooks/login/useLoginBodyClass';
import { FormattedMessage } from 'react-intl';
import { BaseComponentProps } from 'types';
import RegisterPerk from './Perk';
import LoginTabs from './Tabs';

interface Props extends BaseComponentProps {
    handleChange?: (event: any, val: any) => void;
    tabIndex: number;
    isRegister: boolean;
}

const LoginWrapper = ({
    children,
    handleChange,
    isRegister,
    tabIndex,
}: Props) => {
    useLoginBodyClass();

    return (
        <FullPageDialog
            paperSx={{
                width: '100%',
                minWidth: 320,
                maxWidth: 550,
            }}
        >
            <Stack spacing={4}>
                <LoginTabs handleChange={handleChange} tabIndex={tabIndex} />

                <Stack spacing={2} style={{ alignItems: 'center' }}>
                    <Logo width={50} />
                    {/*Using h1 as this is the "most important" text on the page and might help with SEO*/}
                    <Typography component="h1" align="center" variant="h5">
                        <FormattedMessage
                            id={
                                isRegister
                                    ? 'login.register.message'
                                    : 'login.login.message'
                            }
                        />
                    </Typography>
                </Stack>

                {isRegister ? (
                    <Stack
                        useFlexGap
                        direction={{ xs: 'column', sm: 'row' }}
                        style={{
                            alignItems: 'center',
                            justifyContent: 'space-around',
                        }}
                    >
                        <RegisterPerk messageID="login.register.perks1" />
                        <RegisterPerk messageID="login.register.perks2" />
                    </Stack>
                ) : null}

                {children}
            </Stack>
        </FullPageDialog>
    );
};

export default LoginWrapper;
