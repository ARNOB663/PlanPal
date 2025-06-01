import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, MapPin, Calendar, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      const { success, error } = await login(email, password);
      
      if (success) {
        navigate('/');
      } else {
        setError(error || 'Invalid email or password. For demo, try any email from mock data.');
      }
    } catch (err) {
      setError('An error occurred during login.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Left Panel - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6">
        <div className="max-w-md w-full">
          <div className="text-center mb-10">
            <Link to="/" className="text-2xl font-bold inline-flex items-center">
              <span className="text-indigo-600">Meet</span>
              <span className="text-gray-800">Buddy</span>
            </Link>
            <h1 className="text-2xl font-bold text-gray-800 mt-6">Welcome Back</h1>
            <p className="text-gray-600 mt-2">Sign in to continue to your account</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 bg-red-100 border border-red-200 text-red-700 rounded-md">
                {error}
              </div>
            )}
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Mail size={18} className="text-gray-500" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="Your email address"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <a href="#" className="text-sm text-indigo-600 hover:text-indigo-800">
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Lock size={18} className="text-gray-500" />
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Your password"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
            
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </button>
            </div>
          </form>
          
          <div className="text-center mt-8">
            <p className="text-gray-600">
              Don't have an account? {' '}
              <Link to="/signup" className="text-indigo-600 font-medium hover:text-indigo-800">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
      
      {/* Right Panel - Image/Info */}
      <div className="hidden lg:block lg:w-1/2 bg-indigo-600 relative">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="flex items-center justify-center h-full relative z-10">
          <div className="text-center max-w-lg px-6">
            <h2 className="text-3xl font-bold text-white mb-6">Find Your Perfect Adventure Companions</h2>
            <p className="text-xl text-indigo-100 mb-8">
              Join thousands of users connecting for events, trips, and activities.
            </p>
            <div className="flex justify-center space-x-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-white text-center">
                <p className="text-3xl font-bold">500+</p>
                <p className="text-sm">Events Created</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-white text-center">
                <p className="text-3xl font-bold">2,000+</p>
                <p className="text-sm">Active Users</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-white text-center">
                <p className="text-3xl font-bold">15+</p>
                <p className="text-sm">Cities</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const SignupPage: React.FC = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    gender: 'female',
    age: 25,
    location: '',
    bio: '',
    interests: [] as string[]
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { signup } = useAuth();
  const navigate = useNavigate();
  
  const availableInterests = [
    'travel', 'food', 'music', 'sports', 'hiking', 
    'photography', 'art', 'reading', 'movies', 'technology',
    'cooking', 'yoga', 'dancing', 'cycling', 'swimming'
  ];
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleInterestToggle = (interest: string) => {
    setFormData(prev => {
      const interests = [...prev.interests];
      
      if (interests.includes(interest)) {
        return { ...prev, interests: interests.filter(i => i !== interest) };
      } else {
        return { ...prev, interests: [...interests, interest] };
      }
    });
  };
  
  const nextStep = () => {
    if (step === 1) {
      if (!formData.name || !formData.email || !formData.password) {
        setError('Please fill all required fields');
        return;
      }
      
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return;
      }

      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters long');
        return;
      }
    }
    
    setError('');
    setStep(step + 1);
  };
  
  const prevStep = () => {
    setStep(step - 1);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      // Only include fields that exist in the database schema
      const userData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        gender: formData.gender as 'male' | 'female' | 'other',
        age: formData.age,
        bio: formData.bio,
        location: formData.location,
        interests: formData.interests
      };
      
      const { success, error: signupError } = await signup(userData);
      
      if (success) {
        navigate('/');
      } else {
        setError(signupError || 'Failed to create account. Please try again.');
      }
    } catch (err) {
      setError('An error occurred during signup.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Left Panel - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6">
        <div className="max-w-md w-full">
          <div className="text-center mb-10">
            <Link to="/" className="text-2xl font-bold inline-flex items-center">
              <span className="text-indigo-600">Meet</span>
              <span className="text-gray-800">Buddy</span>
            </Link>
            <h1 className="text-2xl font-bold text-gray-800 mt-6">Create Your Account</h1>
            <p className="text-gray-600 mt-2">Join our community and start connecting</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 bg-red-100 border border-red-200 text-red-700 rounded-md">
                {error}
              </div>
            )}
            
            {/* Step 1: Basic Information */}
            {step === 1 && (
              <>
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name*
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <User size={18} className="text-gray-500" />
                    </div>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder="Your full name"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address*
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <Mail size={18} className="text-gray-500" />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="Your email address"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    Password* (minimum 6 characters)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <Lock size={18} className="text-gray-500" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      placeholder="Create a password"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm Password*
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <Lock size={18} className="text-gray-500" />
                    </div>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                      placeholder="Confirm your password"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>
              </>
            )}
            
            {/* Step 2: Profile Information */}
            {step === 2 && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
                      Gender
                    </label>
                    <select
                      id="gender"
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      className="w-full py-3 px-4 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="female">Female</option>
                      <option value="male">Male</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-1">
                      Age
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <Calendar size={18} className="text-gray-500" />
                      </div>
                      <input
                        id="age"
                        name="age"
                        type="number"
                        min="18"
                        max="100"
                        value={formData.age}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <MapPin size={18} className="text-gray-500" />
                    </div>
                    <input
                      id="location"
                      name="location"
                      type="text"
                      value={formData.location}
                      onChange={handleChange}
                      placeholder="Your city or location"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
                    Bio
                  </label>
                  <textarea
                    id="bio"
                    name="bio"
                    rows={3}
                    value={formData.bio}
                    onChange={handleChange}
                    placeholder="Tell us a bit about yourself"
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </>
            )}
            
            {/* Step 3: Interests */}
            {step === 3 && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Select your interests (choose at least 3)
                  </label>
                  
                  <div className="grid grid-cols-3 gap-3">
                    {availableInterests.map(interest => (
                      <button
                        key={interest}
                        type="button"
                        onClick={() => handleInterestToggle(interest)}
                        className={`text-sm py-2 px-3 rounded-full border ${
                          formData.interests.includes(interest)
                            ? 'bg-indigo-100 border-indigo-300 text-indigo-800'
                            : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {interest}
                      </button>
                    ))}
                  </div>
                  
                  <p className="mt-3 text-sm text-gray-500">
                    Selected: {formData.interests.length} / 3 minimum
                  </p>
                </div>
                
                <div className="pt-4">
                  <p className="text-sm text-gray-600 mb-6">
                    By creating an account, you agree to our Terms of Service and Privacy Policy.
                  </p>
                </div>
              </>
            )}
            
            <div className="flex justify-between">
              {step > 1 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="py-3 px-4 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-md transition-colors"
                >
                  Back
                </button>
              )}
              
              {step < 3 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="ml-auto py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-md shadow-sm transition-colors flex items-center"
                >
                  Next
                  <ArrowRight size={16} className="ml-2" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isLoading || formData.interests.length < 3}
                  className={`ml-auto py-3 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-md shadow-sm transition-colors ${(isLoading || formData.interests.length < 3) ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {isLoading ? 'Creating Account...' : 'Create Account'}
                </button>
              )}
            </div>
          </form>
          
          <div className="text-center mt-8">
            <p className="text-gray-600">
              Already have an account? {' '}
              <Link to="/login" className="text-indigo-600 font-medium hover:text-indigo-800">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
      
      {/* Right Panel - Image/Info */}
      <div className="hidden lg:block lg:w-1/2 bg-gradient-to-br from-indigo-600 to-indigo-800 relative">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="flex items-center justify-center h-full relative z-10">
          <div className="text-center max-w-lg px-6">
            <h2 className="text-3xl font-bold text-white mb-6">Join Our Community</h2>
            <p className="text-xl text-indigo-100 mb-8">
              Create memories with new friends who share your interests and passions.
            </p>
            
            <div className="space-y-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-white text-left">
                <h3 className="font-semibold mb-2">Find Your People</h3>
                <p>Connect with others who share your interests for events, trips, and activities.</p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-white text-left">
                <h3 className="font-semibold mb-2">Never Miss Out</h3>
                <p>Don't let not having a companion stop you from attending events you love.</p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-white text-left">
                <h3 className="font-semibold mb-2">Stay Safe</h3>
                <p>Our platform prioritizes safety with verified profiles and group meetups.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};