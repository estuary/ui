import { Box, Divider, Stack, Typography } from '@mui/material';
import EditButton from 'components/shared/Entity/Details/EditButton';
import MaterializeButton from 'components/shared/Entity/Details/MaterializeButton';
import RenderTab from 'components/shared/Entity/Details/RenderTab';
import DetailTabs from 'components/shared/Entity/Details/Tabs';
import { truncateTextSx } from 'context/Theme';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'hooks/searchParams/useGlobalSearchParams';

function DetailContent() {
    const catalogName = useGlobalSearchParams(GlobalSearchParams.CATALOG_NAME);

    return (
        <Box>
            <Stack spacing={2} sx={{ m: 1 }}>
                <Stack
                    direction="row"
                    sx={{
                        justifyContent: 'space-between',
                    }}
                >
                    <Typography
                        component="span"
                        variant="h6"
                        sx={{
                            ...truncateTextSx,
                            alignItems: 'center',
                        }}
                    >
                        {catalogName}
                    </Typography>

                    <Stack direction="row">
                        <MaterializeButton />

                        <EditButton />
                    </Stack>
                </Stack>

                <Divider />

                <DetailTabs />
            </Stack>

            <Box sx={{ m: 1 }}>
                <RenderTab />
            </Box>
        </Box>
    );
}

export default DetailContent;
