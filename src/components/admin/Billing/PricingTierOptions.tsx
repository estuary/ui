import AutocompletedField from 'components/shared/toolbar/AutocompletedField';
import { Dispatch, SetStateAction } from 'react';
import { useIntl } from 'react-intl';
import { FREE_GB_BY_TIER } from 'utils/billing-utils';

interface Props {
    options: string[];
    setPricingTier: Dispatch<SetStateAction<string>>;
    setTaskRate: Dispatch<SetStateAction<FREE_GB_BY_TIER>>;
}

function PricingTierOptions({ options, setPricingTier, setTaskRate }: Props) {
    const intl = useIntl();

    const changePricingTier = (
        _event: React.SyntheticEvent,
        value: string | null
    ) => {
        setPricingTier(value ?? options[0]);

        switch (value) {
            case options[1]:
                setTaskRate(FREE_GB_BY_TIER.PERSONAL);
                break;
            case options[2]:
                setTaskRate(FREE_GB_BY_TIER.ENTERPRISE);
                break;
            default:
                setTaskRate(FREE_GB_BY_TIER.FREE);
        }
    };

    return (
        <AutocompletedField
            label={intl.formatMessage({
                id: 'admin.billing.label.tiers',
            })}
            options={options}
            defaultValue={options[1]}
            changeHandler={changePricingTier}
            autocompleteSx={{ flexGrow: 1 }}
        />
    );
}

export default PricingTierOptions;
