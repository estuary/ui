import AddIcon from '@mui/icons-material/Add';
import InputIcon from '@mui/icons-material/Input';
import {
    Box,
    Button,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Toolbar,
    Typography,
} from '@mui/material';
import ExternalLink from 'components/shared/ExternalLink';
import PageContainer from 'components/shared/PageContainer';
import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';

const Catalog: React.FC = () => {
    const [captureList] = useState([]);
    const [isLoading] = useState(false);

    // const { pathname } = useLocation();
    // useEffect(() => {
    //     if (pathname === '/app/captures') {
    //         fetch('http://localhost:3001/captures/all')
    //             .then((res) => res.json())
    //             .then(
    //                 (result) => {
    //                     setCaptureList(result);
    //                     setIsLoading(false);
    //                 },
    //                 (error) => {
    //                     console.warn(
    //                         'There was an issue fetching the Captures',
    //                         error.stack
    //                     );
    //                     setCaptureList([]);
    //                     setIsLoading(false);
    //                 }
    //             );
    //     }
    // }, [pathname]);

    function CatalogList(props: any) {
        const { captures } = props;

        if (isLoading) {
            return <Box>Loading</Box>;
        } else if (captures.length > 0) {
            return (
                <Box>
                    <List>
                        {captures.map((element: any) => (
                            <ListItem key={element.path}>
                                <ListItemIcon>
                                    <InputIcon />
                                </ListItemIcon>
                                <ListItemText primary={`${element.path}`} />
                            </ListItem>
                        ))}
                    </List>
                </Box>
            );
        } else {
            return (
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: 250,
                    }}
                >
                    <Box
                        sx={{
                            padding: 2,
                            height: 150,
                            width: '90%',
                            textAlign: 'center',
                        }}
                    >
                        <Typography gutterBottom variant="h5" component="div">
                            Click the "New Capture" button up above to get
                            started.
                        </Typography>
                        <Typography variant="h6" color="text.secondary">
                            It will guide you through generating and downloading
                            a valid{' '}
                            <ExternalLink link="https://docs.estuary.dev/concepts/#catalogs">
                                catalog spec
                            </ExternalLink>
                            .
                        </Typography>
                    </Box>
                </Box>
            );
        }
    }

    return (
        <PageContainer>
            <Toolbar
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}
            >
                <NavLink to={'new'}>
                    <Button
                        variant="contained"
                        color="success"
                        startIcon={<AddIcon />}
                        sx={{
                            borderTopRightRadius: 12,
                            borderBottomRightRadius: 12,
                            borderBottomLeftRadius: 12,
                            height: 40,
                        }}
                    >
                        New Capture
                    </Button>
                </NavLink>
            </Toolbar>
            <CatalogList captures={captureList} />
            <Outlet />
        </PageContainer>
    );
};

export default Catalog;
