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
import PageContainer from 'components/shared/PageContainer';
import { useEffect, useState } from 'react';
import { Link, Outlet } from 'react-router-dom';

export default function Catalog() {
    const [captureList, setCaptureList] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetch('http://localhost:3001/captures/all')
            .then((res) => res.json())
            .then(
                (result) => {
                    setCaptureList(result);
                    setIsLoading(false);
                },
                (error) => {
                    console.warn(
                        'There was an issue fetching the Captures',
                        error.stack
                    );
                    setCaptureList([]);
                    setIsLoading(false);
                }
            );
    }, [isLoading]);

    function CatalogList(props: any) {
        const { captures } = props;

        if (isLoading) {
            return <Box>Loading</Box>;
        } else if (captures.length > 0) {
            return (
                <Box>
                    <List>
                        {captures.map((element: any) => (
                            <ListItem>
                                <ListItemIcon>
                                    <InputIcon />
                                </ListItemIcon>
                                <ListItemText primary={element.name} />
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
                            No Captures?
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Click the "New Capture" button up above to get
                            started
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
                <Link to={'new'}>
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
                </Link>
            </Toolbar>
            <CatalogList captures={captureList} />
            <Outlet />
        </PageContainer>
    );
}
