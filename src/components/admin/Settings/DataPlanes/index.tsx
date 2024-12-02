import { Typography } from '@mui/material';
import DataPlanesTable from 'components/tables/DataPlanes';
import { useIntl } from 'react-intl';

function DataPlanes() {
    const intl = useIntl();

    return (
        <>
            <Typography
                component="div"
                variant="h6"
                sx={{ m: 2, alignItems: 'center' }}
            >
                {intl.formatMessage({ id: 'admin.dataPlanes.private.header' })}
            </Typography>

            <DataPlanesTable />
        </>
    );
}

export default DataPlanes;
