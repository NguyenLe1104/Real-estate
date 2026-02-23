import { Spin } from 'antd';

const Loading: React.FC = () => {
    return (
        <div
            style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: 400,
            }}
        >
            <Spin size="large" />
        </div>
    );
};

export default Loading;
