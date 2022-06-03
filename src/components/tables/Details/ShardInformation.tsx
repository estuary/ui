import Editor from '@monaco-editor/react';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Alert,
    Box,
    Grid,
    Typography,
    useTheme,
} from '@mui/material';
import { EditorStoreState } from 'components/editor/Store';
import { PublicationSpecQuery } from 'hooks/usePublicationSpecs';
import { useRouteStore } from 'hooks/useRouteStore';
import { useZustandStore } from 'hooks/useZustand';
import { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { ShardDetails, shardDetailSelectors } from 'stores/ShardDetail';
import { ENTITY } from 'types';

interface Props {
    entityType?: ENTITY.CAPTURE | ENTITY.MATERIALIZATION;
}

const NEW_LINE = '\r\n';

function ShardInformation({ entityType }: Props) {
    const theme = useTheme();

    const [shardDetails, setShardDetails] = useState<ShardDetails | null>(null);

    const shardDetailStore = useRouteStore();
    const getShardDetails = shardDetailStore(
        shardDetailSelectors.getShardDetails
    );

    const specs = useZustandStore<
        EditorStoreState<PublicationSpecQuery>,
        EditorStoreState<PublicationSpecQuery>['specs']
    >((state) => state.specs);

    useEffect(() => {
        if (specs && specs.length > 0) {
            setShardDetails(
                getShardDetails(
                    specs.find(({ spec_type }) => spec_type === entityType)
                        ?.catalog_name
                )
            );
        }
    }, [specs, getShardDetails, setShardDetails, entityType]);

    return (
        shardDetails && (
            <>
                {shardDetails.errors && (
                    <Grid item xs={12}>
                        <Alert
                            severity="error"
                            sx={{
                                '& .MuiAlert-message': {
                                    width: '100%',
                                },
                            }}
                        >
                            <Accordion>
                                <AccordionSummary
                                    expandIcon={<ExpandMoreIcon />}
                                >
                                    <Typography>
                                        <FormattedMessage id="detailsPanel.shardDetails.errorTitle" />
                                    </Typography>
                                </AccordionSummary>

                                <AccordionDetails>
                                    <Box sx={{ height: 250 }}>
                                        <Editor
                                            defaultLanguage=""
                                            theme={
                                                theme.palette.mode === 'light'
                                                    ? 'vs'
                                                    : 'vs-dark'
                                            }
                                            options={{
                                                lineNumbers: 'off',
                                                readOnly: true,
                                                scrollBeyondLastLine: false,
                                                minimap: {
                                                    enabled: false,
                                                },
                                            }}
                                            value={shardDetails.errors
                                                .join(NEW_LINE)
                                                .split(/\\n/)
                                                .join(NEW_LINE)
                                                .replaceAll(/\\"/g, '"')}
                                        />
                                    </Box>
                                </AccordionDetails>
                            </Accordion>
                        </Alert>
                    </Grid>
                )}

                <Grid item xs={12}>
                    <Box
                        sx={{
                            px: 1,
                            py: 2,
                            bgcolor: 'background.paper',
                            borderRadius: '2px',
                        }}
                    >
                        <span style={{ marginRight: 8, fontWeight: 500 }}>
                            <FormattedMessage id="detailsPanel.shardDetails.id.label" />
                        </span>

                        <span>{shardDetails.id}</span>
                    </Box>
                </Grid>
            </>
        )
    );
}

export default ShardInformation;
