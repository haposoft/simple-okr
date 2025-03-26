import { renderHook, act } from '@testing-library/react';
import { useLanguage } from '@/hooks/useLanguage';

// Mock react-i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    i18n: {
      language: 'en',
      changeLanguage: jest.fn(),
    },
  }),
}));

describe('useLanguage', () => {
  it('should initialize with default language (en)', () => {
    const { result } = renderHook(() => useLanguage());
    expect(result.current.currentLanguage).toBe('en');
  });

  it('should change language when changeLanguage is called', () => {
    const mockChangeLanguage = jest.fn();
    jest.spyOn(require('react-i18next'), 'useTranslation').mockImplementation(() => ({
      i18n: {
        language: 'en',
        changeLanguage: mockChangeLanguage,
      },
    }));

    const { result } = renderHook(() => useLanguage());

    act(() => {
      result.current.changeLanguage('vi');
    });

    expect(mockChangeLanguage).toHaveBeenCalledWith('vi');
  });

  it('should have all supported languages', () => {
    const { result } = renderHook(() => useLanguage());
    expect(result.current.languages).toHaveLength(4);
    expect(result.current.languages).toEqual(
      expect.arrayContaining([
        { code: 'en', name: 'English' },
        { code: 'vi', name: 'Tiếng Việt' },
        { code: 'ja', name: '日本語' },
        { code: 'de', name: 'Deutsch' },
      ])
    );
  });
}); 