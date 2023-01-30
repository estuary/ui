import Editor from '@monaco-editor/react';
import {
    Box,
    Button,
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
import {
    alternateConnectorImageBackgroundSx,
    monacoEditorComponentBackground,
    semiTransparentBackground,
    semiTransparentBackgroundIntensified,
} from 'context/Theme';
import { GlobalSearchParams } from 'hooks/searchParams/useGlobalSearchParams';
import { isEmpty } from 'lodash';
import { useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useNavigate } from 'react-router';
import { stringifyJSON } from 'services/stringify';
import { getPathWithParams } from 'utils/misc-utils';

interface Props {
    queryData: CaptureQueryWithSpec | MaterializationQueryWithSpec | null;
}

const EDITOR_HEIGHT = 396;

function ExistingEntityCard({ queryData }: Props) {
    const navigate = useNavigate();

    const theme = useTheme();
    const intl = useIntl();

    const [detailsExpanded, setDetailsExpanded] = useState<boolean>(false);

    const handlers = {
        editTask: () => {
            if (!isEmpty(queryData)) {
                navigate(
                    getPathWithParams(
                        authenticatedRoutes.captures.edit.fullPath,
                        {
                            [GlobalSearchParams.CONNECTOR_ID]:
                                queryData.connector_id,
                            [GlobalSearchParams.LIVE_SPEC_ID]: queryData.id,
                            [GlobalSearchParams.LAST_PUB_ID]:
                                queryData.last_pub_id,
                        }
                    )
                );
            }
        },
        toggleDetailsPanel: () => setDetailsExpanded(!detailsExpanded),
    };

    return queryData ? (
        <>
            <ButtonBase
                onClick={handlers.toggleDetailsPanel}
                sx={{
                    'width': '100%',
                    'padding': 1,
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
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        flexGrow: 1,
                    }}
                >
                    <Box sx={alternateConnectorImageBackgroundSx}>
                        <ConnectorLogo
                            imageSrc={queryData.image}
                            maxHeight={35}
                            padding="0 0.5rem"
                        />
                    </Box>

                    <Box sx={{ ml: 2, textAlign: 'left' }}>
                        <Typography sx={{ width: 'max-content', mb: 0.5 }}>
                            {queryData.catalog_name}
                        </Typography>

                        <Typography variant="caption">
                            {intl.formatMessage(
                                {
                                    id: 'existingEntityCheck.existingCard.label.lastPublished',
                                },
                                {
                                    date: intl.formatDate(
                                        queryData.updated_at,
                                        {
                                            day: 'numeric',
                                            month: 'long',
                                            year: 'numeric',
                                        }
                                    ),
                                }
                            )}
                        </Typography>
                    </Box>
                </Box>

                <Button onClick={handlers.editTask} sx={{ mr: 1 }}>
                    <FormattedMessage id="existingEntityCheck.existingCard.cta.edit" />
                </Button>
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
