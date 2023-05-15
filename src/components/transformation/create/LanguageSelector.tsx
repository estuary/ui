import { Divider, FormControlLabel, Radio, RadioGroup } from '@mui/material';
import { FormattedMessage, useIntl } from 'react-intl';
import {
    useTransformationCreate_language,
    useTransformationCreate_setLanguage,
} from 'stores/TransformationCreate/hooks';
import SingleStep from './SingleStep';
import StepWrapper from './Wrapper';

// TODO (transform create)
function LanguageSelector() {
    const intl = useIntl();

    const language = useTransformationCreate_language();
    const setLanguage = useTransformationCreate_setLanguage();

    return (
        <StepWrapper>
            <SingleStep>
                <FormattedMessage id="newTransform.language.title" />
            </SingleStep>

            <Divider />

            <RadioGroup
                row
                value={language}
                onChange={(e) => setLanguage(e.target.value as any)}
                sx={{ py: 1, px: 2 }}
            >
                <FormControlLabel
                    value="sql"
                    control={<Radio size="small" />}
                    label={intl.formatMessage({
                        id: 'newTransform.language.sql',
                    })}
                />

                <FormControlLabel
                    value="typescript"
                    control={<Radio size="small" />}
                    label={intl.formatMessage({
                        id: 'newTransform.language.ts',
                    })}
                />
            </RadioGroup>
        </StepWrapper>
    );
}

export default LanguageSelector;
