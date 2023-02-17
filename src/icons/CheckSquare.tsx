import { IconoirContext } from 'iconoir-react';
import React from 'react';

function SvgCheckSquare(
    passedProps: React.SVGProps<SVGSVGElement>,
    svgRef?: React.Ref<SVGSVGElement>
) {
    const context = React.useContext(IconoirContext);
    const props = {
        ...context,
        ...passedProps,
    };

    return (
        <svg
            width="1.5em"
            height="1.5em"
            strokeWidth={1.5}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            color="currentColor"
            ref={svgRef}
            {...props}
        >
            <path
                d="M21 3.6V20.4C21 20.5591 20.9368 20.7117 20.8243 20.8243C20.7117 20.9368 20.5591 21 20.4 21H3.6C3.44087 21 3.28826 20.9368 3.17574 20.8243C3.06321 20.7117 3 20.5591 3 20.4V3.6C3 3.44087 3.06321 3.28826 3.17574 3.17574C3.28826 3.06321 3.44087 3 3.6 3H20.4C20.5591 3 20.7117 3.06321 20.8243 3.17574C20.9368 3.28826 21 3.44087 21 3.6Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />

            <path
                d="M8 12.4286L10.2857 14.7143L16 9"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

const ForwardRef = React.forwardRef(SvgCheckSquare);

export default ForwardRef;
