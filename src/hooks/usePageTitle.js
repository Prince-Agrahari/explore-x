import { useEffect } from 'react';

const DEFAULT_TITLE = 'Explore X — Your AI Travel Planner';

export const usePageTitle = (title) => {
  useEffect(() => {
    document.title = title ? `${title} · Explore X` : DEFAULT_TITLE;
    return () => {
      document.title = DEFAULT_TITLE;
    };
  }, [title]);
};
