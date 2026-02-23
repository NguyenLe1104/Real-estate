import { Outlet } from 'react-router-dom';
import PublicHeader from './PublicHeader';
import PublicFooter from './PublicFooter';

const PublicLayout: React.FC = () => {
    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <PublicHeader />
            <main style={{ flex: 1 }}>
                <Outlet />
            </main>
            <PublicFooter />
        </div>
    );
};

export default PublicLayout;
