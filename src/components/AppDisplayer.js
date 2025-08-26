
import AuthForm from './auth/AuthForm';
import { useAuthContext } from './auth/AuthContext';
import ScrollPage from './scrolls/ScrollPage';

// This component handles the rendering of the main components
// inside the web application's body
export default function AppDisplayer() {
    const { userInfo } = useAuthContext();
    if (userInfo){
        return <ScrollPage />
    }

    return <AuthForm />
}