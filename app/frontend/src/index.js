import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';


const stripePromise = loadStripe("pk_test_51R5sQXQ6maWQgjdoiY9TdXJfpAjwgXyE2ntuPLYTop3V9Hr8bn8Bq0LfidLDn0yGze38czlIIIrn8pei4Seuq1cc00yVtuCwk4");

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Elements stripe={stripePromise}>
      <App />
    </Elements>
  </React.StrictMode>
);
