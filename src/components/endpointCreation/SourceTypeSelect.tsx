import { Autocomplete, Box, TextField } from '@mui/material';
import useSourceTypes from 'hooks/useSourceTypes';
import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';

const SourceTypePropTypes = {
    id: PropTypes.string.isRequired,
    onSourceChange: PropTypes.func.isRequired,
    sourceType: PropTypes.string,
};
SourceTypeSelect.propTypes = SourceTypePropTypes;
type SourceTypeProps = PropTypes.InferProps<typeof SourceTypePropTypes>;

function SourceTypeSelect(props: SourceTypeProps) {
    const intl = useIntl();
    const { id, onSourceChange } = props;
    const {
        data: { sourceTypes },
        error,
        loading,
    } = useSourceTypes();

    return (
        <Autocomplete
            id={id}
            sx={{ width: 300 }}
            options={sourceTypes}
            autoHighlight
            openOnFocus
            disableClearable
            blurOnSelect="mouse"
            noOptionsText={intl.formatMessage({
                id: 'common.optionsMissing',
            })}
            loading={loading}
            onChange={(event, reason: any) => {
                onSourceChange(reason ? reason.key : '');
            }}
            renderOption={(renderProps, option: any) => (
                <Box component="li" {...renderProps}>
                    {option.label}
                </Box>
            )}
            renderInput={(params) => (
                <TextField
                    {...params}
                    label={intl.formatMessage({
                        id:
                            error === null
                                ? 'capturesource.label'
                                : 'capturesource.fetch.failed',
                    })}
                    error={error !== null}
                    required={true}
                    inputProps={{
                        ...params.inputProps,
                        autoComplete: 'off',
                    }}
                />
            )}
        />
    );
}

export default SourceTypeSelect;
