import { Button, Grid, Paper, Stack, Typography } from '@mui/material';
import { authenticatedRoutes } from 'app/Authenticated';
import ConnectorName from 'components/ConnectorName';
import { useQuery, useSelect } from 'hooks/supabase-swr';
import {
    ConnectorWithTagDetailQuery,
    CONNECTOR_WITH_TAG_QUERY,
} from 'hooks/useConnectorWithTagDetail';
import { CSSProperties } from 'react';
import { FormattedDate, FormattedMessage } from 'react-intl';
import { useNavigate } from 'react-router-dom';
import { TABLES } from 'services/supabase';
import { getPathWithParam, hasLength } from 'utils/misc-utils';

const paperStyle: CSSProperties = {
    width: 300,
    height: '100%',
    padding: 8,
    borderRadius: 10,
};

function GridWrapper() {
    const navigate = useNavigate();

    const liveSpecQuery = useQuery<ConnectorWithTagDetailQuery>(
        TABLES.CONNECTORS,
        {
            columns: CONNECTOR_WITH_TAG_QUERY,
        },
        []
    );

    const {
        data: useSelectResponse,
        // isValidating,
        // mutate: mutateSelectData,
    } = useSelect(liveSpecQuery);
    const selectData = useSelectResponse ? useSelectResponse.data : [];

    return (
        <Grid container spacing={2}>
            {hasLength(selectData)
                ? selectData.map((row, index) => (
                      <Grid key={index} item>
                          <Paper elevation={0} style={paperStyle}>
                              <Stack
                                  spacing={2}
                                  style={{
                                      height: '100%',
                                      justifyContent: 'space-between',
                                  }}
                              >
                                  <ConnectorName
                                      iconSize={40}
                                      connector={row.title}
                                      iconPath={row.image}
                                  />

                                  <Typography
                                      variant="caption"
                                      style={{ paddingLeft: 40 }}
                                  >
                                      {row.image_name}
                                  </Typography>

                                  <Typography component="div" variant="caption">
                                      <span style={{ fontWeight: 'bold' }}>
                                          Last Updated:{' '}
                                      </span>

                                      <FormattedDate
                                          day="numeric"
                                          month="long"
                                          year="numeric"
                                          value={row.updated_at}
                                      />
                                  </Typography>

                                  <Button
                                      size="small"
                                      color={
                                          row.connector_tags[0].protocol ===
                                          'capture'
                                              ? 'primary'
                                              : 'secondary'
                                      }
                                      onClick={() => {
                                          if (
                                              row.connector_tags[0].protocol ===
                                              'capture'
                                          ) {
                                              navigate(
                                                  getPathWithParam(
                                                      authenticatedRoutes
                                                          .captures.create
                                                          .fullPath,
                                                      authenticatedRoutes
                                                          .captures.create
                                                          .params.connectorID,
                                                      row.connector_tags[0].id
                                                  )
                                              );
                                          } else if (
                                              row.connector_tags[0].protocol ===
                                              'materialization'
                                          ) {
                                              navigate(
                                                  getPathWithParam(
                                                      authenticatedRoutes
                                                          .materializations
                                                          .create.fullPath,
                                                      authenticatedRoutes
                                                          .materializations
                                                          .create.params
                                                          .connectorId,
                                                      row.connector_tags[0].id
                                                  )
                                              );
                                          }
                                      }}
                                  >
                                      {row.connector_tags[0].protocol ===
                                      'capture' ? (
                                          <FormattedMessage id="connectorTable.actionsCta.capture" />
                                      ) : (
                                          <FormattedMessage id="connectorTable.actionsCta.materialization" />
                                      )}
                                  </Button>
                              </Stack>
                          </Paper>
                      </Grid>
                  ))
                : null}
        </Grid>
    );
}

export default GridWrapper;
