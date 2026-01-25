import React from 'react';
import { Navigate } from 'react-router-dom';
import { useWallet } from '../context/WalletContext';

const ProtectedRoute = ({ children }) => {
    const { wallet } = useWallet();

    if (!wallet.isConnected) {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoute;
