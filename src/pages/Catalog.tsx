import React, { useCallback } from 'react';
import {
    Toolbar,
    Button,
    ToggleButtonGroup,
    ToggleButton,
    Box,
    Typography,
    TextField,
    Stack,
} from '@mui/material';

import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import InputAdornment from '@mui/material/InputAdornment';
import PageContainer from 'components/shared/PageContainer';

export default function Catalog() {
    const [searchScope, setSearchScope] = React.useState<string | null>('all');

    const handleAlignment = useCallback(() => {
        setSearchScope(searchScope);
    }, [searchScope]);

    return (
        <PageContainer>
            <Toolbar
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}
            >
                <Button
                    variant="contained"
                    color="success"
                    startIcon={<AddIcon />}
                    onClick={() =>
                        alert("Hey - this is where we'll open a modal.")
                    }
                    sx={{
                        borderTopRightRadius: 12,
                        borderBottomRightRadius: 12,
                        borderBottomLeftRadius: 12,
                        height: 40,
                    }}
                >
                    New Capture
                </Button>
                <Stack
                    direction="row"
                    sx={{
                        alignItems: 'baseline',
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
                    <Typography gutterBottom variant="h5" component="div">
                        No Captures?
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Click the "New Capture" button up above to get started
                    </Typography>
                </Box>
            </Box>
        </PageContainer>
    );
}
