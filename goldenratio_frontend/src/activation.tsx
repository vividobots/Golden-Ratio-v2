import { motion } from "framer-motion";
import { gql, request } from "graphql-request";
import { ArrowLeft, ArrowRight, CheckCircle, Loader, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import BASEURL from "./URLs/BaseURL";

// Mutation to verify account (Standard django-graphql-auth mutation)
const VERIFY_ACCOUNT = gql`
  mutation verifyAccount($token: String!) {
    verifyAccount(token: $token) {
      success
      errors
    }
  }
`;

const ActivationPage = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    
    // States: 'idle' | 'loading' | 'success' | 'error'
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState("Verifying your account...");

    useEffect(() => {
        const activateAccount = async () => {
            if (!token) {
                setStatus('error');
                setMessage("Invalid activation link.");
                return;
            }

            try {
                // Call Backend API
                const response: any = await request(BASEURL, VERIFY_ACCOUNT, {
                    token: token
                });

                if (response.verifyAccount.success) {
                    setStatus('success');
                    setMessage("Your account has been successfully activated!");
                    // Optional: Auto redirect after 3 seconds
                    // setTimeout(() => navigate("/login"), 3000); 
                } else {
                    setStatus('error');
                    // Extract error message if available
                    const errorMsg = response.verifyAccount.errors 
                        ? JSON.stringify(response.verifyAccount.errors)
                        : "Activation failed. Token might be expired.";
                    setMessage(errorMsg);
                }
            } catch (error) {
                console.error(error);
                setStatus('error');
                setMessage("Server error or invalid token.");
            }
        };

        // Run activation immediately on mount
        activateAccount();
    }, [token, navigate]);

    return (
        <div className="relative min-h-screen flex items-center justify-center bg-cover bg-center overflow-hidden px-4" 
             style={{ backgroundImage: `url('/assets/make-up.jpg')` }}>
          
          {/* Dark Overlay */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-[3px]"></div>
    
          <div className="relative w-full max-w-md z-10">
            
            {/* Branding (Optional) */}
            <motion.div 
                initial={{ opacity: 0, y: -20 }} 
                animate={{ opacity: 1, y: 0 }} 
                className="text-center mb-8"
            >
                <h1 className="font-serif text-5xl text-white drop-shadow-lg">
                    <span className="text-blue-500">Aureus</span>
                    <span className="text-yellow-500 ml-2">Lens</span>
                </h1>
            </motion.div>
    
            {/* Glass Card */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }} 
              animate={{ opacity: 1, scale: 1 }} 
              className="bg-white/10 border border-white/20 rounded-2xl p-8 shadow-2xl backdrop-blur-md text-center"
            >
              
              {/* --- LOADING STATE --- */}
              {status === 'loading' && (
                  <div className="flex flex-col items-center py-6">
                      <motion.div 
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                      >
                          <Loader className="h-16 w-16 text-blue-400 mb-4" />
                      </motion.div>
                      <h2 className="text-2xl font-bold text-white mb-2">Activating...</h2>
                      <p className="text-gray-300">{message}</p>
                  </div>
              )}

              {/* --- SUCCESS STATE --- */}
              {status === 'success' && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center py-6"
                  >
                      <CheckCircle className="h-20 w-20 text-green-500 mb-4 drop-shadow-lg" />
                      <h2 className="text-3xl font-bold text-white mb-2">Activated!</h2>
                      <p className="text-gray-200 mb-8">{message}</p>
                      
                      <Link to="/login" className="w-full">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="w-full py-3 px-6 rounded-xl font-bold text-white shadow-lg bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 transition-all flex items-center justify-center gap-2"
                        >
                            Login Now <ArrowRight className="w-5 h-5" />
                        </motion.button>
                      </Link>
                  </motion.div>
              )}

              {/* --- ERROR STATE --- */}
              {status === 'error' && (
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex flex-col items-center py-6"
                  >
                      <XCircle className="h-20 w-20 text-red-500 mb-4 drop-shadow-lg" />
                      <h2 className="text-2xl font-bold text-white mb-2">Activation Failed</h2>
                      <div className="bg-red-500/20 text-red-200 p-3 rounded-lg text-sm mb-8 w-full border border-red-500/30">
                        {message}
                      </div>
                      
                      <Link to="/login" className="text-gray-300 hover:text-white transition-colors flex items-center gap-2">
                        <ArrowLeft className="w-4 h-4" /> Back to Login
                      </Link>
                  </motion.div>
              )}

            </motion.div>
          </div>
        </div>
      );
};

export default ActivationPage;