import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useThemeSettings } from '../hooks/useThemeSettings';

const PageTitleUpdater = () => {
  const { siteName } = useThemeSettings();
  const location = useLocation();

  useEffect(() => {
    // Update document title based on current page
    if (siteName) {
      const pathSegments = location.pathname.split('/').filter(Boolean);
      let pageTitle = siteName;

      if (pathSegments.length > 0) {
        const currentPage = pathSegments[pathSegments.length - 1];
        const formattedPage = currentPage
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
        
        if (pathSegments.includes('admin')) {
          pageTitle = `${formattedPage} - ${siteName} Admin`;
        } else {
          pageTitle = `${formattedPage} - ${siteName}`;
        }
      }

      document.title = pageTitle;
    }
  }, [siteName, location.pathname]);

  return null; // This component doesn't render anything
};

export default PageTitleUpdater;

