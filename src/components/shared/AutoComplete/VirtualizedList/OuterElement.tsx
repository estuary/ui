import React from 'react';

export const OuterElementContext = React.createContext({});

function OuterElementComponent(props: any, ref: any) {
    const outerProps = React.useContext(OuterElementContext);
    return <div ref={ref} {...props} {...outerProps} />;
}

export const OuterElement = React.forwardRef<HTMLDivElement>(
    OuterElementComponent
);
