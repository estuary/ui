import type { ExpandListChipProps } from 'src/styledComponents/types';

import { OutlinedChip } from 'src/styledComponents/chips/OutlinedChip';

export const ExpandListChip = ({
    component,
    hiddenCount,
    showEntireList,
}: ExpandListChipProps) => {
    if (hiddenCount < 1) {
        return null;
    }

    return (
        <OutlinedChip
            component={component}
            label={`${hiddenCount} more`}
            onClick={showEntireList}
            size="small"
            title="Show All"
            variant="outlined"
        />
    );
};
