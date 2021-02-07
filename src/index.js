import React from 'react';
import registerServiceWorker from './registerServiceWorker';
import { render } from 'react-dom';

import HelloWorld from './HelloWorld';

render(<HelloWorld />, document.getElementById('root'));

registerServiceWorker();  // Runs register() as default function