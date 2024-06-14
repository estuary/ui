import { Box, Divider, Stack } from '@mui/material';
import { useIntl } from 'react-intl';
import { Entity } from 'types';
import { useScopedSystemGraph } from '../Store/Store';
import Statistic from './Statistic';

type StatisticType =
    | 'bytes_read'
    | 'bytes_written'
    | 'docs_read'
    | 'docs_written';

const byteStats: StatisticType[] = ['bytes_read', 'bytes_written'];
const docStats: StatisticType[] = ['docs_read', 'docs_written'];

const getStatistics = (entityType?: Entity): StatisticType[] => {
    let statTypes: StatisticType[];

    switch (entityType) {
        case 'capture':
            statTypes = [byteStats[1], docStats[1]];
            break;
        case 'materialization':
            statTypes = [byteStats[0], docStats[0]];
            break;
        default:
            statTypes = byteStats.concat(docStats);
    }

    return statTypes;
};

function UsageSection() {
    const intl = useIntl();

    const entityType = useScopedSystemGraph((state) => state.currentNode?.type);

    const statTypes = getStatistics(entityType);

    return (
        <Stack direction="row" spacing={1}>
            {statTypes.map((statType, index) => {
                const stat = Math.floor(Math.random() * 98 + 1);
                const unit = byteStats.includes(statType) ? 'GB' : 'K';

                return (
                    <Box
                        key={`${statType}-${index}`}
                        style={{ display: 'inline-flex' }}
                    >
                        <Statistic
                            label={intl.formatMessage({
                                id: `entityTable.stats.${statType}`,
                            })}
                            value={`${stat} ${unit}`}
                        />

                        {index !== statTypes.length - 1 ? (
                            <Divider
                                flexItem
                                orientation="vertical"
                                style={{ marginLeft: 8 }}
                            />
                        ) : null}
                    </Box>
                );
            })}
        </Stack>
    );
}

export default UsageSection;
