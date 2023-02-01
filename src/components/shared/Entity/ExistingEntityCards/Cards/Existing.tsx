import Editor from '@monaco-editor/react';
import {
    Box,
    ButtonBase,
    Collapse,
    Paper,
    Typography,
    useTheme,
} from '@mui/material';
import {
    CaptureQueryWithSpec,
    MaterializationQueryWithSpec,
} from 'api/liveSpecsExt';
import { authenticatedRoutes } from 'app/routes';
import ConnectorLogo from 'components/connectors/card/Logo';
import CustomWidthTooltip from 'components/shared/CustomWidthTooltip';
import {
    alternateConnectorImageBackgroundSx,
    monacoEditorComponentBackground,
    semiTransparentBackground,
    semiTransparentBackgroundIntensified,
} from 'context/Theme';
import { GlobalSearchParams } from 'hooks/searchParams/useGlobalSearchParams';
import { isEmpty } from 'lodash';
import LogRocket from 'logrocket';
import { useState } from 'react';
import { useIntl } from 'react-intl';
import { useNavigate } from 'react-router';
import { CustomEvents } from 'services/logrocket';
import { stringifyJSON } from 'services/stringify';
import { getPathWithParams } from 'utils/misc-utils';

interface Props {
    queryData: CaptureQueryWithSpec | MaterializationQueryWithSpec | null;
}

const EDITOR_HEIGHT = 396;

const trackEvent = (
    logEvent: CustomEvents,
    data: CaptureQueryWithSpec | MaterializationQueryWithSpec
) => {
    LogRocket.track(logEvent, {
        id: data.id,
        connector_tag_id: data.connector_id,
    });
};

function ExistingEntityCard({ queryData }: Props) {
    const navigate = useNavigate();

    const theme = useTheme();
    const intl = useIntl();

    const [detailsExpanded, setDetailsExpanded] = useState<boolean>(false);

    const handlers = {
        editTask: () => {
            if (!isEmpty(queryData)) {
                const logEvent =
                    queryData.spec_type === 'capture'
                        ? CustomEvents.CAPTURE_CREATE_CONFIG_EDIT
                        : CustomEvents.MATERIALIZATION_CREATE_CONFIG_EDIT;

                trackEvent(logEvent, queryData);

                const baseURL =
                    queryData.spec_type === 'capture'
                        ? authenticatedRoutes.captures.edit.fullPath
                        : authenticatedRoutes.materializations.edit.fullPath;

                navigate(
                    getPathWithParams(baseURL, {
                        [GlobalSearchParams.CONNECTOR_ID]:
                            queryData.connector_id,
                        [GlobalSearchParams.LIVE_SPEC_ID]: queryData.id,
                        [GlobalSearchParams.LAST_PUB_ID]: queryData.last_pub_id,
                    })
                );
            }
        },
        toggleDetailsPanel: () => setDetailsExpanded(!detailsExpanded),
    };

    return queryData ? (
        <>
            <ButtonBase
                onClick={handlers.editTask}
                sx={{
                    'width': '100%',
                    'padding': 1,
                    'justifyContent': 'flex-start',
                    'background': detailsExpanded
                        ? semiTransparentBackgroundIntensified[
                              theme.palette.mode
                          ]
                        : semiTransparentBackground[theme.palette.mode],
                    '&:hover': {
                        background:
                            semiTransparentBackgroundIntensified[
                                theme.palette.mode
                            ],
                    },
                    'borderRadius': 5,
                }}
            >
                <Box sx={alternateConnectorImageBackgroundSx}>
                    <ConnectorLogo
                        imageSrc={queryData.image}
                        maxHeight={35}
                        padding="0 0.5rem"
                    />
                </Box>

                <Box
                    sx={{
                        minWidth: 0,
                        ml: 2,
                        textAlign: 'left',
                    }}
                >
                    <CustomWidthTooltip
                        title={queryData.catalog_name}
                        placement="bottom-start"
                    >
                        <Typography noWrap sx={{ mb: 0.5 }}>
                            {queryData.catalog_name}
                        </Typography>
                    </CustomWidthTooltip>

                    <Typography variant="caption">
                        {intl.formatMessage(
                            {
                                id: 'existingEntityCheck.existingCard.label.lastPublished',
                            },
                            {
                                date: intl.formatDate(queryData.updated_at, {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric',
                                }),
                            }
                        )}
                    </Typography>
                </Box>
            </ButtonBase>

            <Collapse in={detailsExpanded}>
                <Paper
                    elevation={0}
                    sx={{
                        p: 2,
                        mx: 1,
                        background:
                            semiTransparentBackground[theme.palette.mode],
                    }}
                >
                    <Editor
                        height={EDITOR_HEIGHT}
                        value={stringifyJSON(queryData.spec.endpoint)}
                        defaultLanguage="json"
                        theme={
                            monacoEditorComponentBackground[theme.palette.mode]
                        }
                        saveViewState={false}
                        path={queryData.catalog_name}
                        options={{ readOnly: true }}
                    />
                </Paper>
            </Collapse>
        </>
    ) : null;
}

export default ExistingEntityCard;
