import { Divider, FormControlLabel, Radio, RadioGroup } from '@mui/material';

import SingleStep from 'src/components/transformation/create/SingleStep';
import StepWrapper from 'src/components/transformation/create/Wrapper';
import {
    useTransformationCreate_language,
    useTransformationCreate_setLanguage,
} from 'src/stores/TransformationCreate/hooks';

function LanguageSelector() {
    const language = useTransformationCreate_language();
    const setLanguage = useTransformationCreate_setLanguage();

    return (
        <StepWrapper>
            <SingleStep>Language</SingleStep>

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
                    label="SQL"
                />

                <FormControlLabel
                    value="typescript"
                    control={<Radio size="small" />}
                    label="Typescript"
                />
            </RadioGroup>
        </StepWrapper>
    );
}

export default LanguageSelector;
