import { withJsonFormsControlProps } from '@jsonforms/react';
import { CaptureSource } from './CaptureSource';

interface CaptureSourceControlProps {
    data: any;
    handleChange(path: string, value: any): void;
    path: string;
}

const CaptureSourceControl = ({
    data,
    handleChange,
    path,
}: CaptureSourceControlProps) => (
    <CaptureSource
        value={data}
        updateValue={(newValue: string) => handleChange(path, newValue)}
    />
);

export default withJsonFormsControlProps(CaptureSourceControl);
