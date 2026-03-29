import { useEffect } from 'react';

const BRAND_NAME = 'Velora';

export const usePageTitle = (pageName?: string) => {
  useEffect(() => {
    if (!pageName) {
      // Home page
      document.title = `${BRAND_NAME} - Your Smart E-commerce`;
    } else {
      document.title = `${pageName} - ${BRAND_NAME}`;
    }

    // Cleanup on unmount (optional, but good practice)
    return () => {
      document.title = BRAND_NAME;
    };
  }, [pageName]);
};