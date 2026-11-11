import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './app/App';
import './theme/global.css';

const bootstrap = async () => {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
};

void bootstrap();
