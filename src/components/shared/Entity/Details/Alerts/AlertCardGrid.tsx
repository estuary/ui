import type { AlertCardGridProps } from 'src/components/shared/Entity/Details/Alerts/types';

import { Grid } from '@mui/material';

import AlertCard from 'src/components/shared/Entity/Details/Alerts/AlertCard';

function AlertCardGrid({ edges }: AlertCardGridProps) {
    return (
        <>
            {edges.map((datum, index) => {
                return (
                    <Grid
                        item
                        xs={12}
                        lg={true}
                        key={`active_alerts_${datum.node.firedAt}_${index}`}
                        justifyContent="center"
                        alignItems="stretch"
                    >
                        <AlertCard datum={datum.node} />
                    </Grid>
                );
            })}
        </>
    );
}

export default AlertCardGrid;
