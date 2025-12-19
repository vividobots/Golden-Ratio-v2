import { useFormik } from 'formik';
import { motion } from "framer-motion"; // Animation
import request, { gql } from 'graphql-request';
import { Eye, EyeOff, Lock, LogIn, Mail } from "lucide-react"; // Icons
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import * as Yup from 'yup';
import BASEURL from "./URLs/BaseURL";

// Validation Schema
const loginSchema = Yup.object().shape({
  email: Yup.string()
    .email('Invalid email format')
    .required('Email is required'),
  password: Yup.string()
    .required('Password is required'),
});

// GraphQL Mutation
const LOGIN = gql`
  mutation Login($email: String!, $password: String!) {
    tokenAuth(email: $email, password: $password) {
      success
      errors
      token
      user {
        id
        username    
        isActive
      }
    }
  }
`;

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // Toggle Password visibility
  const navigate = useNavigate();

  useEffect(() => {
    const loggedInUser = localStorage.getItem('goldenratio');
    if (loggedInUser) {
      navigate('/home');
    }
  }, [navigate]);

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: loginSchema,
    onSubmit: async (values, { setStatus, setSubmitting }) => {
      setLoading(true);
      try {
        const response: any = await request(BASEURL, LOGIN, {
          email: values.email,
          password: values.password,
        });

        if (response.tokenAuth.success) {
          localStorage.setItem('goldenratio', JSON.stringify(response));
          localStorage.setItem('userId', response.tokenAuth.user.id);
          localStorage.setItem('username', response.tokenAuth.user.username);
          navigate('/home');
        } else {
          setStatus('Invalid login credentials');
          setSubmitting(false);
        }
      } catch (error) {
        console.error('Login error:', error);
        setStatus('Login failed. Please try again.');
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-cover bg-center overflow-hidden" 
         style={{ backgroundImage: `url('assets/make-up.jpg')` }}>
      
      {/* Dark Overlay for better text readability */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"></div>

      <div className="relative w-full max-w-6xl flex flex-col md:flex-row items-center justify-around p-4 z-10">
        
        {/* Left Side: Branding (Animated) */}
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center md:text-left mb-10 md:mb-0"
        >
          <h1 className="flex flex-col md:block">
            <span className="font-serif text-6xl md:text-8xl text-blue-500 font-bold drop-shadow-lg">Aureus</span>
            <span className="font-serif text-6xl md:text-8xl text-yellow-500 font-bold drop-shadow-lg md:ml-4">Lens</span>
          </h1>
          <div className="flex items-center justify-center md:justify-start mt-2">
            <span className="text-white/80 font-medium text-lg md:text-2xl mr-2 tracking-widest">POWERED BY</span>
            <span className="font-bold text-xl md:text-3xl text-white tracking-wider">VIVIDOBOTS</span>
          </div>
          <p className="mt-4 text-gray-300 text-sm md:text-lg max-w-md hidden md:block">
            Discover the perfect symmetry. Unlock the golden ratio of beauty with AI-powered analysis.
          </p>
        </motion.div>

        {/* Right Side: Glassmorphism Login Card */}
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="w-full max-w-md bg-white/10 border border-white/20 rounded-2xl p-8 shadow-2xl backdrop-blur-md"
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">Welcome Back</h2>
            <p className="text-gray-300 text-sm">Please sign in to continue</p>
          </div>

          <form onSubmit={formik.handleSubmit} className="space-y-6">
            
            {/* Email Field with Icon */}
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-blue-400 transition-colors" />
              </div>
              <input
                type="email"
                id="email"
                className="block w-full pl-10 pr-3 py-3 bg-black/20 border border-gray-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                placeholder="Email Address"
                {...formik.getFieldProps('email')}
              />
              {formik.touched.email && formik.errors.email && (
                <span className="text-red-400 text-xs absolute -bottom-5 left-0">{formik.errors.email}</span>
              )}
            </div>

            {/* Password Field with Icon & Toggle */}
            <div className="relative group mt-6">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-yellow-400 transition-colors" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                className="block w-full pl-10 pr-10 py-3 bg-black/20 border border-gray-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-all"
                placeholder="Password"
                {...formik.getFieldProps('password')}
              />
              {/* Eye Icon Toggle */}
              <div 
                className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer text-gray-400 hover:text-white"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </div>

              {formik.touched.password && formik.errors.password && (
                <span className="text-red-400 text-xs absolute -bottom-5 left-0">{formik.errors.password}</span>
              )}
            </div>

            {/* Error Message */}
            {formik.status && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="bg-red-500/20 border border-red-500/50 rounded p-2 text-center"
              >
                <span className="text-red-200 text-sm font-medium">{formik.status}</span>
              </motion.div>
            )}

            {/* Actions */}
            <div className="flex justify-end">
              <Link to='/forgot_password' className="text-sm text-blue-300 hover:text-white transition-colors">
                Forgot Password?
              </Link>
            </div>

            {/* Login Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`w-full py-3 px-4 rounded-lg font-bold text-white shadow-lg flex justify-center items-center gap-2
                ${loading 
                  ? "bg-gray-600 cursor-not-allowed" 
                  : "bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600"
                } transition-all duration-300`}
              type="submit"
              disabled={loading || !formik.isValid || formik.isSubmitting}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <LogIn className="w-5 h-5" /> Login
                </>
              )}
            </motion.button>

            {/* Divider */}
            <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-gray-600"></div>
                <span className="flex-shrink mx-4 text-gray-400 text-xs">OR</span>
                <div className="flex-grow border-t border-gray-600"></div>
            </div>

            {/* Register Link */}
            <div className="text-center">
              <p className="text-gray-300 text-sm">
                Don't have an account?{' '}
                <Link className="text-yellow-400 font-bold hover:text-yellow-300 underline-offset-4 hover:underline transition-all" to='/register'>
                  Sign Up
                </Link>
              </p>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;