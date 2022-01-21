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
import { FormattedMessage, useIntl } from 'react-intl';
import { NavLink, Outlet } from 'react-router-dom';

const Catalog: React.FC = () => {
    const intl = useIntl();

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
            return (
                <Box>
                    <FormattedMessage id="common.loading" />
                </Box>
            );
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
                            <FormattedMessage id="captures.main.message1" />
                        </Typography>
                        <Typography variant="h6" color="text.secondary">
                            <FormattedMessage
                                id="captures.main.message2"
                                values={{
                                    docLink: (
                                        <ExternalLink
                                            link={intl.formatMessage({
                                                id: 'captures.main.message2.docPath',
                                            })}
                                        >
                                            <FormattedMessage id="captures.main.message2.docLink" />
                                        </ExternalLink>
                                    ),
                                }}
                            />
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
