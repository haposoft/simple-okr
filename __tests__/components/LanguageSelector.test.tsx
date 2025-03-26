import { render, screen, fireEvent } from '@testing-library/react';
import LanguageSelector from '@/components/LanguageSelector';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
  usePathname: () => '/en/departments',
}));

describe('LanguageSelector', () => {
  it('renders all supported languages', () => {
    render(<LanguageSelector />);
    
    const select = screen.getByRole('combobox');
    expect(select).toBeInTheDocument();
    
    // Check if all languages are present
    expect(screen.getByText('English')).toBeInTheDocument();
    expect(screen.getByText('Tiếng Việt')).toBeInTheDocument();
    expect(screen.getByText('日本語')).toBeInTheDocument();
    expect(screen.getByText('Deutsch')).toBeInTheDocument();
  });

  it('sets the current language as selected', () => {
    render(<LanguageSelector />);
    
    const select = screen.getByRole('combobox');
    expect(select).toHaveValue('en');
  });

  it('calls router.push with correct path when language is changed', () => {
    const mockPush = jest.fn();
    jest.spyOn(require('next/navigation'), 'useRouter').mockImplementation(() => ({
      push: mockPush,
    }));

    render(<LanguageSelector />);
    
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'vi' } });
    
    expect(mockPush).toHaveBeenCalledWith('/vi/departments');
  });

  it('renders with correct styling classes', () => {
    render(<LanguageSelector />);
    
    // Check main container
    expect(screen.getByRole('combobox').parentElement).toHaveClass('relative');
    
    // Check select element
    const select = screen.getByRole('combobox');
    expect(select).toHaveClass(
      'appearance-none',
      'bg-white',
      'border',
      'border-gray-300',
      'rounded-md',
      'px-3',
      'py-2',
      'pr-8',
      'text-sm',
      'font-medium',
      'focus:outline-none',
      'focus:ring-2',
      'focus:ring-blue-500'
    );
    
    // Check dropdown icon container
    expect(screen.getByRole('combobox').nextElementSibling).toHaveClass(
      'pointer-events-none',
      'absolute',
      'inset-y-0',
      'right-0',
      'flex',
      'items-center',
      'px-2',
      'text-gray-700'
    );
  });
}); 