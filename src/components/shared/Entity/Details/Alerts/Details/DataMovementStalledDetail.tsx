import type { FooDetailsProps } from 'src/components/shared/Entity/Details/Alerts/types';

import { Paper } from '@mui/material';

import KeyValueList from 'src/components/shared/KeyValueList';

function DataMovementStalledDetail({ datum, details }: FooDetailsProps) {
    return (
        <KeyValueList
            data={[
                {
                    title: details[0].label,
                    val: (
                        <Paper
                            variant="outlined"
                            sx={{
                                pt: 0,
                                pb: 1,
                                minHeight: 100,
                                maxHeight: 100,
                                fontFamily: `'Monaco', monospace`,
                            }}
                        >
                            {details[0].dataVal}
                        </Paper>
                    ),
                },
            ]}
        />
    );
}

export default DataMovementStalledDetail;
