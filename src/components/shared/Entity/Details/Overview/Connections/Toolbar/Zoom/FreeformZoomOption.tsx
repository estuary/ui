import { FormControl, FormControlLabel, Switch } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { useScopedSystemGraph } from '../../Store/Store';

interface Props {
    onFreeformZoomChange: (
        event: React.SyntheticEvent<Element, Event>,
        checked: boolean
    ) => void;
    disabled?: boolean;
}

function FreeformZoomOption({ onFreeformZoomChange, disabled }: Props) {
    const userZoomingEnabled = useScopedSystemGraph(
        (state) => state.userZoomingEnabled
    );

    return (
        <FormControl>
            <FormControlLabel
                control={
                    <Switch
                        size="small"
                        value={userZoomingEnabled}
                        checked={userZoomingEnabled}
                        disabled={disabled}
                        onChange={onFreeformZoomChange}
                        sx={{ ml: 2 }}
                    />
                }
                label={
                    <FormattedMessage id="details.scopedSystemGraph.toolbar.zoom.freeformZoom.label" />
                }
                labelPlacement="start"
                style={{ margin: 0, justifyContent: 'space-between' }}
            />
        </FormControl>
    );
}

export default FreeformZoomOption;
