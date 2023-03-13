import { Divider, Stack, Toolbar } from '@mui/material';
import MuiAppBar from '@mui/material/AppBar';
import { useTheme } from '@mui/material/styles';
import CompanyLogo from 'components/graphics/CompanyLogo';
import HelpMenu from 'components/menus/HelpMenu';
import UserMenu from 'components/menus/UserMenu';
import PageTitle, { PageTitleProps } from 'components/navigation/PageTitle';
import SidePanelDocsOpenButton from 'components/sidePanelDocs/OpenButton';
import { zIndexIncrement } from 'context/Theme';

interface Props {
    pageTitleProps?: PageTitleProps;
}

const Topbar = ({ pageTitleProps }: Props) => {
    const theme = useTheme();

    return (
        <MuiAppBar
            sx={{
                position: 'fixed',
                zIndex: theme.zIndex.drawer + zIndexIncrement,
                boxShadow:
                    'rgb(50 50 93 / 2%) 0px 2px 5px -1px, rgb(0 0 0 / 5%) 0px 1px 3px -1px',
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
                    <HelpMenu />

                    <UserMenu iconColor={theme.palette.text.primary} />

                    <SidePanelDocsOpenButton />
                </Stack>
            </Toolbar>
        </MuiAppBar>
    );
};

export default Topbar;
