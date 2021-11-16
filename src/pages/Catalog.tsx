import AddIcon from '@mui/icons-material/Add';
import InputIcon from '@mui/icons-material/Input';
import SearchIcon from '@mui/icons-material/Search';
import {
    Box,
    Button,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Stack,
    TextField,
    ToggleButton,
    ToggleButtonGroup,
    Toolbar,
    Typography,
} from '@mui/material';
import InputAdornment from '@mui/material/InputAdornment';
import PageContainer from 'components/shared/PageContainer';
import { useCallback, useEffect, useState } from 'react';
import { Link, Outlet } from 'react-router-dom';

export default function Catalog() {
    const [searchScope, setSearchScope] = useState<string | null>('all');
    const [captureList, setCaptureList] = useState([]);

    const handleAlignment = useCallback(() => {
        setSearchScope(searchScope);
    }, [searchScope]);

    useEffect(() => {
        fetch('http://localhost:3001/captures/all')
            .then((res) => res.json())
            .then(
                (result) => {
                    setCaptureList(result);
                },
                (error) => {
                    console.warn(
                        'There was an issue fetching the Captures',
                        error.stack
                    );
                    setCaptureList([]);
                }
            );
    }, []);

    function CatalogList(props: any) {
        const { captures } = props;

        if (captures.length > 0) {
            return (
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
            );
        } else {
            return (
                <>
                    <Typography gutterBottom variant="h5" component="div">
                        No Captures?
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Click the "New Capture" button up above to get started
                    </Typography>
                </>
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
                <Stack
                    direction="row"
                    sx={{
                        alignItems: 'baseline',
                        display: 'none',
                    }}
                >
                    <TextField
                        id="catalog-capture-name-filter"
                        label="Find captures by name"
                        variant="standard"
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <SearchIcon />
                                </InputAdornment>
                            ),
                        }}
                    />
                    <Box
                        sx={{
                            marginLeft: 1.5,
                            height: 45,
                        }}
                    >
                        <ToggleButtonGroup
                            aria-label="state of capture"
                            exclusive
                            size="small"
                            value={searchScope}
                            onChange={handleAlignment}
                        >
                            <ToggleButton
                                aria-label="see all captures"
                                value="all"
                            >
                                All
                            </ToggleButton>
                            <ToggleButton
                                aria-label="see active captures"
                                value="active"
                            >
                                Active
                            </ToggleButton>
                            <ToggleButton
                                aria-label="see paused captures"
                                value="paused"
                            >
                                Paused
                            </ToggleButton>
                        </ToggleButtonGroup>
                    </Box>
                </Stack>
            </Toolbar>
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
                    <CatalogList captures={captureList} />
                </Box>
            </Box>
            <Outlet />
        </PageContainer>
    );
}
