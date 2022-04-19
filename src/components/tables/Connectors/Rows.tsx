import { Box, Button, TableCell, TableRow } from '@mui/material';
import { routeDetails } from 'app/Authenticated';
import ExternalLink from 'components/shared/ExternalLink';
import { Connector } from 'components/tables/Connectors';
import { FormattedDate, FormattedMessage } from 'react-intl';
import { useNavigate } from 'react-router';

interface Props {
    data: Connector[];
}
const columnStyling = {
    maxWidth: '20%',
    textOverflow: 'ellipsis',
    width: '20%',
};

function Rows({ data }: Props) {
    const navigate = useNavigate();

    return (
        <>
            {data.map((row) => (
                <TableRow key={`Connector-${row.id}`}>
                    <TableCell style={columnStyling}>
                        {row.image_name}
                    </TableCell>
                    <TableCell style={columnStyling}>{row.detail}</TableCell>
                    <TableCell style={columnStyling}>
                        {row.connector_tags[0].protocol}
                    </TableCell>
                    <TableCell style={columnStyling}>
                        <FormattedDate
                            day="numeric"
                            month="long"
                            year="numeric"
                            value={row.updated_at}
                        />
                    </TableCell>
                    <TableCell style={columnStyling}>
                        {row.connector_tags[0].documentation_url ? (
                            <ExternalLink
                                link={row.connector_tags[0].documentation_url}
                            >
                                Docs
                            </ExternalLink>
                        ) : (
                            <>N/A</>
                        )}
                    </TableCell>
                    <TableCell>
                        <Box
                            sx={{
                                display: 'flex',
                            }}
                        >
                            <Button
                                variant="contained"
                                size="small"
                                color="success"
                                disableElevation
                                disabled={
                                    row.connector_tags[0].protocol !== 'capture'
                                }
                                onClick={() => {
                                    if (
                                        row.connector_tags[0].protocol ===
                                        'capture'
                                    ) {
                                        navigate(
                                            `${routeDetails.capture.create.fullPath}?${routeDetails.capture.create.params.connectorID}=${row.connector_tags[0].id}`
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
                        </Box>
                    </TableCell>
                </TableRow>
            ))}
        </>
    );
}

export default Rows;
