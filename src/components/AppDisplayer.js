
import { Routes, Route, Navigate } from 'react-router-dom';
import AuthForm from './auth/AuthForm';
import { useAuthContext } from './auth/AuthContext';
import ScrollPage from './scrolls/ScrollPage';
import ScrollAnnotationPage from './scrolls/ScrollAnnotationPage';

// This component handles the rendering of the main components
// inside the web application's body
export default function AppDisplayer() {
    const { userInfo } = useAuthContext();

    return (
            <Routes>
                <Route path="/" element={
                    userInfo ? <Navigate to="/scrolls" /> : <AuthForm />
                } />

                <Route path="/scrolls" element={
                    userInfo ? <ScrollPage /> : <Navigate to="/" />
                } />
                
                <Route path="/scrolls/:scrollId" element={
                    userInfo ? <ScrollAnnotationPage /> : <Navigate to="/" />
                } />
                
                {/* You can add a catch-all route for 404 pages later */}
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        );
}