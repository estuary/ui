import {
    Box,
    Divider,
    FormControlLabel,
    Radio,
    RadioGroup,
    Typography,
} from '@mui/material';
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
            <Box sx={{ py: 1, px: 0.5 }}>
                <SingleStep num={2}>
                    <Typography>
                        <FormattedMessage id="newTransform.language.title" />
                    </Typography>
                </SingleStep>
            </Box>

            <Divider />

            <RadioGroup
                sx={{ pt: 1, pb: 1, px: 2 }}
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
        </StepWrapper>
    );
}

export default LanguageSelector;
