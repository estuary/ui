import { Box, Tab, Tabs } from '@mui/material';

interface Props {
    handleChange: any;
    tabIndex: number;
}

function LoginTabs({ handleChange, tabIndex }: Props) {
    if (!handleChange) {
        return null;
    }

    return (
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabIndex} onChange={handleChange} variant="fullWidth">
                <Tab label="Sign In" />
                <Tab label="Register" />
            </Tabs>
        </Box>
    );
}

export default LoginTabs;
