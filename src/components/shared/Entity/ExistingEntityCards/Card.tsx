import Editor from '@monaco-editor/react';
import { Box, Collapse, Paper, Typography, useTheme } from '@mui/material';
import {
    CaptureQueryWithSpec,
    MaterializationQueryWithSpec,
} from 'api/liveSpecsExt';
import { authenticatedRoutes } from 'app/routes';
import ConnectorLogo from 'components/connectors/card/Logo';
import OptionsMenu from 'components/shared/Entity/ExistingEntityCards/OptionsMenu';
import {
    alternateConnectorImageBackgroundSx,
    monacoEditorComponentBackground,
    semiTransparentBackground,
    semiTransparentBackgroundIntensified,
} from 'context/Theme';
import { GlobalSearchParams } from 'hooks/searchParams/useGlobalSearchParams';
import { isEmpty } from 'lodash';
import { useState } from 'react';
import { FormattedDate } from 'react-intl';
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

    const [selection, setSelection] = useState<
        CaptureQueryWithSpec | MaterializationQueryWithSpec | null
    >(null);
    const [detailsExpanded, setDetailsExpanded] = useState<boolean>(false);

    const handlers = {
        editTask: () => {
            if (!isEmpty(selection)) {
                navigate(
                    getPathWithParams(
                        authenticatedRoutes.captures.edit.fullPath,
                        {
                            [GlobalSearchParams.CONNECTOR_ID]:
                                selection.connector_id,
                            [GlobalSearchParams.LIVE_SPEC_ID]: selection.id,
                            [GlobalSearchParams.LAST_PUB_ID]:
                                selection.last_pub_id,
                        }
                    )
                );
            }
            setSelection(null);
        },
        toggleDetailsPanel: () => setDetailsExpanded(!detailsExpanded),
    };

    return queryData ? (
        <>
            <Paper
                sx={{
                    'borderRadius': 5,
                    'background': semiTransparentBackground[theme.palette.mode],
                    'padding': 1,
                    '&:hover': {
                        background:
                            semiTransparentBackgroundIntensified[
                                theme.palette.mode
                            ],
                    },
                }}
            >
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
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
                                maxHeight={50}
                            />
                        </Box>

                        <Box sx={{ ml: 2 }}>
                            <Typography
                                variant="h6"
                                sx={{ width: 'max-content' }}
                            >
                                {queryData.catalog_name}
                            </Typography>

                            <FormattedDate
                                day="numeric"
                                month="long"
                                year="numeric"
                                value={queryData.updated_at}
                            />
                        </Box>
                    </Box>

                    <OptionsMenu
                        detailsExpanded={detailsExpanded}
                        toggleDetailsPanel={handlers.toggleDetailsPanel}
                        editTask={handlers.editTask}
                    />
                </Box>
            </Paper>

            <Collapse in={detailsExpanded}>
                <Paper
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
