import Stats from '.';

interface Props {
    name: string;
    val: number;
    time: string;
}

const Docs = ({ val, name, time }: Props) => {
    return (
        <Stats time={time} name={name}>
            {val}
        </Stats>
    );
};

export default Docs;
