import {
    Divider,
    FormControlLabel,
    Radio,
    RadioGroup,
    Typography,
} from '@mui/material';

import { FormattedMessage, useIntl } from 'react-intl';

import LegacySingleStep from 'src/components/transformation/create/legacy/SingleStep';
import { LegacyStepWrapper } from 'src/components/transformation/create/legacy/Wrapper';
import {
    useTransformationCreate_language,
    useTransformationCreate_setLanguage,
} from 'src/stores/TransformationCreate/hooks';

// TODO (transform): Remove this component when the new transform create workflow can be released
//   because it is only used in the legacy workflow.
function LegacyLanguageSelector() {
    const intl = useIntl();

    const language = useTransformationCreate_language();
    const setLanguage = useTransformationCreate_setLanguage();

    return (
        <LegacyStepWrapper last="true">
            <div style={{ padding: '0.5rem 16px' }}>
                <LegacySingleStep num={2}>
                    <Typography>
                        <FormattedMessage id="newTransform.language.title" />
                    </Typography>
                </LegacySingleStep>
            </div>

            <Divider />

            <RadioGroup
                sx={{ padding: '16px', paddingTop: '4px' }}
                value={language}
                onChange={(e) => setLanguage(e.target.value as any)}
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
        </LegacyStepWrapper>
    );
}

export default LegacyLanguageSelector;
