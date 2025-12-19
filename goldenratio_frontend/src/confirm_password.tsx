// import React from "react";
// import { Link } from "react-router-dom"; 

// const  Cpassword = () => {
//     return (
//         <div className="text-white h-screen flex justify-center items-center bg-cover bg-center" style={{ backgroundImage: `url(${'assets/make-up.jpg'})` }}>
//              <div className="absolute top-5 left-5 p-8">
//       <h1 className="text-left">
//           <span className="font-serif text-5xl md:text-6xl text-blue-600">Aureus</span>{' '}
//           <span className="font-serif text-5xl md:text-6xl text-yellow-600">Lens</span><br />
//           <span className="ml-56 font-serif text-lg md:text-2xl text-blue-600">by</span>{' '}
//           <span className="ml-2 font-serif text-lg md:text-2xl text-yellow-600">Vividobots</span>
//         </h1>
//       </div>
//             <div className="bg-slate-800 border border-slate-600 rounded-md p-8 shadow-lg backdrop-filter backdrop-blur-lg bg-opacity-30 relative transition-all duration-200">
//                 <h1 className="text-3xl md:text-4xl text-white font-bold text-center mb-6">Change Password</h1>
//                 <form>
//                     <div className="relative my-4">
//                         <input
//                             type="password"
//                             id="npassword"
//                             className="block w-72 py-2.5 px-0 text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:text-white focus:border-blue-600 peer"
//                             placeholder=" "
//                         />
//                         <label
//                             htmlFor="npassword"
//                             className="absolute text-sm text-white duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus left-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
//                         >
//                             New Password
//                         </label>
//                     </div>
                    
//                     <div className="relative my-4">
//                         <input
//                             type="password"
//                             id="password"
//                             className="block w-72 py-2.5 px-0 text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:text-white focus:border-blue-600 peer"
//                             placeholder=" "
//                         />
//                         <label
//                             htmlFor="password"
//                             className="absolute text-sm text-white duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus left-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
//                         >
//                             Confirm Password
//                         </label>
//                     </div>
                   
//                     <button
//                         className="w-full mb-4 text-[16px] md:text-[18px] mt-6 rounded-full bg-blue-600 hover:bg-blue-700 text-white py-2 transition-colors duration-300"
//                         type="submit"
//                     >
//                         Submit
//                     </button>
                   
//                 </form>
//             </div>
//         </div>
//     );
// };

// export default Cpassword;

import { motion } from "framer-motion";
import { gql, request } from "graphql-request";
import { ArrowLeft, Eye, EyeOff, Lock, Save } from "lucide-react";
import React, { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import BASEURL from "./URLs/BaseURL";

// Mutation to reset password
const PASSWORD_RESET = gql`
  mutation passwordReset($token: String!, $newPassword1: String!, $newPassword2: String!) {
    passwordReset(token: $token, newPassword1: $newPassword1, newPassword2: $newPassword2) {
      success
      errors
    }
  }
`;

const Cpassword = () => {
    const { token } = useParams(); // Taking Token from URL
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null);

    // Form inputs
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    // Helper function to extract clean error messages from JSON
    const formatErrorMessage = (errors: any) => {
        if (!errors) return "An unknown error occurred.";
        try {
            // Django GraphQL Auth returns errors as: { field: [{ message: "...", code: "..." }], ... }
            // We loop through all fields and extract the 'message' part.
            const messages: string[] = [];
            Object.keys(errors).forEach((key) => {
                const fieldErrors = errors[key];
                if (Array.isArray(fieldErrors)) {
                    fieldErrors.forEach((err: any) => {
                        if (err.message) messages.push(err.message);
                    });
                }
            });
            return messages.length > 0 ? messages.join(" ") : JSON.stringify(errors);
        } catch (e) {
            return "Invalid error format received.";
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            setStatus({ type: 'error', msg: "Passwords do not match!" });
            return;
        }

        if (!token) {
             setStatus({ type: 'error', msg: "Invalid Link (Token missing)" });
             return;
        }

        setLoading(true);
        setStatus(null);

        try {
            const response: any = await request(BASEURL, PASSWORD_RESET, {
                token: token,
                newPassword1: newPassword,
                newPassword2: confirmPassword
            });

            if (response.passwordReset.success) {
                setStatus({ type: 'success', msg: "Password changed successfully!" });
                setTimeout(() => navigate("/login"), 3000);
            } else {
                 // Error handling from backend
                //  const errorMsg = response.passwordReset.errors 
                //     ? JSON.stringify(response.passwordReset.errors) 
                //     : "Failed to reset password.";
                 const rawErrors = response.passwordReset.errors;
                 const cleanErrorMsg = formatErrorMessage(rawErrors);
                 setStatus({ type: 'error', msg: cleanErrorMsg });
            }

        } catch (error) {
            console.error(error);
            setStatus({ type: 'error', msg: "Link expired or invalid." });
        } finally {
            setLoading(false);
        }
    };
        // Logic for password reset would go here
        // setTimeout(() => setLoading(false), 2000); // Fake loading for UI demo
    

    return (
        <div className="relative min-h-screen flex items-center justify-center bg-cover bg-center overflow-hidden px-4" 
             style={{ backgroundImage: `url('/assets/make-up.jpg')` }}>
          
          {/* Dark Overlay */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"></div>
    
          <div className="relative w-full max-w-6xl flex flex-col md:flex-row items-center justify-around z-10">
            
            {/* Left Side: Branding */}
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center md:text-left mb-8 md:mb-0 hidden md:block"
            >
              <h1 className="flex flex-col md:block">
                <span className="font-serif text-6xl md:text-8xl text-blue-500 font-bold drop-shadow-lg">Aureus</span>
                <span className="font-serif text-6xl md:text-8xl text-yellow-500 font-bold drop-shadow-lg md:ml-4">Lens</span>
              </h1>
              <p className="mt-4 text-gray-200 text-lg">Secure your new credentials.</p>
            </motion.div>
    
            {/* Right Side: Glassmorphism Card */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="w-full max-w-md bg-white/10 border border-white/20 rounded-2xl p-8 shadow-2xl backdrop-blur-md"
            >
               {/* Mobile Branding */}
               <div className="md:hidden text-center mb-6">
                 <span className="font-serif text-4xl text-blue-500 font-bold">Aureus</span>
                 <span className="font-serif text-4xl text-yellow-500 font-bold ml-2">Lens</span>
              </div>
    
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-white mb-2">Reset Password</h2>
                <p className="text-gray-300 text-sm">Create a strong new password</p>
              </div>
    
              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* New Password */}
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-green-400 transition-colors" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    id="npassword"
                    className="block w-full pl-10 pr-10 py-3 bg-black/20 border border-gray-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all"
                    placeholder="New Password"
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                  <div 
                    className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer text-gray-400 hover:text-white" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-green-400 transition-colors" />
                  </div>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="cpassword"
                    className="block w-full pl-10 pr-10 py-3 bg-black/20 border border-gray-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all"
                    placeholder="Confirm New Password"
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                   <div className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer text-gray-400 hover:text-white" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </div>
                </div>

                {/* Status Message */}
                {status && (
                    <div className={`p-3 rounded text-sm text-center ${status.type === 'success' ? 'bg-green-500/20 text-green-200' : 'bg-red-500/20 text-red-200'}`}>
                        {status.msg}
                    </div>
                )}
    
                <motion.button
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    className={`w-full py-3 px-4 rounded-lg font-bold text-white shadow-lg flex justify-center items-center gap-2
                        ${loading 
                        ? "bg-gray-600 cursor-not-allowed" 
                        : "bg-green-600 hover:bg-green-700"
                        } transition-all duration-300`}
                    type="submit"
                    disabled={loading}
                >
                    {loading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                        <>
                         <Save className="w-4 h-4" /> Save Password
                        </>
                    )}
                </motion.button>

                <div className="text-center mt-4">
                    <Link to="/login" className="inline-flex items-center text-sm text-gray-300 hover:text-white transition-colors">
                        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Login
                    </Link>
                </div>
                
              </form>
            </motion.div>
          </div>
        </div>
      );
};

export default Cpassword;