import { Box, Tab, Tabs } from '@mui/material';
import { useIntl } from 'react-intl';

interface Props {
    handleChange: any;
    tabIndex: number;
}

function LoginTabs({ handleChange, tabIndex }: Props) {
    const intl = useIntl();

    if (!handleChange) {
        return null;
    }

    return (
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabIndex} onChange={handleChange} variant="fullWidth">
                <Tab
                    label={intl.formatMessage({
                        id: 'login.tabs.login',
                    })}
                />
                <Tab
                    label={intl.formatMessage({
                        id: 'login.tabs.register',
                    })}
                />
            </Tabs>
        </Box>
    );
}

export default LoginTabs;
