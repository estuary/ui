import { useLogsContext } from './Context';
import LogLine from './Line';

function LogLines() {
    const { logs } = useLogsContext();

    return (
        <>
            {logs.map((line, index) => (
                <LogLine
                    key={`logLine-${index}`}
                    line={line}
                    lineNumber={index}
                />
            ))}
        </>
    );
}

export default LogLines;
