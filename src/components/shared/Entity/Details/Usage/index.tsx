import { Stack } from '@mui/material';

import DetailsRange from 'src/components/filters/DetailsRange';
import StatTypeSelector from 'src/components/graphs/DataByHourGraph/StatTypeSelector';
import CardWrapper from 'src/components/shared/CardWrapper';
import DelayWarning from 'src/components/shared/Entity/Details/Usage/DelayWarning';
import { UsageChart } from 'src/components/shared/Entity/Details/Usage/UsageChart';
import { useEntityType } from 'src/context/EntityContext';
import { useDetailsStats } from 'src/hooks/catalogStats/useDetailsStats';

interface Props {
    catalogName: string;
    createdAt?: string;
}

function Usage({ catalogName }: Props) {
    const entityType = useEntityType();
    const { data, error, fetching, updatedAt } = useDetailsStats(
        entityType,
        catalogName
    );

    return (
        <CardWrapper
            message={
                <Stack
                    direction="row"
                    spacing={1}
                    sx={{ justifyContent: 'space-between', width: '100%' }}
                >
                    <DetailsRange />
                    <StatTypeSelector />
                </Stack>
            }
        >
            <UsageChart
                data={data}
                error={error}
                fetching={fetching}
                updatedAt={updatedAt}
            />
            <DelayWarning />
        </CardWrapper>
    );
}

export default Usage;
