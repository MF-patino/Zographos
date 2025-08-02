
import AuthForm from './auth/AuthForm';
import { useAuthContext } from './auth/AuthContext';

// This component handles the rendering of the main components
// inside the web application's body
export default function AppDisplayer() {
    const { userInfo } = useAuthContext();
    if (userInfo){
        return (
            <div>
                <h2>Welcome, {userInfo.basic_info.firstName}!</h2>
                <p>Your permission level is: {userInfo.permissions}</p>
            </div>
        );
    }

    return <AuthForm />
}