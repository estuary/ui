import { ControlProps } from '@jsonforms/core';
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
    errors,
}: ControlProps & CaptureSourceControlProps) => (
    <CaptureSource
        value={data}
        updateValue={(newValue: string) => handleChange(path, newValue)}
        errors={errors}
    />
);

export default withJsonFormsControlProps(CaptureSourceControl);
