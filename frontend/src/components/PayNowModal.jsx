import React, { useState, useEffect, useContext } from 'react';
import { AuthContext, api } from '../context/AuthContext';
import { X, CreditCard, DollarSign } from 'lucide-react';

const PayNowModal = ({ isOpen, onClose, categories, onSuccess }) => {
  const { user } = useContext(AuthContext);
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Set default category when modal opens or categories load
  useEffect(() => {
    if (categories && categories.length > 0) {
      setCategory(categories[0].name);
    } else {
      setCategory('Food'); // Fallback if no categories
    }
    setAmount('');
  }, [isOpen, categories]);

  if (!isOpen) return null;

  // Helper to load Razorpay checkout script dynamically
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async (e) => {
    e.preventDefault();

    if (!amount || !category) {
      alert('Please enter amount and select a category.');
      return;
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      alert('Amount must be a positive number.');
      return;
    }

    try {
      setIsProcessing(true);

      // 1. Create order on backend
      const orderRes = await api.post('/api/payments/order', { amount: parsedAmount });
      const order = orderRes.data;

      // 2. Fetch Razorpay Key ID from backend
      const keyRes = await api.get('/api/payments/key');
      const key = keyRes.data.key;

      // 3. Handle Sandbox Mock Mode
      if (order.id && order.id.startsWith('order_mock_')) {
        setIsProcessing(false);
        const confirmPayment = window.confirm(
          `[Sandbox Sandbox Mode] Simulate payment of ₹${parsedAmount} for "${category}"?`
        );
        
        if (confirmPayment) {
          setIsProcessing(true);
          const mockPaymentId = `pay_mock_${Math.random().toString(36).substr(2, 9)}`;
          const verifyRes = await api.post('/api/payments/verify', {
            razorpay_order_id: order.id,
            razorpay_payment_id: mockPaymentId,
            razorpay_signature: 'mock_signature_data_123',
            amount: parsedAmount,
            category,
          });

          if (verifyRes.data.success) {
            onSuccess(`[Mock Success] Payment of ₹${parsedAmount} successful!`);
            onClose();
          } else {
            alert('Mock payment verification failed.');
          }
        }
        setIsProcessing(false);
        return;
      }

      // 4. Handle live/test Razorpay payment using script SDK
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        alert('Failed to load Razorpay SDK. Please check your internet connection.');
        setIsProcessing(false);
        return;
      }

      const options = {
        key: key,
        amount: order.amount,
        currency: order.currency,
        name: 'MoneyMesh',
        description: `Add transaction for ${category}`,
        order_id: order.id,
        handler: async function (response) {
          try {
            setIsProcessing(true);
            const verifyRes = await api.post('/api/payments/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              amount: parsedAmount,
              category,
            });

            if (verifyRes.data.success) {
              onSuccess(`Payment of ₹${parsedAmount} successful! Payment ID: ${response.razorpay_payment_id}`);
              onClose();
            } else {
              alert('Payment signature verification failed.');
            }
          } catch (err) {
            console.error('Signature verification error', err);
            alert(err.response?.data?.message || 'Payment verification failed.');
          } finally {
            setIsProcessing(false);
          }
        },
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
        },
        theme: {
          color: '#4f46e5', // Indigo-600
        },
        modal: {
          ondismiss: function () {
            setIsProcessing(false);
          },
        },
      };

      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.open();
    } catch (err) {
      console.error('Payment initiation failed', err);
      alert(err.response?.data?.message || 'Failed to initiate payment.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl animate-in fade-in zoom-in duration-250">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-indigo-500" />
            <span>Pay Now via Razorpay</span>
          </h3>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handlePayment} className="p-6 space-y-5">
          {/* Amount */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Payment Amount (₹)
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <span className="font-semibold text-sm">₹</span>
              </span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full pl-8 pr-4 py-2.5 rounded-xl border bg-white dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
                disabled={isProcessing}
                required
              />
            </div>
          </div>

          {/* Category */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Budget Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border bg-white dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white transition duration-200"
              disabled={isProcessing}
            >
              {categories.map((cat) => (
                <option key={cat._id || cat.name} value={cat.name} className="text-slate-900 dark:text-slate-200 bg-white dark:bg-slate-900">
                  {cat.name}
                </option>
              ))}
            </select>
            <p className="text-[10px] text-slate-400 mt-1">
              Successful payments will deduct from this category's remaining budget.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isProcessing}
              className="px-4 py-2 text-sm font-medium rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isProcessing}
              className="px-5 py-2.5 text-sm font-semibold rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white hover:from-indigo-700 hover:to-blue-700 shadow-md focus:ring-2 focus:ring-indigo-500 flex items-center justify-center gap-2 disabled:opacity-70 transition duration-200"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4" />
                  <span>Proceed to Pay</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PayNowModal;
