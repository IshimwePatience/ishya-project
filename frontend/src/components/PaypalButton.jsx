import React, { useEffect, useState, useRef } from 'react';
import { Loader2 } from 'lucide-react';

const PaypalButton = ({ amount, onSuccess, type = 'generic' }) => {
  const [sdkReady, setSdkReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const buttonRef = useRef(null);

  useEffect(() => {
    // Avoid double script loading
    const existingScript = document.getElementById('paypal-sdk-script');
    
    const initializeButtons = () => {
      setSdkReady(true);
      setLoading(false);
    };

    if (window.paypal) {
      initializeButtons();
      return;
    }

    if (existingScript) {
      existingScript.addEventListener('load', initializeButtons);
      return;
    }

    // Load PayPal SDK Dynamically
    // Using default sandbox clientId: 'test' which renders sandbox buttons instantly
    const clientId = import.meta.env.VITE_PAYPAL_CLIENT_ID || 'test';
    const script = document.createElement('script');
    script.id = 'paypal-sdk-script';
    script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=USD&disable-funding=card`;
    script.async = true;
    script.addEventListener('load', initializeButtons);
    script.addEventListener('error', () => {
      setError('Failed to load payment processor SDK. Please check your connection.');
      setLoading(false);
    });
    document.body.appendChild(script);

    return () => {
      if (script) {
        script.removeEventListener('load', initializeButtons);
      }
    };
  }, []);

  useEffect(() => {
    if (!sdkReady || !buttonRef.current) return;

    // Clear previous button renderings if any
    buttonRef.current.innerHTML = '';

    window.paypal.Buttons({
      style: {
        layout: 'vertical',
        color: 'gold',
        shape: 'rect',
        label: 'checkout',
        height: 48
      },
      createOrder: (data, actions) => {
        let finalAmount = parseFloat(amount);
        if (type === 'license') {
          // Convert RWF to USD for PayPal processing (exchange rate: 1 USD = 1300 RWF)
          finalAmount = finalAmount / 1300;
        }
        return actions.order.create({
          application_context: {
            shipping_preference: 'NO_SHIPPING'
          },
          purchase_units: [
            {
              description: `Ishya System - ${type.toUpperCase()} Payment`,
              amount: {
                currency_code: 'USD',
                value: finalAmount.toFixed(2)
              }
            }
          ]
        });
      },
      onApprove: async (data, actions) => {
        setLoading(true);
        try {
          const details = await actions.order.capture();
          setLoading(false);
          if (onSuccess) {
            onSuccess(details);
          }
        } catch (err) {
          console.error('Payment capture error:', err);
          setError('Payment succeeded but could not be finalized. Please contact support.');
          setLoading(false);
        }
      },
      onError: (err) => {
        console.error('PayPal button error:', err);
        const errMsg = err?.message || String(err);
        if (errMsg.includes('Detected popup close') || errMsg.includes('popup close')) {
          setLoading(false);
          return;
        }
        setError('An error occurred during the checkout process. Please try again.');
        setLoading(false);
      }
    }).render(buttonRef.current);

  }, [sdkReady, amount, type]);

  return (
    <div className="space-y-4 w-full">
      {loading && (
        <div className="flex flex-col items-center justify-center py-6 space-y-2 text-theme-text-muted">
          <Loader2 className="animate-spin text-theme-accent" size={24} />
          <span className="text-xs font-bold uppercase tracking-wider">Securing Connection...</span>
        </div>
      )}
      
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-sm text-xs text-red-400 text-center font-medium">
          {error}
        </div>
      )}

      <div className={`${loading ? 'hidden' : 'block'} w-full transition-all duration-300 animate-in fade-in duration-500`}>
        <div ref={buttonRef} className="w-full" />
      </div>
    </div>
  );
};

export default PaypalButton;
