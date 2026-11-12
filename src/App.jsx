import { RouteContext, useHashRoute } from './hooks/useHashRoute.js';
import Home from './views/Home.jsx';
import TestView from './views/TestView.jsx';
import Result from './views/Result.jsx';
import Plan from './views/Plan.jsx';
import List from './views/List.jsx';
import Docs from './views/Docs.jsx';
import Grants from './views/Grants.jsx';
import Care from './views/Care.jsx';
import Chat from './views/Chat.jsx';
import Letter from './views/Letter.jsx';
import Alerts from './views/Alerts.jsx';

/* home = landing before the test, personal account after it. */
const VIEWS = {home:Home, test:TestView, result:Result, plan:Plan, list:List, docs:Docs, grants:Grants, care:Care, koyan:Chat, letter:Letter, alerts:Alerts};
const NAMES = Object.keys(VIEWS);

export default function App(){
  const view = useHashRoute(NAMES);
  const View = VIEWS[view];
  return <RouteContext.Provider value={view}><View /></RouteContext.Provider>;
}
