import type { AlertCardProps } from 'src/components/shared/Entity/Details/Alerts/types';

import { Alert, AlertTitle, Box } from '@mui/material';

import { DateTime } from 'luxon';

import CardWrapper from 'src/components/shared/CardWrapper';
import AlertCardHeader from 'src/components/shared/Entity/Details/Alerts/AlertCardHeader';
import AlertDetails from 'src/components/shared/Entity/Details/Alerts/AlertDetails';
import KeyValueList from 'src/components/shared/KeyValueList';
import useAlertTypeContent from 'src/hooks/useAlertTypeContent';

function AlertCard({ datum }: AlertCardProps) {
    const { explanation } = useAlertTypeContent(datum);

    return (
        <CardWrapper
            disablePadding
            message={
                <Alert
                    severity="warning"
                    sx={{
                        borderBottomLeftRadius: 0,
                        borderBottomRightRadius: 0,
                        [`&`]: {
                            width: '100%',
                        },
                    }}
                >
                    <AlertTitle
                        sx={{
                            width: '100%',
                        }}
                    >
                        <AlertCardHeader datum={datum} />
                    </AlertTitle>
                </Alert>
            }
        >
            <Box sx={{ px: 2, pb: 2 }}>
                <KeyValueList
                    data={[
                        {
                            title: `What's Happening?`,
                            val: explanation,
                        },
                        {
                            title: 'Fired At',
                            val: DateTime.fromISO(datum.firedAt)
                                .toUTC()
                                .toLocaleString(DateTime.DATETIME_FULL),
                        },
                    ]}
                />

                <AlertDetails datum={datum} />
            </Box>
        </CardWrapper>

        // <CardWrapper disablePadding>
        //     <AlertBox severity="warning" short>
        //         <AlertCardHeader datum={datum} />
        //         <Box sx={{ px: 2, pb: 2 }}>
        //             <KeyValueList
        //                 data={[
        //                     {
        //                         title: `What's Happening?`,
        //                         val: explanation,
        //                     },
        //                     {
        //                         title: 'Fired At',
        //                         val: DateTime.fromISO(datum.firedAt)
        //                             .toUTC()
        //                             .toLocaleString(DateTime.DATETIME_FULL),
        //                     },
        //                 ]}
        //             />
        //             <AlertDetails datum={datum} />
        //         </Box>
        //     </AlertBox>
        // </CardWrapper>

        // <CardWrapper message={<AlertCardHeader datum={datum} />}>
        //     <KeyValueList
        //         data={[
        //             {
        //                 title: `What's Happening?`,
        //                 val: explanation,
        //             },
        //             {
        //                 title: 'Started At',
        //                 val: DateTime.fromISO(datum.firedAt)
        //                     .toUTC()
        //                     .toLocaleString(DateTime.DATETIME_FULL),
        //             },
        //         ]}
        //     />
        //     <AlertDetails datum={datum} />
        // </CardWrapper>
    );
}

export default AlertCard;
