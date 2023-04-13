import { TableCell, TableRow, Typography } from '@mui/material';
import DataVolume from 'components/tables/cells/billing/DataVolume';
import MonetaryValue from 'components/tables/cells/billing/MonetaryValue';
import TimeStamp from 'components/tables/cells/TimeStamp';
import { isEqual } from 'date-fns';
import { isEmpty } from 'lodash';
import {
    BillingDetails,
    ProjectedCostStatsDictionary,
} from 'stores/Tables/Billing/types';
import { ProjectedCostStats } from 'types';
import {
    evaluateDataVolume,
    evaluateTotalCost,
    getInitialBillingDetails,
    stripTimeFromDate,
} from 'utils/billing-utils';

interface RowProps {
    row: BillingDetails;
}

interface RowsProps {
    data: ProjectedCostStats[];
}

// TODO (billing): Adjust this helper function to translate data returned from
//   the new RPC when available.
const formatProjectedCostStats = (value: ProjectedCostStats[]) => {
    const taskStatData = value.filter((query) =>
        Object.hasOwn(query.flow_document, 'taskStats')
    );

    let sortedStats: ProjectedCostStatsDictionary = {};

    taskStatData.forEach((query) => {
        if (Object.hasOwn(sortedStats, query.ts)) {
            sortedStats[query.ts].push(query);
        } else {
            sortedStats = {
                ...sortedStats,
                [query.ts]: [query],
            };
        }
    });

    const billingDetails: BillingDetails[] = [];

    if (!isEmpty(sortedStats)) {
        Object.entries(sortedStats).forEach(([ts, stats]) => {
            const billingDetailsIndex = billingDetails.findIndex((detail) =>
                isEqual(detail.date, stripTimeFromDate(ts))
            );

            const taskCount = stats.length;
            const dataVolume = evaluateDataVolume(stats);
            const totalCost = evaluateTotalCost(dataVolume, taskCount);

            if (billingDetailsIndex === -1) {
                const { date, month, year, details } =
                    getInitialBillingDetails(ts);

                billingDetails.push({
                    date,
                    month,
                    year,
                    dataVolume,
                    taskCount,
                    details,
                    totalCost,
                });
            } else {
                const { date, month, year, details } =
                    billingDetails[billingDetailsIndex];

                billingDetails[billingDetailsIndex] = {
                    date,
                    month,
                    year,
                    dataVolume,
                    taskCount,
                    details,
                    totalCost,
                };
            }
        });
    }

    return billingDetails;
};

// TODO: Determine if the details table column is necessary and, if so,
//   what data should be displayed in that column. My proposition is that
//   the tier evaluation for that month should be identified in that column.
function Row({ row }: RowProps) {
    return (
        <TableRow hover>
            <TimeStamp time={row.date} monthOnly={true} />

            <DataVolume val={row.dataVolume} />

            <TableCell>
                <Typography>{row.taskCount}</Typography>
            </TableCell>

            {/* <TableCell>
                <Typography>Filler</Typography>
            </TableCell> */}

            <MonetaryValue amount={row.totalCost} />
        </TableRow>
    );
}

// TODO (billing): Remove pagination placeholder when the new RPC is available.
function Rows({ data }: RowsProps) {
    const billingDetails = formatProjectedCostStats(data);

    return (
        <>
            {billingDetails.slice(0, 4).map((detail, index) => (
                <Row row={detail} key={index} />
            ))}
        </>
    );
}

export default Rows;
