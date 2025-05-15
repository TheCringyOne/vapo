// frontend/src/App.jsx
import React, { useState, useEffect } from 'react';
import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/layout/Layout";

import HomePage from "./pages/HomePage";
import LoginPage from "./pages/auth/LoginPage";
import SignUpPage from "./pages/auth/SignUpPage";
import toast, { Toaster } from "react-hot-toast";
import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "./lib/axios";
import NotificationsPage from "./pages/NotificationsPage";
import NetworkPage from "./pages/NetworkPage";
import PostPage from "./pages/PostPage";
import ProfilePage from "./pages/ProfilePage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import ProjectsPage from "./pages/ProjectsPage";
import AnnouncementsPage from "./pages/AnnouncementsPage";
import JobBoardPage from "./pages/JobBoardPage"; // Import the new page component

// Import the questionnaire modal component
import QuestionnaireModal from "./components/QuestionnaireModal";

function App() {
    // State to control the questionnaire modal visibility
    const [showQuestionnaire, setShowQuestionnaire] = useState(false);
    
    const { data: authUser, isLoading } = useQuery({
        queryKey: ["authUser"],
        queryFn: async () => {
            try {
                const res = await axiosInstance.get("/auth/me");
                return res.data;
            } catch (err) {
                if (err.response && err.response.status === 401) {
                    return null;
                }
                toast.error(err.response?.data?.message || "Something went wrong");
                return null;
            }
        },
        retry: false,
        refetchOnWindowFocus: true,
    });
    
    // Effect to check if the user is an empresario and on their first login
    useEffect(() => {
        if (authUser && authUser.role === 'empresario' && authUser.isFirstLogin) {
            setShowQuestionnaire(true);
        } else {
            setShowQuestionnaire(false);
        }
    }, [authUser]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <Layout>
            {/* Questionnaire Modal for empresario users on first login */}
            {showQuestionnaire && (
                <QuestionnaireModal
                    isOpen={showQuestionnaire}
                    onClose={() => setShowQuestionnaire(false)}
                    user={authUser}
                />
            )}
            
            <Routes>
                <Route 
                    path="/" 
                    element={authUser ? <HomePage /> : <Navigate to="/login" />} 
                />
                <Route 
                    path="/login" 
                    element={!authUser ? <LoginPage /> : <Navigate to="/" />} 
                />
                <Route 
                    path="/signup" 
                    element={!authUser ? <SignUpPage /> : <Navigate to="/" />} 
                />
                <Route 
                    path="/notifications" 
                    element={authUser ? <NotificationsPage /> : <Navigate to="/login" />} 
                />
                <Route 
                    path="/network" 
                    element={authUser ? <NetworkPage /> : <Navigate to="/login" />} 
                />
                <Route 
                    path="/projects" 
                    element={authUser ? <ProjectsPage /> : <Navigate to="/login" />} 
                />
                <Route 
                    path="/announcements" 
                    element={
                        authUser ? 
                            (authUser.role === 'administrador' || authUser.role === 'egresado') ? 
                                <AnnouncementsPage /> : 
                                <Navigate to="/" /> 
                        : <Navigate to="/login" />
                    } 
                />
                {/* New Job Board Route with the same access restrictions as Announcements */}
                <Route 
                    path="/jobs" 
                    element={
                        authUser ? 
                            (authUser.role === 'administrador' || authUser.role === 'egresado') ? 
                                <JobBoardPage /> : 
                                <Navigate to="/" /> 
                        : <Navigate to="/login" />
                    } 
                />
                <Route 
                    path="/post/:postId" 
                    element={authUser ? <PostPage /> : <Navigate to="/login" />} 
                />
                <Route 
                    path="/profile/:username" 
                    element={authUser ? <ProfilePage /> : <Navigate to="/login" />} 
                />
                <Route 
                    path="/admin" 
                    element={
                        authUser && authUser.role === 'administrador' 
                            ? <AdminDashboardPage /> 
                            : <Navigate to="/" />
                    } 
                />
            </Routes>
            <Toaster 
                position="top-center"
                reverseOrder={false}
                toastOptions={{
                    duration: 3000,
                    style: {
                        background: '#363636',
                        color: '#fff',
                    },
                }}
            />
        </Layout>
    );
}

export default App;