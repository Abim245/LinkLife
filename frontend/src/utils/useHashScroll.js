import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Scrolls to the section named in the URL (#approvals, #declare-form, ...)
export function useHashScroll() {
  const { hash } = useLocation();
  useEffect(() => {
    if (!hash) return;
    const timer = setTimeout(() => {
      document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth' });
    }, 50);
    return () => clearTimeout(timer);
  }, [hash]);
}