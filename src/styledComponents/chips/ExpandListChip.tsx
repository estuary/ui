import type { ExpandListChipProps } from 'src/styledComponents/types';

import { useIntl } from 'react-intl';

import { OutlinedChip } from 'src/styledComponents/chips/OutlinedChip';

export const ExpandListChip = ({
    component,
    hiddenCount,
    showEntireList,
}: ExpandListChipProps) => {
    const intl = useIntl();

    if (hiddenCount < 1) {
        return null;
    }

    return (
        <OutlinedChip
            component={component}
            label={intl.formatMessage(
                { id: 'entityTable.moreEntities' },
                {
                    count: hiddenCount,
                }
            )}
            onClick={showEntireList}
            size="small"
            title={intl.formatMessage({ id: 'cta.showAll' })}
            variant="outlined"
        />
    );
};
