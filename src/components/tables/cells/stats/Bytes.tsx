import prettyBytes from 'pretty-bytes';
import Stats from '.';

interface Props {
    name: string;
    val: number;
    time: string;
}

const Bytes = ({ val, name, time }: Props) => {
    return (
        <Stats time={time} name={name}>
            {prettyBytes(val, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            })}
        </Stats>
    );
};

export default Bytes;
