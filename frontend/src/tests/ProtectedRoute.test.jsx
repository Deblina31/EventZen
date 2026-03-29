import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';
import { AuthContext } from '../context/AuthContext';
jest.mock("axios");
const renderWithAuth = (role, path = '/dashboard') => {
  return render(
    <AuthContext.Provider value={{ role, token: role ? 'token' : null, username: 'test' }}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/login" element={<div>Login Page</div>} />
          <Route path="/unauthorized" element={<div>Unauthorized</div>} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute roles={['VENDOR']}>
                <div>Vendor Dashboard</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>
  );
};

describe('ProtectedRoute', () => {

  it('✅ renders children when role matches', () => {
    renderWithAuth('VENDOR');
    expect(screen.getByText('Vendor Dashboard')).toBeInTheDocument();
  });

  it('❌ redirects to /login when not authenticated', () => {
    renderWithAuth(null);
    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });

  it('❌ redirects to /unauthorized when wrong role', () => {
    renderWithAuth('USER');
    expect(screen.getByText('Unauthorized')).toBeInTheDocument();
  });
});