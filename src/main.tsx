/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { papers } from './content/loader';

// Phase 2 dev-only verification hook: confirms the zod-validated papers/*.json
// registry loads correctly. App.tsx still renders from src/paperData.ts until
// Phase 3 rewires rendering onto this registry (see tasks/todo.md).
if (import.meta.env.DEV) {
  console.info('[paperViz] papers loaded:', Object.keys(papers));
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);