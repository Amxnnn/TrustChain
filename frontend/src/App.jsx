import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import ProtectedRoute from './components/ProtectedRoute';
import { WalletProvider } from './context/WalletContext';
import Home from './pages/Home';
import RegisterProduct from './pages/RegisterProduct';
import UpdateLocation from './pages/UpdateLocation';
import VerifyProduct from './pages/VerifyProduct';
import Dashboard from './pages/Dashboard';

function App() {
    return (
        <WalletProvider>
            <BrowserRouter>
                <div className="min-h-screen bg-gray-50 flex flex-col">

                    <main className="flex-grow">
                        <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/register" element={<ProtectedRoute><RegisterProduct /></ProtectedRoute>} />
                            <Route path="/update" element={<ProtectedRoute><UpdateLocation /></ProtectedRoute>} />
                            <Route path="/verify" element={<ProtectedRoute><VerifyProduct /></ProtectedRoute>} />
                            <Route path="/verify/:id" element={<ProtectedRoute><VerifyProduct /></ProtectedRoute>} />
                            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                            <Route path="*" element={<Navigate to="/" replace />} />
                        </Routes>
                    </main>
                </div>

                <Toaster
                    position="top-right"
                    toastOptions={{
                        duration: 4000,
                        style: {
                            background: '#fff',
                            color: '#363636',
                        },
                        success: {
                            duration: 3000,
                            iconTheme: {
                                primary: '#10b981',
                                secondary: '#fff',
                            },
                        },
                        error: {
                            duration: 5000,
                            iconTheme: {
                                primary: '#ef4444',
                                secondary: '#fff',
                            },
                        },
                    }}
                />
            </BrowserRouter>
        </WalletProvider>
    );
}

export default App;
