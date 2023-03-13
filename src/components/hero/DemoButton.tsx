import { Box, Grid, Link } from '@mui/material';
import { authenticatedRoutes } from 'app/routes';
import { semiTransparentBackgroundIntensified } from 'context/Theme';
import { useCallback } from 'react';
import { FormattedMessage } from 'react-intl';
import { useNavigate } from 'react-router-dom';
import { getPathWithParams } from 'utils/misc-utils';

const FILTER_TABLE_PROPS = {
    captures: {
        'cap-sq': 'demo/wikipedia/recent-changes',
    },
    collections: {
        'col-sq': 'demo/wikipedia/lines-and-bots',
    },
    materializations: {
        'mat-sq': 'demo/wikipedia/lines-by-usertype',
    },
};

interface Props {
    step: number;
    type: keyof typeof FILTER_TABLE_PROPS;
}

function DemoButton({ step, type }: Props) {
    const navigate = useNavigate();
    const goToFilteredTable = useCallback(() => {
        navigate(
            getPathWithParams(
                authenticatedRoutes[type].fullPath,
                FILTER_TABLE_PROPS[type]
            )
        );
    }, [navigate, type]);

    return (
        <Grid
            item
            xs={4}
            sx={{
                display: 'flex',
                justifyContent: 'center',
            }}
        >
            <Box
                sx={{
                    bgcolor: (theme) =>
                        semiTransparentBackgroundIntensified[
                            theme.palette.mode
                        ],
                    p: 2,
                    textAlign: 'center',
                    width: '75%',
                    mt: 2,
                }}
            >
                <Link onClick={goToFilteredTable} sx={{ cursor: 'pointer' }}>
                    <FormattedMessage id={`home.hero.${step}.button`} />
                </Link>
            </Box>
        </Grid>
    );
}

export default DemoButton;
