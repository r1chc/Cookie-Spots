import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

const UnsubscribePage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [unsubscribeStatus, setUnsubscribeStatus] = useState(null);
  const [reason, setReason] = useState('');
  const [feedback, setFeedback] = useState('');
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);

  useEffect(() => {
    // Get email from URL parameters if available
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [searchParams]);

  const handleUnsubscribe = async (e) => {
    e.preventDefault();
    setUnsubscribeStatus('loading');

    try {
      // Here you would typically make an API call to unsubscribe the user
      // For now, we'll simulate the API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Log the unsubscribe request
      console.log('Unsubscribing email:', email);
      if (reason) {
        console.log('Reason:', reason);
      }
      if (feedback) {
        console.log('Feedback:', feedback);
      }

      setUnsubscribeStatus('success');
      setShowFeedbackForm(false);
    } catch (error) {
      setUnsubscribeStatus('error');
    }
  };

  const handleResubscribe = () => {
    navigate('/about'); // Navigate to the subscription form
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-primary-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Unsubscribe</h1>
          <p className="text-xl max-w-3xl mx-auto">
            We're sorry to see you go. Please let us know how we can improve.
          </p>
        </div>
      </section>

      {/* Unsubscribe Form Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8">
            {unsubscribeStatus === 'success' ? (
              <div className="text-center">
                <div className="mb-6">
                  <svg className="h-16 w-16 text-green-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold mb-4">Successfully Unsubscribed</h2>
                <p className="text-gray-600 mb-8">
                  You have been successfully unsubscribed from our newsletter. 
                  We hope to see you again soon!
                </p>
                <button
                  onClick={handleResubscribe}
                  className="inline-block bg-primary-600 text-white px-6 py-3 rounded-md font-medium hover:bg-primary-700 transition-colors"
                >
                  Resubscribe
                </button>
              </div>
            ) : (
              <form onSubmit={handleUnsubscribe} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Enter your email"
                    required
                  />
                </div>

                {!showFeedbackForm && (
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => setShowFeedbackForm(true)}
                      className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                    >
                      Tell us why you're unsubscribing
                    </button>
                  </div>
                )}

                {showFeedbackForm && (
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">
                        Reason for Unsubscribing
                      </label>
                      <select
                        id="reason"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      >
                        <option value="">Select a reason</option>
                        <option value="too_many_emails">Too many emails</option>
                        <option value="not_relevant">Content not relevant</option>
                        <option value="not_interested">No longer interested</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="feedback" className="block text-sm font-medium text-gray-700 mb-1">
                        Additional Feedback (Optional)
                      </label>
                      <textarea
                        id="feedback"
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        rows="3"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="Help us improve our newsletter"
                      />
                    </div>
                  </div>
                )}

                {/* Status Messages */}
                {unsubscribeStatus === 'error' && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-red-800">
                          Sorry, there was an error processing your request. Please try again.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={unsubscribeStatus === 'loading'}
                  className={`w-full bg-red-600 text-white px-6 py-3 rounded-md font-medium transition-colors ${
                    unsubscribeStatus === 'loading' 
                      ? 'opacity-50 cursor-not-allowed' 
                      : 'hover:bg-red-700'
                  }`}
                >
                  {unsubscribeStatus === 'loading' ? (
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </div>
                  ) : 'Unsubscribe'}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default UnsubscribePage; 