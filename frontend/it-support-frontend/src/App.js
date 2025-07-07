import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext'; 
import MaterialPage from './pages/MaterialPage';
import EditMaterialPage from './pages/EditMaterialPage';
import CreateMaterialPage from './pages/CreateMaterialPage';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import CreateCategoryPage from './pages/CreateCategoryPage';
import CategoryPage from './pages/CategoryPage';
import UserSearchPage from './pages/UserSearchPage';
import UserProfilePage from './pages/UserProfilePage';
import UserMaterialsPage from './pages/UserMaterialsPage';

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route
                        path="/home"
                        element={
                            <ProtectedRoute>
                                <HomePage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/materials/create"
                        element={
                            <ProtectedRoute>
                                <CreateMaterialPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/categories/create"
                        element={
                            <ProtectedRoute>
                                <CreateCategoryPage />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/materials/:id"
                        element={
                            <ProtectedRoute>
                                <MaterialPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/materials/:id/edit"
                        element={
                            <ProtectedRoute>
                                <EditMaterialPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/category/:categoryId"
                        element={
                            <ProtectedRoute>
                                <CategoryPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                    path="/users/search"
                    element={
                        <ProtectedRoute>
                        <UserSearchPage />
                        </ProtectedRoute>
                    }
                    />
                    <Route
                    path="/profile/:id"
                    element={
                        <ProtectedRoute>
                        <UserProfilePage />
                        </ProtectedRoute>
                    }
                    />
                    <Route path="/users/:id/materials"
                    element={<UserMaterialsPage />} 
                    />

                </Routes>
                <ToastContainer position="top-center" autoClose={1500} />
            </Router>
        </AuthProvider>
    );
}

export default App;
