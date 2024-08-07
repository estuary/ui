import { Grid } from '@mui/material';
import { DefaultStatsWithDocument, getStatsForDashboard } from 'api/stats';
import {
    semiTransparentBackground_blue,
    semiTransparentBackground_purple,
    semiTransparentBackground_teal,
} from 'context/Theme';
import { CloudDownload, CloudUpload, DatabaseScript } from 'iconoir-react';
import { DateTime } from 'luxon';
import { useEffect, useState } from 'react';
import { CatalogStats_Dashboard } from 'types';
import EntityStatOverview from './EntityStatOverview';

const ICON_SIZE = 12;

const isDefaultStatistic = (
    datum: CatalogStats_Dashboard | DefaultStatsWithDocument
): datum is DefaultStatsWithDocument => 'bytes_read_by_me' in datum;

export default function Dashboard() {
    const [captureUsage, setCaptureUsage] = useState(0);
    const [materializationUsage, setMaterializationUsage] = useState(0);

    useEffect(() => {
        const endDate = DateTime.utc().startOf('month');

        getStatsForDashboard('melk', 'monthly', endDate).then(
            (response) => {
                if (response.data) {
                    let dataWritten = 0;
                    let dataRead = 0;

                    response.data
                        .filter(
                            ({ flow_document }) =>
                                Object.hasOwn(flow_document, 'taskStats') &&
                                (Object.hasOwn(
                                    flow_document.taskStats,
                                    'capture'
                                ) ||
                                    Object.hasOwn(
                                        flow_document.taskStats,
                                        'materialize'
                                    ))
                        )
                        .forEach((datum) => {
                            if (isDefaultStatistic(datum)) {
                                dataWritten += datum.bytes_written_by_me;
                                dataRead += datum.bytes_read_by_me;

                                return;
                            }

                            dataWritten += datum.bytes_written ?? 0;
                            dataRead += datum.bytes_read ?? 0;
                        });

                    setCaptureUsage(dataWritten);
                    setMaterializationUsage(dataRead);
                }
            },
            (error) => {
                console.log('error', error);
            }
        );
    }, [setCaptureUsage, setMaterializationUsage]);

    return (
        <Grid container spacing={{ xs: 4 }}>
            <Grid item xs={4}>
                <EntityStatOverview
                    Icon={<DatabaseScript fontSize={ICON_SIZE} />}
                    background={semiTransparentBackground_blue}
                    entityType="collection"
                />
            </Grid>

            <Grid item xs={4}>
                <EntityStatOverview
                    Icon={<CloudUpload fontSize={ICON_SIZE} />}
                    background={semiTransparentBackground_teal}
                    entityType="capture"
                    monthlyUsage={captureUsage}
                />
            </Grid>

            <Grid item xs={4}>
                <EntityStatOverview
                    Icon={<CloudDownload fontSize={ICON_SIZE} />}
                    background={semiTransparentBackground_purple}
                    entityType="materialization"
                    monthlyUsage={materializationUsage}
                />
            </Grid>
        </Grid>
    );
}
