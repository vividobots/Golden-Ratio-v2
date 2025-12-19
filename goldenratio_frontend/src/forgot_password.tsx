// import { gql, request } from "graphql-request";
// import React, { useState } from "react";
// import { Link } from "react-router-dom"; // Ensure react-router-dom is installed
// import BASEURL from "./URLs/BaseURL";



// const Reset = gql`

// mutation sendPasswordResetEmail($email:String!){
//     sendPasswordResetEmail(email:$email){
//       success
//     }
//   }
// `
// const Fpassword = () => {
//     const[email,setEmail] =useState("")
//     const handleEmail = (event:any) => {
//         console.log(event);
//         setEmail(event.target.value);
        
//       }

//       const handleSubmit = (event:any) => {
//         event.preventDefault();
//         let hashError = false;  //for api request


//         if(email !== ""){
//           try {
//             request(BASEURL,Reset, {  
//               email: email,
//             }).then((response: any) => {
//               console.log("response-------->",response);
//             }).catch ((error:any)=> {
//               console.error(error);
             
//             })
//           } catch (error) {
//             console.error(error)
           
//           }

//         }
     

//     }
//     return (
//         <div className="text-white h-screen flex justify-center items-center bg-cover bg-center" style={{ backgroundImage: `url(${'assets/make-up.jpg'})` }}>
//           <div className="absolute top-5 left-5 p-8">
//           <h1 className="text-left">
//               <span className="font-serif text-5xl md:text-6xl text-blue-600">Aureus</span>{' '}
//               <span className="font-serif text-5xl md:text-6xl text-yellow-600">Lens</span><br />
//               <span className="ml-56 font-serif text-lg md:text-2xl text-blue-600">by</span>{' '}
//               <span className="ml-2 font-serif text-lg md:text-2xl text-yellow-600">Vividobots</span>
//             </h1>
//           </div>
//             <div className="bg-slate-800 border border-slate-600 rounded-md p-8 shadow-lg backdrop-filter backdrop-blur-lg bg-opacity-30 relative transition-all duration-200">
//                 <h1 className="text-3xl md:text-4xl text-white font-bold text-center mb-6">Forgot Password</h1>
//                 <form onSubmit={handleSubmit}>
//                     <div className="relative my-4">
//                         <input
//                             onChange={handleEmail}
//                             type="text"
//                             id="email"
//                             className="block w-72 py-2.5 px-0 text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:text-white focus:border-blue-600 peer"
//                             placeholder=" "
//                         />
//                         <label
//                             htmlFor="email"
//                             className="absolute text-sm text-white duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus left-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">
//                             Email
//                         </label>
//                     </div>
                    
                    
//                     <button
//                         className="w-full mb-4 text-[16px] md:text-[18px] mt-6 rounded-full bg-blue-600 hover:bg-blue-700 text-white py-2 transition-colors duration-300"
//                         type="submit"
//                     >
//                         Send
//                     </button>
                   
//                 </form>
//             </div>
//         </div>
//     );
// };

// export default Fpassword;

import { motion } from "framer-motion"; // Animation
import { gql, request } from "graphql-request";
import { ArrowLeft, CheckCircle, Mail, Send } from "lucide-react"; // Icons
import { useState } from "react";
import { Link } from "react-router-dom";
import BASEURL from "./URLs/BaseURL";

const Reset = gql`
  mutation sendPasswordResetEmail($email:String!){
    sendPasswordResetEmail(email:$email){
      success
    }
  }
`;

const Fpassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleEmail = (event: any) => {
    setEmail(event.target.value);
    if(message) setMessage(null); // Clear error when typing
  };

  const handleSubmit = async (event: any) => {
    event.preventDefault();
    if (!email) {
        setMessage({ type: 'error', text: 'Please enter your email address' });
        return;
    }

    setLoading(true);
    
    try {
      const response: any = await request(BASEURL, Reset, { email: email });
      console.log("response-------->", response);
      
      if (response.sendPasswordResetEmail.success) {
        setMessage({ type: 'success', text: 'Password reset link sent to your email!' });
      } else {
        setMessage({ type: 'error', text: 'Failed to send email. Try again.' });
      }
    } catch (error) {
      console.error(error);
      setMessage({ type: 'error', text: 'Something went wrong. Please check the email.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-cover bg-center overflow-hidden px-4" 
         style={{ backgroundImage: `url('assets/make-up.jpg')` }}>
      
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"></div>

      <div className="relative w-full max-w-6xl flex flex-col md:flex-row items-center justify-around z-10">
        
        {/* Left Side: Branding (Hidden on mobile for space) */}
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
          <p className="mt-4 text-gray-200 text-lg">Recover your account access securely.</p>
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
            <h2 className="text-3xl font-bold text-white mb-2">Forgot Password?</h2>
            <p className="text-gray-300 text-sm">Enter your email to receive a reset link</p>
          </div>

          {message?.type === 'success' ? (
            <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="text-center py-6"
            >
                <div className="flex justify-center mb-4">
                    <CheckCircle className="w-16 h-16 text-green-400" />
                </div>
                <h3 className="text-xl text-white font-semibold">Check your mail</h3>
                <p className="text-gray-300 mt-2 mb-6">{message.text}</p>
                <Link to="/login" className="text-blue-400 hover:text-white underline">Back to Login</Link>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-blue-400 transition-colors" />
                    </div>
                    <input
                        onChange={handleEmail}
                        value={email}
                        type="email"
                        id="email"
                        className="block w-full pl-10 pr-3 py-3 bg-black/20 border border-gray-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                        placeholder="Enter your email"
                    />
                </div>

                {message?.type === 'error' && (
                    <div className="text-red-400 text-sm bg-red-900/20 p-2 rounded border border-red-500/50 text-center">
                        {message.text}
                    </div>
                )}

                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full py-3 px-4 rounded-lg font-bold text-white shadow-lg flex justify-center items-center gap-2
                        ${loading 
                        ? "bg-gray-600 cursor-not-allowed" 
                        : "bg-blue-600 hover:bg-blue-700"
                        } transition-all duration-300`}
                    type="submit"
                    disabled={loading}
                >
                    {loading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                        <>
                         <Send className="w-4 h-4" /> Send Reset Link
                        </>
                    )}
                </motion.button>

                <div className="text-center mt-4">
                    <Link to="/login" className="inline-flex items-center text-sm text-gray-300 hover:text-white transition-colors">
                        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Login
                    </Link>
                </div>
            </form>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Fpassword;