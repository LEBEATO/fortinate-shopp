
import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './AuthContext';
import { Layout } from './Layout';
import { CatalogPage } from './CatalogPage';
import { MyItemsPage } from './MyItemsPage';
import { CosmeticDetail } from './CosmeticDetail';
import { UsersDirectory } from './UsersDirectory';
import { UserProfile } from './UserProfile';
import { AuthPage } from './AuthPage';

const App = () => {
  return (
    <HashRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<CatalogPage />} />
            <Route path="my-items" element={<MyItemsPage />} />
            <Route path="cosmetic/:id" element={<CosmeticDetail />} />
            <Route path="users" element={<UsersDirectory />} />
            <Route path="profile" element={<UserProfile />} />
            <Route path="login" element={<AuthPage type="login" />} />
            <Route path="register" element={<AuthPage type="register" />} />
          </Route>
        </Routes>
      </AuthProvider>
    </HashRouter>
  );
};

export default App;
