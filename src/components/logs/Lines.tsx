import { hasLength } from 'utils/misc-utils';
import { useLogsContext } from './Context';
import LogLine from './Line';
import LogLinesWrapper from './LinesWrapper';
import Spinner from './Spinner';
import { SpinnerOptions } from './types';

interface Props {
    height: number;
    spinnerOptions?: SpinnerOptions;
}

function LogLines({ height, spinnerOptions }: Props) {
    const disableSpinner = spinnerOptions?.disable ?? false;
    const runningKey = spinnerOptions?.messages?.runningKey ?? undefined;
    const stoppedKey = spinnerOptions?.messages?.stoppedKey ?? undefined;
    const severity = spinnerOptions?.severity ?? undefined;

    const { logs } = useLogsContext();

    return (
        <LogLinesWrapper height={height} scrollTrigger={logs}>
            <>
                {logs.map((line, index) => (
                    <LogLine
                        key={`logLine-${index}`}
                        line={line}
                        lineNumber={index}
                    />
                ))}
                {!disableSpinner || !hasLength(logs) ? (
                    <Spinner
                        stoppedKey={stoppedKey}
                        runningKey={runningKey}
                        severity={severity}
                    />
                ) : null}
            </>
        </LogLinesWrapper>
    );
}

export default LogLines;
