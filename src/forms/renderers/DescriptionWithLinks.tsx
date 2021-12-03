import { FormHelperText } from '@mui/material';
import { useMemo } from 'react';

interface DescriptionWithLinksProps {
    isValid: boolean;
    showDescription: boolean;
    firstFormHelperText: string | undefined | null;
    secondFormHelperText: string | undefined | null;
}

export const DescriptionWithLinks = (props: DescriptionWithLinksProps) => {
    const {
        isValid,
        showDescription,
        firstFormHelperText,
        secondFormHelperText,
    } = props;

    const escapedDescription = useMemo(() => {
        if (typeof secondFormHelperText === 'string') {
            return (
                <div
                    dangerouslySetInnerHTML={{
                        __html: secondFormHelperText,
                    }}
                ></div>
            );
        } else {
            return secondFormHelperText;
        }
    }, [secondFormHelperText]);

    return (
        <>
            <FormHelperText error={!isValid && !showDescription}>
                {firstFormHelperText}
            </FormHelperText>
            <FormHelperText error={!isValid}>
                {escapedDescription}
            </FormHelperText>
        </>
    );
};
