import routes from '@routes';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
const Dashboard = () => {
    const navigate  =useNavigate();
    useEffect(() => {
        navigate(routes.managerListPage.path);
    }, []);
    return null;
};

export default Dashboard;
