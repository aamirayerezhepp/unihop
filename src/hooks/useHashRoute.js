import { createContext, useContext, useEffect, useState } from 'react';

export const RouteContext = createContext('home');
export const useRoute = () => useContext(RouteContext);
export const go = view => { location.hash = view; };

/* Views live in the URL hash (#plan, #grants…), so each one has its own link. */
export function useHashRoute(views){
  const read = () => { const h = location.hash.replace('#', ''); return views.includes(h) ? h : 'home'; };
  const [view, setView] = useState(read);
  useEffect(() => {
    const onChange = () => { setView(read()); window.scrollTo(0, 0); };
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return view;
}
