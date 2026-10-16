import type { WaitingForRowProps } from 'src/components/tables/Logs/types';

import { Button, Stack, Typography } from '@mui/material';

import { BaseTypographySx } from 'src/components/tables/cells/logs/shared';
import {
    formatSearchedBackTo,
    MAX_BYTES_SCANNED_WITHOUT_MATCH,
} from 'src/components/tables/Logs/shared';
import WaitingForRowBase from 'src/components/tables/Logs/WaitingForRow/Base';
import {
    useJournalDataLogs_olderScanPaused,
    useJournalDataLogs_oldestLoadedTs,
} from 'src/stores/JournalData/Logs/hooks';
import { useJournalDataLogsStore } from 'src/stores/JournalData/Logs/Store';
import { MEGABYTE } from 'src/utils/dataPlane-utils';

const scannedMegabytes = Math.round(MAX_BYTES_SCANNED_WITHOUT_MATCH / MEGABYTE);

function WaitingForOldLogsRow(props: WaitingForRowProps) {
    const olderFinished = useJournalDataLogsStore(
        (state) => state.olderFinished
    );
    const resetBytesScannedWithoutMatch = useJournalDataLogsStore(
        (state) => state.resetBytesScannedWithoutMatch
    );
    const scanPaused = useJournalDataLogs_olderScanPaused();
    const oldestLoadedTs = useJournalDataLogs_oldestLoadedTs();
    const searchedBackTo = oldestLoadedTs
        ? formatSearchedBackTo(oldestLoadedTs)
        : null;

    return (
        <WaitingForRowBase
            {...props}
            fetchOption="old"
            disabled={olderFinished || scanPaused}
            disabledContent={
                scanPaused ? (
                    <Stack
                        direction="row"
                        spacing={1}
                        sx={{ alignItems: 'center' }}
                    >
                        <Typography sx={BaseTypographySx}>
                            {searchedBackTo
                                ? `No matches in the last ${scannedMegabytes} MB read, back to ${searchedBackTo}`
                                : `No matches in the last ${scannedMegabytes} MB read`}
                        </Typography>
                        <Button
                            size="small"
                            variant="text"
                            onClick={resetBytesScannedWithoutMatch}
                            sx={{ py: 0 }}
                        >
                            Keep searching
                        </Button>
                    </Stack>
                ) : undefined
            }
        />
    );
}

export default WaitingForOldLogsRow;
