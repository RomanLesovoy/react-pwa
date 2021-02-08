import React from 'react';
import registerServiceWorker from './registerServiceWorker';
import { render } from 'react-dom';
import './main.css';

import ReactPwaComponent from './ReactPwaComponent';

render(<ReactPwaComponent />, document.getElementById('root'));

registerServiceWorker();  // Runs register() as default function