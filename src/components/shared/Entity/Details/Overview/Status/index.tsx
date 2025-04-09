import type { StatusProps } from 'src/components/shared/Entity/Details/Overview/types';

import { Grid, Stack, Typography } from '@mui/material';

import SectionUpdated from '../../Status/Overview/SectionUpdated';
import RefreshButton from '../../Status/RefreshButton';
import { useIntl } from 'react-intl';

import CardWrapper from 'src/components/shared/CardWrapper';
import { ConnectorStatusSection } from 'src/components/shared/Entity/Details/Overview/ConnectorStatusSection';
import useDetailsEntityTaskTypes from 'src/components/shared/Entity/Details/useDetailsEntityTaskTypes';
import ShardInformation from 'src/components/shared/Entity/Shard/Information';
import { useEntityType } from 'src/context/EntityContext';
import { cardHeaderSx } from 'src/context/Theme';
import { hasLength } from 'src/utils/misc-utils';

export const Status = ({ catalogName }: StatusProps) => {
    const intl = useIntl();

    const entityType = useEntityType();
    const taskTypes = useDetailsEntityTaskTypes();

    return (
        <Grid item xs={12}>
            <CardWrapper
                message={
                    <Stack
                        direction="row"
                        spacing={1}
                        style={{ alignItems: 'center', marginBottom: 2 }}
                    >
                        <Typography
                            component="div"
                            sx={{ ...cardHeaderSx, mr: 3 }}
                        >
                            {intl.formatMessage({
                                id: 'details.ops.status.header',
                            })}
                        </Typography>

                        <RefreshButton />
                    </Stack>
                }
            >
                <Stack direction="row" spacing={5} style={{ marginBottom: 16 }}>
                    {hasLength(taskTypes) ? (
                        <ShardInformation
                            taskTypes={taskTypes}
                            taskName={catalogName}
                        />
                    ) : null}

                    {entityType === 'collection' ? null : (
                        <ConnectorStatusSection />
                    )}
                </Stack>

                <SectionUpdated />
            </CardWrapper>
        </Grid>
    );
};
