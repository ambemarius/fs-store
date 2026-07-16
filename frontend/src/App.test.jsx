import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, test, expect, vi } from 'vitest';
import App from './App';

vi.mock('./api', () => ({
  getProducts: vi.fn().mockResolvedValue([]),
  createProduct: vi.fn(),
  toggleAvailability: vi.fn(),
  registerUser: vi.fn(),
  loginUser: vi.fn(),
  getCurrentUser: vi.fn().mockResolvedValue({ user: null }),
  logoutUser: vi.fn(),
  createOrder: vi.fn(),
  getMyOrders: vi.fn().mockResolvedValue([]),
  getAllOrders: vi.fn().mockResolvedValue([]),
  updateOrderStatus: vi.fn(),
}));

describe('Frontend App Component', () => {
  test('renders the application header and elements without act warnings', async () => {
    render(<App />);

    // Wait for async state updates to finish and assert on elements
    await waitFor(() => {
      const logoElements = screen.getAllByText((content, element) => {
        return element.textContent.toLowerCase().includes('store');
      });
      expect(logoElements.length).toBeGreaterThan(0);
    });
  });
});
