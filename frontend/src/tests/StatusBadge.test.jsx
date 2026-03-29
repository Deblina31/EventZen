import { render, screen } from '@testing-library/react';
import StatusBadge from '../components/StatusBadge';
jest.mock("axios");
describe('StatusBadge', () => {
  it('renders confirmed badge with green style', () => {
    render(<StatusBadge status="confirmed" />);
    const badge = screen.getByText('confirmed');
    expect(badge).toHaveClass('badge-success');
  });

  it('renders pending badge with warning style', () => {
    render(<StatusBadge status="pending" />);
    expect(screen.getByText('pending')).toHaveClass('badge-warning');
  });

  it('renders cancelled badge with danger style', () => {
    render(<StatusBadge status="cancelled" />);
    expect(screen.getByText('cancelled')).toHaveClass('badge-danger');
  });

  it('renders dash for null status', () => {
    render(<StatusBadge status={null} />);
    expect(screen.getByText('—')).toBeInTheDocument();
  });
});