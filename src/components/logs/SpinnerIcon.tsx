import { AlertColor, CircularProgress } from '@mui/material';
import { lineNumberColor } from './Line';

interface Props {
    stopped: boolean;
    severity?: AlertColor;
}

function SpinnerIcon({ severity, stopped }: Props) {
    return (
        <CircularProgress
            variant={severity || stopped ? 'determinate' : undefined}
            value={severity || stopped ? 100 : undefined}
            size={18}
            color={severity}
            sx={{
                alignSelf: 'end',
                color: !severity ? lineNumberColor : undefined,
            }}
        />
    );
}

export default SpinnerIcon;
