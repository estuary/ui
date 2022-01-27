import { Autocomplete, TextField } from '@mui/material';
import { Box } from '@mui/system';
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
    const { isFetching, sourceTypes, error } = useSourceTypes();

    return (
        <>
            <Autocomplete
                id={props.id}
                sx={{ width: 300 }}
                options={sourceTypes}
                autoHighlight
                openOnFocus
                disableClearable
                blurOnSelect="mouse"
                noOptionsText={intl.formatMessage({
                    id: "common.optionsMissing"
                })}
                loading={isFetching}
                onChange={function (event, reason: any) {
                    props.onSourceChange(reason ? reason.key : '');
                }}
                renderOption={(props, option: any) => (
                    <Box component="li" {...props}>
                        {option.label}
                    </Box>
                )}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        label={
                            intl.formatMessage({
                                id: error !== null
                                    ? 'capturesource.fetch.failed'
                                    : "capturesource.label",
                            })
                        }
                        error={error !== null}
                        required={true}
                        inputProps={{
                            ...params.inputProps,
                            autoComplete: 'off',
                        }}
                    />
                )}
            />
        </>
    );
}

export default SourceTypeSelect;
