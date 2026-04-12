/**
 * 📧 EMAIL CAPTURE FORM
 * Component for newsletter subscription
 */

'use client';

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";

interface EmailCaptureFormProps {
  className?: string;
  onSuccess?: () => void;
}

const EmailCaptureForm: React.FC<EmailCaptureFormProps> = ({ className = '', onSuccess }) => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setStatus('error');
      setErrorMessage('Please enter your email address');
      return;
    }

    try {
      setStatus('loading');
      
      // In a real implementation, this would call an API endpoint
      // await axios.post('/api/newsletter/subscribe', { email });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setStatus('success');
      setEmail('');
      if (onSuccess) onSuccess();
    } catch (error) {
      setStatus('error');
      setErrorMessage('Failed to subscribe. Please try again later.');
      console.error('Newsletter subscription error:', error);
    }
  };

  return (
    <div className={className}>
      {status === 'success' ? (
        <div className="text-green-500 p-2 rounded bg-green-100/10 text-center">
          Thanks for subscribing! We'll keep you updated.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="px-4 py-2 rounded bg-gray-800 border border-gray-700 flex-grow"
            disabled={status === 'loading'}
          />
          <Button 
            type="submit" 
            disabled={status === 'loading'}
            className="whitespace-nowrap"
          >
            {status === 'loading' ? 'Subscribing...' : 'Subscribe'}
          </Button>
          
          {status === 'error' && (
            <div className="text-red-500 text-sm mt-1">{errorMessage}</div>
          )}
        </form>
      )}
    </div>
  );
};

export default EmailCaptureForm;
