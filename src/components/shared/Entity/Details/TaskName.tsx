import { Stack, Typography } from '@mui/material';

import EditButton from 'src/components/shared/Entity/Details/EditButton';
import MaterializeButton from 'src/components/shared/Entity/Details/MaterializeButton';
import { truncateTextSx } from 'src/context/Theme';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'src/hooks/searchParams/useGlobalSearchParams';

function TaskName() {
    const catalogName = useGlobalSearchParams(GlobalSearchParams.CATALOG_NAME);

    return (
        <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
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
                <EditButton buttonVariant="outlined" />

                <MaterializeButton />
            </Stack>
        </Stack>
    );
}

export default TaskName;
