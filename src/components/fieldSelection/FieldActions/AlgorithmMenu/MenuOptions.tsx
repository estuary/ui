import type { MenuOptionsProps } from 'src/components/fieldSelection/types';
import type { SelectionAlgorithm } from 'src/stores/Binding/slices/FieldSelection';

import { RadioGroup } from '@mui/material';

import RadioMenuItem from 'src/components/shared/RadioMenuItem';

export default function MenuOptions({
    selectionAlgorithm,
    setSelectionAlgorithm,
}: MenuOptionsProps) {
    return (
        <RadioGroup
            onChange={(event) =>
                setSelectionAlgorithm(event.target.value as SelectionAlgorithm)
            }
            value={selectionAlgorithm}
            style={{ maxWidth: 320, textWrap: 'wrap' }}
        >
            <RadioMenuItem
                description="Select only required fields"
                label="Required Only"
                value="depthZero"
            />

            <RadioMenuItem
                description="Select all top-level fields"
                label="Depth 1"
                value="depthOne"
            />

            <RadioMenuItem
                description="Select fields at levels one and two"
                label="Depth 2"
                value="depthTwo"
            />

            <RadioMenuItem
                description="Select all fields"
                label="Unlimited Depth"
                value="depthUnlimited"
            />
        </RadioGroup>
    );
}
