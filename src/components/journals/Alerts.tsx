import { ReactNode } from 'react';

import { Box } from '@mui/material';

import { FormattedMessage } from 'react-intl';

import AlertBox from 'src/components/shared/AlertBox';
import { hasLength } from 'src/utils/misc-utils';

interface Props {
    journalData: any;
    journalsData?: any;
    notFoundTitleMessage: ReactNode;
}

function JournalAlerts({
    journalsData,
    journalData,
    notFoundTitleMessage,
}: Props) {
    let title: string | null = null;
    let message: ReactNode | string | null = null;

    if (journalsData && !hasLength(journalsData.journals)) {
        title = 'journals.notFound.title';
        message = notFoundTitleMessage;
    } else if (
        journalData.data?.tooManyBytes &&
        journalData.data.documents.length === 0
    ) {
        title = 'journals.tooManyBytesAndNoDocuments.title';
        message = 'journals.tooManyBytesAndNoDocuments.message';
    } else if (journalData.data?.tooFewDocuments) {
        title = 'journals.tooFewDocuments.title';
        message = 'journals.tooFewDocuments.message';
    } else if (journalData.data?.tooManyBytes) {
        title = 'journals.tooManyBytes.title';
        message = 'journals.tooManyBytes.message';
    }

    if (title && message) {
        return (
            <Box sx={{ mb: 3 }}>
                <AlertBox
                    severity="warning"
                    short
                    title={<FormattedMessage id={title} />}
                >
                    {typeof message === 'string' ? (
                        <FormattedMessage id={message} />
                    ) : (
                        message
                    )}
                </AlertBox>
            </Box>
        );
    }

    return null;
}

export default JournalAlerts;
