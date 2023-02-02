import { Divider, Stack, Toolbar } from '@mui/material';
import MuiAppBar from '@mui/material/AppBar';
import { SxProps, Theme, useTheme } from '@mui/material/styles';
import CompanyLogo from 'components/graphics/CompanyLogo';
import HelpMenu from 'components/menus/HelpMenu';
import UserMenu from 'components/menus/UserMenu';
import PageTitle, { PageTitleProps } from 'components/navigation/PageTitle';
import { zIndexIncrement } from 'context/Theme';

interface Props {
    pageTitleProps?: PageTitleProps;
}

const Topbar = ({ pageTitleProps }: Props) => {
    const theme = useTheme();
    const iconSx: SxProps<Theme> = {
        color: theme.palette.text.primary,
    };

    return (
        <MuiAppBar
            sx={{
                position: 'fixed',
                zIndex: theme.zIndex.drawer + zIndexIncrement,
            }}
        >
            <Toolbar
                sx={{
                    px: 1,
                    justifyContent: 'space-between',
                }}
            >
                <Stack
                    direction="row"
                    spacing={3}
                    sx={{ alignItems: 'center' }}
                    divider={<Divider orientation="vertical" flexItem />}
                >
                    <CompanyLogo />

                    {pageTitleProps ? (
                        <PageTitle
                            header={pageTitleProps.header}
                            headerLink={pageTitleProps.headerLink}
                        />
                    ) : null}
                </Stack>

                <Stack direction="row" sx={{ alignItems: 'center' }}>
                    <HelpMenu iconSx={iconSx} />
                    <UserMenu iconSx={iconSx} />
                </Stack>
            </Toolbar>
        </MuiAppBar>
    );
};

export default Topbar;
