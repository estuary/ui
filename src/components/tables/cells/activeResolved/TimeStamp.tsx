import { Stack, Typography } from '@mui/material';

function TimeStamp({ outputDate, outputTime }: any) {
    return (
        <Stack>
            <Typography component="span" noWrap variant="subtitle2">
                {outputDate}
            </Typography>
            <Typography component="span" noWrap>
                {outputTime}
            </Typography>
        </Stack>
    );
}

export default TimeStamp;
