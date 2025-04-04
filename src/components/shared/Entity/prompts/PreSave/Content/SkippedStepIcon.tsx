import { useTheme } from '@mui/material';

import { MinusCircle } from 'iconoir-react';

import { pixelSize } from 'src/components/shared/Entity/prompts/PreSave/Content/shared';

// TODO (progress icons)
// We have a few ways of doing this. We should get these all aligned.
function SkippedStepIcon() {
    const theme = useTheme();

    return (
        <MinusCircle
            style={{
                color: theme.palette.grey[500],
                width: pixelSize,
                height: pixelSize,
            }}
        />
    );
}

export default SkippedStepIcon;
