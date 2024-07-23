import { Box, Typography } from '@mui/material';
import FullPageDialog from 'components/fullPage/Dialog';
import useLoginBodyClass from 'hooks/login/useLoginBodyClass';
import { FormattedMessage } from 'react-intl';
import { BaseComponentProps } from 'types';
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
        <FullPageDialog>
            <Box sx={{ mt: 2, minWidth: 300, maxWidth: 300 }}>
                {handleChange ? (
                    <LoginTabs
                        handleChange={handleChange}
                        tabIndex={tabIndex}
                    />
                ) : null}
            </Box>

            {/*Using h1 as this is the "most important" text on the page and might help with SEO*/}
            <Typography component="h1" align="center" sx={{ my: 4 }}>
                <FormattedMessage
                    id={
                        isRegister
                            ? 'login.register.message'
                            : 'login.login.message'
                    }
                />
            </Typography>

            {children}
        </FullPageDialog>
    );
};

export default LoginWrapper;
