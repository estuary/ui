import type { TableColumns } from 'src/types';

import { Fragment, useState } from 'react';

import { Collapse, TableCell, TableRow, useTheme } from '@mui/material';

import { useIntl } from 'react-intl';

import { authenticatedRoutes } from 'src/app/routes';
import DetailsPane from 'src/components/tables/AlertHistory/DetailsPane';
import ChipList from 'src/components/tables/cells/ChipList';
import EntityNameLink from 'src/components/tables/cells/EntityNameLink';
import TimeStamp from 'src/components/tables/cells/TimeStamp';
import { getEntityTableRowSx } from 'src/context/Theme';
import useDetailsNavigator from 'src/hooks/useDetailsNavigator';

interface RowsProps {
    columns: TableColumns[];
    data: any;
    disableDetailsLink?: boolean;
}

interface RowProps {
    row: any;
    setFoo: () => void;
    disableDetailsLink?: boolean;
}

function Row({
    disableDetailsLink,
    setFoo,
    row: { alertType, catalogName, firedAt, resolvedAt, alertDetails },
}: RowProps) {
    const intl = useIntl();
    const theme = useTheme();

    const { generatePath } = useDetailsNavigator(
        alertDetails.spec_type === 'capture'
            ? authenticatedRoutes.captures.details.overview.fullPath
            : alertDetails.spec_type === 'materialization'
              ? authenticatedRoutes.materializations.details.overview.fullPath
              : authenticatedRoutes.collections.details.overview.fullPath
    );

    return (
        <TableRow
            hover
            sx={getEntityTableRowSx(theme)}
            onClick={() => {
                setFoo();
            }}
        >
            {disableDetailsLink ? (
                <TableCell>{catalogName}</TableCell>
            ) : (
                <EntityNameLink
                    name={catalogName}
                    showEntityStatus={false}
                    detailsLink={generatePath({ catalog_name: catalogName })}
                    entityStatusTypes={[alertDetails.spec_type]}
                />
            )}

            <TableCell>
                {alertType
                    ? intl.formatMessage({
                          id: `admin.notifications.alertType.${alertType}`,
                      })
                    : ''}
            </TableCell>

            <ChipList
                stripPath={false}
                values={alertDetails.recipients.map(
                    (recipient: any) => recipient.email
                )}
            />

            <TimeStamp time={firedAt} />

            <TableCell>{resolvedAt}</TableCell>
        </TableRow>
    );
}

function Rows({ data, disableDetailsLink }: RowsProps) {
    const [foo, setFoo] = useState(false);

    return (
        <>
            {data.map((row: any, index: number) => (
                <Fragment key={`alertHistoryTable_${index}`}>
                    <Row
                        setFoo={() => {
                            setFoo(!foo);
                        }}
                        row={row}
                        disableDetailsLink={disableDetailsLink}
                    />
                    <TableRow>
                        <TableCell colSpan={5}>
                            <Collapse unmountOnExit in={Boolean(foo)}>
                                <DetailsPane foo={data} />
                            </Collapse>
                        </TableCell>
                    </TableRow>
                </Fragment>
            ))}
        </>
    );
}

export default Rows;
