import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import App from '../App';

describe('App', () => {
  it('renders without crashing', () => {
    render(<App />);
    expect(screen.getByText(/FoodDealSniper/i)).toBeDefined();
  });

  it('displays the main heading', () => {
    render(<App />);
    const heading = screen.getByText(/FoodDealSniper/i);
    expect(heading).toBeDefined();
  });
});
