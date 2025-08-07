import CardHeader from 'src/_compliance/components/admin/Support/CardHeader';
import EnhancedSupportEnabled from 'src/_compliance/components/admin/Support/EnhancedSupportEnabled';
import RecordingConsentModal from 'src/_compliance/components/admin/Support/RecordingConsentModal';
import usePrivacySettings from 'src/_compliance/hooks/usePrivacySettings';
import CardWrapper from 'src/components/shared/CardWrapper';

function EnhancedSupportChip() {
    const { enhancedSupportEnabled } = usePrivacySettings();

    return (
        <CardWrapper message={<CardHeader />}>
            {enhancedSupportEnabled ? (
                <EnhancedSupportEnabled />
            ) : (
                <RecordingConsentModal />
            )}
        </CardWrapper>
    );
}

export default EnhancedSupportChip;
