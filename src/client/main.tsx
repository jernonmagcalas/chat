import { React, ReactDOM } from 'chen-react';
import { Home } from './components/home';

export const CONTENT = (
  <Home />
);

if (typeof document != 'undefined' && document.getElementById) {
  ReactDOM.render(CONTENT, document.getElementById('chen-react-main'));
}
