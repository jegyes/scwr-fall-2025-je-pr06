import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Router from './Router.jsx'
import 'antd/dist/reset.css';
import '@aws-amplify/ui-react/styles.css'
import { BrowserRouter } from 'react-router-dom';
import { Amplify } from 'aws-amplify'
import config from './aws-exports'
import App from './App.jsx';
Amplify.configure(config)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Router />
    </BrowserRouter>
  </StrictMode>
)
