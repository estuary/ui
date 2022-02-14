import {
    Box,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Toolbar,
    Typography,
} from '@mui/material';
import PageContainer from 'components/shared/PageContainer';
import useConnectors from 'hooks/useConnectors';
import { FormattedDate, FormattedMessage } from 'react-intl';

const Admin = () => {
    const { connectors, isFetchingConnectors, fetchingConnectorsError } =
        useConnectors();

    console.log('connectors', connectors);

    return (
        <PageContainer>
            <Toolbar>
                <Typography>
                    <FormattedMessage id="admin.header" />
                </Typography>
            </Toolbar>

            <Box>
                <Box
                    sx={{
                        mx: 2,
                    }}
                >
                    {isFetchingConnectors ? <>Loading...</> : null}

                    {fetchingConnectorsError ? (
                        <>{fetchingConnectorsError}</>
                    ) : null}

                    {connectors ? (
                        <TableContainer component={Box}>
                            <Table
                                sx={{ minWidth: 650 }}
                                aria-label="simple table"
                            >
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Name</TableCell>
                                        <TableCell>Description</TableCell>
                                        <TableCell>Type</TableCell>
                                        <TableCell>Maintainer</TableCell>
                                        <TableCell>Last Updated</TableCell>
                                        <TableCell></TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {connectors.data.map((row: any) => (
                                        <TableRow
                                            key={row.name}
                                            sx={{
                                                '&:last-child td, &:last-child th':
                                                    { border: 0 },
                                            }}
                                        >
                                            <TableCell
                                                component="th"
                                                scope="row"
                                            >
                                                {row.attributes.name}
                                            </TableCell>
                                            <TableCell>
                                                {row.attributes.description}
                                            </TableCell>
                                            <TableCell>
                                                {row.attributes.type}
                                            </TableCell>
                                            <TableCell>
                                                {row.attributes.maintainer}
                                            </TableCell>
                                            <TableCell>
                                                <FormattedDate
                                                    day="numeric"
                                                    month="long"
                                                    year="numeric"
                                                    value={
                                                        row.attributes
                                                            .updated_at
                                                    }
                                                />
                                            </TableCell>

                                            <TableCell>
                                                <a href={row.links.images}>
                                                    More details
                                                </a>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    ) : null}
                </Box>
            </Box>
        </PageContainer>
    );
};

export default Admin;
