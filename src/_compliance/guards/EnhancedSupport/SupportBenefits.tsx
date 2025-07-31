import SupportWrapper from 'src/_compliance/guards/EnhancedSupport/SupportWrapper';
import RegisterPerk from 'src/pages/login/Perk';

function SupportBenefits() {
    return (
        <SupportWrapper titleMessageId="supportConsent.benefits.title">
            <RegisterPerk
                disableNoWrap
                messageID="supportConsent.benefits.list1"
            />
            <RegisterPerk
                disableNoWrap
                messageID="supportConsent.benefits.list2"
            />
            <RegisterPerk
                disableNoWrap
                messageID="supportConsent.benefits.list3"
            />
        </SupportWrapper>
    );
}

export default SupportBenefits;
