import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import Login from '../pages/auth/Login';
import * as authService from '../services/authService';

jest.mock('../services/authService');

const renderLogin = () => render(
  <MemoryRouter>
    <AuthProvider>
      <Login />
    </AuthProvider>
  </MemoryRouter>
);

describe('Login Page', () => {

  it('renders login form elements', () => {
    renderLogin();
    expect(screen.getByPlaceholderText(/username/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('shows validation errors on empty submit', async () => {
    renderLogin();
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText(/username is required/i)).toBeInTheDocument();
    });
  });

  it('calls loginUser on valid submit', async () => {
    authService.loginUser.mockResolvedValue({
      data: {
        token: 'eyJhbGciOiJIUzI1NiJ9.' +
          btoa(JSON.stringify({ role: 'USER', sub: 'testuser', userId: 1 })) +
          '.sig',
        role: 'USER'
      }
    });

    renderLogin();
    await userEvent.type(screen.getByPlaceholderText(/username/i), 'testuser');
    await userEvent.type(screen.getByPlaceholderText(/password/i), 'pass1234');
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(authService.loginUser).toHaveBeenCalledWith({
        username: 'testuser',
        password: 'pass1234'
      });
    });
  });

  it('shows error toast on wrong credentials', async () => {
    authService.loginUser.mockRejectedValue({
      response: { data: { error: 'Invalid username or password' } }
    });

    renderLogin();
    await userEvent.type(screen.getByPlaceholderText(/username/i), 'wronguser');
    await userEvent.type(screen.getByPlaceholderText(/password/i), 'wrong');
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(authService.loginUser).toHaveBeenCalled();
    });
  });
});