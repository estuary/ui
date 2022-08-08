import { Box, Button, Grid, Paper, Stack, Typography } from '@mui/material';
import { authenticatedRoutes } from 'app/Authenticated';
import { slate } from 'context/Theme';
import { useQuery, useSelect } from 'hooks/supabase-swr';
import {
    ConnectorWithTagDetailQuery,
    CONNECTOR_WITH_TAG_QUERY,
} from 'hooks/useConnectorWithTagDetail';
import { FormattedDate, FormattedMessage } from 'react-intl';
import { useNavigate } from 'react-router-dom';
import { CONNECTOR_NAME, TABLES } from 'services/supabase';
import { getPathWithParam, hasLength } from 'utils/misc-utils';

const WIDTH = 250;

function GridWrapper() {
    const navigate = useNavigate();

    const liveSpecQuery = useQuery<ConnectorWithTagDetailQuery>(
        TABLES.CONNECTORS,
        {
            columns: CONNECTOR_WITH_TAG_QUERY,
            filter: (query) => query.order(CONNECTOR_NAME, { ascending: true }),
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
        <Grid
            container
            spacing={2}
            paddingRight={2}
            width={WIDTH * 5 + 16 * 6}
            margin="auto"
        >
            {hasLength(selectData)
                ? selectData.map((row, index) => (
                      <Grid key={index} item>
                          <Paper
                              elevation={0}
                              sx={{
                                  width: WIDTH,
                                  height: '100%',
                                  borderRadius: 5,
                                  background: (theme) =>
                                      theme.palette.mode === 'dark'
                                          ? 'linear-gradient(160deg, rgba(172, 199, 220, 0.18) 2%, rgba(172, 199, 220, 0.12) 40%)'
                                          : slate[50],
                                  padding: 1,
                              }}
                          >
                              <Stack
                                  style={{
                                      height: '100%',
                                      justifyContent: 'space-between',
                                  }}
                              >
                                  <Box
                                      sx={{
                                          width: '100%',
                                          height: 150,
                                          display: 'flex',
                                          justifyContent: 'center',
                                          alignItems: 'center',
                                          marginBottom: 2,
                                          borderRadius: 5,
                                          background: (theme) =>
                                              theme.palette.mode === 'dark'
                                                  ? 'linear-gradient(160deg, rgba(172, 199, 220, 0.18) 2%, rgba(172, 199, 220, 0.12) 40%)'
                                                  : slate[25],
                                      }}
                                  >
                                      <img
                                          src={row.image}
                                          loading="lazy"
                                          alt=""
                                          style={{
                                              width: 'auto',
                                              maxHeight: 100,
                                              padding: '0 1rem',
                                          }}
                                      />
                                  </Box>

                                  <Typography align="center" marginBottom={1}>
                                      {row.title}
                                  </Typography>

                                  <Typography
                                      variant="caption"
                                      align="center"
                                      marginBottom={2}
                                  >
                                      {row.image_name}
                                  </Typography>

                                  <Typography
                                      component="div"
                                      variant="caption"
                                      align="center"
                                      marginBottom={5}
                                  >
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
