import { useFormik } from "formik";
import { motion } from "framer-motion"; // Animation
import request, { gql } from "graphql-request";
import { ArrowRight, Eye, EyeOff, Lock, Mail, User, UserPlus } from "lucide-react"; // Icons
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import * as Yup from "yup";
import BASEURL from "./URLs/BaseURL";

// Yup validation schema
const registerSchema = Yup.object().shape({
  email: Yup.string().email("Invalid email address").required("Email is required"),
  username: Yup.string().min(3, "Must be at least 3 characters").required("Username is required"),
  password: Yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
  confirmPassword: Yup.string().oneOf([Yup.ref("password")], "Passwords must match").required("Confirm password is required"),
});

// GraphQL signup mutation
const SIGNUP = gql`
  mutation register($email: String!, $password1: String!, $password2: String!, $username: String!) {
    register(email: $email, password1: $password1, password2: $password2, username: $username) {
      errors
      success
    }
  }
`;

const Register = () => {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: {
      email: "",
      username: "",
      password: "",
      confirmPassword: "",
    },
    validationSchema: registerSchema,
    onSubmit: async (values, { setStatus, setSubmitting }) => {
      setLoading(true);
      setStatus(null);
      try {
        const response: any = await request(BASEURL, SIGNUP, {
          email: values.email,
          password1: values.password,
          password2: values.confirmPassword,
          username: values.username,
        });

        if (response.register.success) {
          navigate("/login");
        } else {
          let errorMsg = "Registration failed. Please try again.";
          const errors = response.register.errors;

          if (errors) {
            // Helper function to extract text from error item
            const extractText = (err: any) => {
              if (typeof err === "string") return err;
              // If it's an object like { message: "Error text" }, return the message
              if (typeof err === "object" && err !== null && err.message) return err.message;
              // Fallback
              return JSON.stringify(err);
            };

            if (typeof errors === "string") {
              errorMsg = errors;
            } else if (Array.isArray(errors)) {
              errorMsg = errors.map(extractText).join(", ");
            } else if (typeof errors === "object") {
              const errorValues = Object.values(errors).flat();
              errorMsg = errorValues.join(", ");
            }
          }
            // ? (Array.isArray(response.register.errors) ? response.register.errors.join(", ") : response.register.errors)
            // : "Registration failed. Please try again.";
          setStatus(errorMsg);
        }
      } catch (error) {
        console.error("Signup error:", error);
        setStatus("An error occurred. Please check your connection.");
      } finally {
        setLoading(false);
        setSubmitting(false);
      }
    },
  });

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-cover bg-center overflow-y-auto py-10 px-4" 
         style={{ backgroundImage: `url('assets/make-up.jpg')` }}>
      
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] fixed"></div>

      <div className="relative w-full max-w-6xl flex flex-col md:flex-row items-center justify-around z-10">
        
        {/* Left Side: Branding (Consistent with Login) */}
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center md:text-left mb-10 md:mb-0 hidden md:block"
        >
          <h1 className="flex flex-col md:block">
            <span className="font-serif text-6xl md:text-8xl text-blue-500 font-bold drop-shadow-lg">Aureus</span>
            <span className="font-serif text-6xl md:text-8xl text-yellow-500 font-bold drop-shadow-lg md:ml-4">Lens</span>
          </h1>
          <p className="mt-4 text-gray-200 text-lg max-w-md font-light leading-relaxed">
            Join the community. Experience the intersection of technology and aesthetics.
          </p>
        </motion.div>

        {/* Right Side: Glassmorphism Register Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md bg-white/10 border border-white/20 rounded-2xl p-6 md:p-8 shadow-2xl backdrop-blur-md"
        >
          {/* Mobile Branding (Only visible on small screens) */}
          <div className="md:hidden text-center mb-6">
             <span className="font-serif text-4xl text-blue-500 font-bold">Aureus</span>
             <span className="font-serif text-4xl text-yellow-500 font-bold ml-2">Lens</span>
          </div>

          <div className="text-center mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Create Account</h2>
            <p className="text-gray-300 text-sm">Fill in the details to get started</p>
          </div>

          <form onSubmit={formik.handleSubmit} className="space-y-5">
            
            {/* Username Field */}
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400 group-focus-within:text-yellow-400 transition-colors" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-3 bg-black/20 border border-gray-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-all"
                placeholder="Username"
                {...formik.getFieldProps("username")}
              />
              {formik.touched.username && formik.errors.username && (
                <span className="text-red-400 text-xs absolute -bottom-5 left-0">{formik.errors.username}</span>
              )}
            </div>

            {/* Email Field */}
            <div className="relative group mt-6">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-blue-400 transition-colors" />
              </div>
              <input
                type="email"
                className="block w-full pl-10 pr-3 py-3 bg-black/20 border border-gray-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                placeholder="Email Address"
                {...formik.getFieldProps("email")}
              />
              {formik.touched.email && formik.errors.email && (
                <span className="text-red-400 text-xs absolute -bottom-5 left-0">{formik.errors.email}</span>
              )}
            </div>

            {/* Password Field */}
            <div className="relative group mt-6">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-green-400 transition-colors" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                className="block w-full pl-10 pr-10 py-3 bg-black/20 border border-gray-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all"
                placeholder="Password"
                {...formik.getFieldProps("password")}
              />
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

            {/* Confirm Password Field */}
            <div className="relative group mt-6">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-green-400 transition-colors" />
              </div>
              <input
                type={showConfirmPassword ? "text" : "password"}
                className="block w-full pl-10 pr-10 py-3 bg-black/20 border border-gray-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all"
                placeholder="Confirm Password"
                {...formik.getFieldProps("confirmPassword")}
              />
              <div 
                className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer text-gray-400 hover:text-white"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </div>
              {formik.touched.confirmPassword && formik.errors.confirmPassword && (
                <span className="text-red-400 text-xs absolute -bottom-5 left-0">{formik.errors.confirmPassword}</span>
              )}
            </div>

            {/* Status Message */}
            {formik.status && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="bg-red-500/20 border border-red-500/50 rounded p-2 text-center mt-2"
              >
                <span className="text-red-200 text-sm font-medium">{formik.status}</span>
              </motion.div>
            )}

            {/* Signup Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`w-full mt-6 py-3 px-4 rounded-lg font-bold text-white shadow-lg flex justify-center items-center gap-2
                ${loading 
                  ? "bg-gray-600 cursor-not-allowed" 
                  : "bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-400 hover:to-orange-500"
                } transition-all duration-300`}
              type="submit"
              disabled={loading || !formik.isValid || formik.isSubmitting}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <UserPlus className="w-5 h-5" /> Sign Up
                </>
              )}
            </motion.button>

            {/* Divider */}
            <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-gray-600"></div>
                <span className="flex-shrink mx-4 text-gray-400 text-xs">ALREADY A MEMBER?</span>
                <div className="flex-grow border-t border-gray-600"></div>
            </div>

            {/* Login Link */}
            <div className="text-center">
                <Link to='/login' className="group inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 font-bold transition-all">
                  Sign In to your account <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;