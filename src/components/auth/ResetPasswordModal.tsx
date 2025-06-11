import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface ResetPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ResetPasswordModal: React.FC<ResetPasswordModalProps> = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const { resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus(null);

    const { success, error } = await resetPassword(email);
    
    setIsLoading(false);
    if (success) {
      setStatus({ 
        type: 'success', 
        message: 'Check your email for password reset instructions.' 
      });
      setTimeout(onClose, 3000);
    } else {
      setStatus({ 
        type: 'error', 
        message: error || 'Failed to send reset instructions.' 
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Reset Password</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
            title="Close"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {status && (
            <div className={`p-3 rounded-md ${
              status.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {status.message}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full bg-indigo-600 text-white py-2 px-4 rounded-md font-medium
              ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-indigo-700'}
              transition-colors`}
          >
            {isLoading ? 'Sending Instructions...' : 'Send Reset Instructions'}
          </button>
        </form>

        <p className="mt-4 text-sm text-gray-600 text-center">
          Remember your password?{' '}
          <button 
            onClick={onClose}
            className="text-indigo-600 hover:text-indigo-800 font-medium"
          >
            Back to Login
          </button>
        </p>
      </div>
    </div>
  );
};

export default ResetPasswordModal;