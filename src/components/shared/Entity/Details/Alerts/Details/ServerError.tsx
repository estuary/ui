import type { AlertDetailsProps } from 'src/components/shared/Entity/Details/Alerts/types';

import { Paper, useTheme } from '@mui/material';

import ServerErrorDetail from 'src/components/shared/Alerts/ServerErrorDetails';
import ServerErrorDialog from 'src/components/shared/Entity/Details/Alerts/Details/ServerErrorDialog';
import { defaultOutline, zIndexIncrement } from 'src/context/Theme';

const maxLengthDetail = 350;

function ServerError(props: AlertDetailsProps) {
    const { details } = props;
    const { dataVal } = details[0];
    const theme = useTheme();

    // Just being safe on the rare case we do not get the data we're expecting
    if (!dataVal) {
        return null;
    }

    const dataValIsLong = dataVal.length > maxLengthDetail;
    const shortDataVal = dataValIsLong
        ? `${dataVal.substring(0, maxLengthDetail)}...`
        : dataVal;

    return (
        <Paper
            sx={{
                border: defaultOutline[theme.palette.mode],
                height: 150,
                maxHeight: 150,
                [`&:hover > button,  &:focus > button`]: {
                    opacity: 0.5,
                    transition: `750ms`,
                },
                [`& > button`]: {
                    [`&:hover, &:focus`]: {
                        opacity: 1,
                        transition: `750ms`,
                    },
                    bottom: 10,
                    height: 25,
                    minWidth: 'fit-content',
                    opacity: 0,
                    transition: `750ms`,
                    p: 0.25,
                    position: 'absolute',
                    right: 0,
                    width: 25,
                    zIndex: zIndexIncrement + zIndexIncrement,
                },
                [`& > section`]: {
                    width: '100%',
                    position: 'absolute',
                    zIndex: zIndexIncrement,
                },
            }}
        >
            <ServerErrorDetail
                options={{
                    renderLineHighlight: 'none',
                }}
                val={shortDataVal}
            />
            {dataValIsLong ? <ServerErrorDialog {...props} /> : null}
        </Paper>
    );
}

export default ServerError;
