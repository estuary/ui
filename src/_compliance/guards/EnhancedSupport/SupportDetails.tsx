import SupportWrapper from 'src/_compliance/guards/EnhancedSupport/SupportWrapper';
import RegisterPerk from 'src/pages/login/Perk';

function SupportDetails() {
    return (
        <SupportWrapper titleMessageId="supportConsent.details.title">
            <RegisterPerk
                disableNoWrap
                disableEmphasisColor
                messageID="supportConsent.details.list1"
            />
            <RegisterPerk
                disableNoWrap
                disableEmphasisColor
                messageID="supportConsent.details.list2"
            />
            <RegisterPerk
                disableNoWrap
                disableEmphasisColor
                messageID="supportConsent.details.list3"
            />
            <RegisterPerk
                disableNoWrap
                disableEmphasisColor
                messageID="For details, see our Privacy Policy and Support Terms"
            />
        </SupportWrapper>
    );
}

export default SupportDetails;
