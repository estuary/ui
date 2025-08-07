import { Stack } from '@mui/material';

import CardHeader from 'src/_compliance/components/admin/Support/CardHeader';
import EnhancedSupportEnabled from 'src/_compliance/components/admin/Support/EnhancedSupportEnabled';
import EnhancedSupportForm from 'src/_compliance/components/admin/Support/EnhancedSupportForm';
import FormError from 'src/_compliance/components/admin/Support/FormError';
import usePrivacySettings from 'src/_compliance/hooks/usePrivacySettings';
import CardWrapper from 'src/components/shared/CardWrapper';

function EnhancedSupportChip() {
    const { enhancedSupportEnabled } = usePrivacySettings();

    return (
        <CardWrapper message={<CardHeader />}>
            <Stack spacing={1}>
                <FormError />
                {enhancedSupportEnabled ? (
                    <EnhancedSupportEnabled />
                ) : (
                    <EnhancedSupportForm />
                )}
            </Stack>
        </CardWrapper>
    );
}

export default EnhancedSupportChip;
