import { ControlProps } from '@jsonforms/core';
import { withJsonFormsControlProps } from '@jsonforms/react';
import JSONBlob from './JSONBlob';

const JSONBlobControl = ({
    data,
    handleChange,
    path,
    errors,
}: ControlProps) => <JSONBlob />;

export default withJsonFormsControlProps(JSONBlobControl);
