import { gql, request } from "graphql-request";
import React, { useState } from "react";
import { Link } from "react-router-dom"; // Ensure react-router-dom is installed
import BASEURL from "./URLs/BaseURL";



const Reset = gql`

mutation sendPasswordResetEmail($email:String!){
    sendPasswordResetEmail(email:$email){
      success
    }
  }
`
const Fpassword = () => {
    const[email,setEmail] =useState("")
    const handleEmail = (event:any) => {
        console.log(event);
        setEmail(event.target.value);
        
      }

      const handleSubmit = (event:any) => {
        event.preventDefault();
        let hashError = false;  //for api request


        if(email !== ""){
          try {
            request(BASEURL,Reset, {  
              email: email,
            }).then((response: any) => {
              console.log("response-------->",response);
            }).catch ((error:any)=> {
              console.error(error);
             
            })
          } catch (error) {
            console.error(error)
           
          }

        }
     

    }
    return (
        <div className="text-white h-screen flex justify-center items-center bg-cover bg-center" style={{ backgroundImage: `url(${'assets/make-up.jpg'})` }}>
          <div className="absolute top-5 left-5 p-8">
          <h1 className="text-left">
              <span className="font-serif text-5xl md:text-6xl text-blue-600">Aureus</span>{' '}
              <span className="font-serif text-5xl md:text-6xl text-yellow-600">Lens</span><br />
              <span className="ml-56 font-serif text-lg md:text-2xl text-blue-600">by</span>{' '}
              <span className="ml-2 font-serif text-lg md:text-2xl text-yellow-600">Vividobots</span>
            </h1>
          </div>
            <div className="bg-slate-800 border border-slate-600 rounded-md p-8 shadow-lg backdrop-filter backdrop-blur-lg bg-opacity-30 relative transition-all duration-200">
                <h1 className="text-3xl md:text-4xl text-white font-bold text-center mb-6">Forgot Password</h1>
                <form onSubmit={handleSubmit}>
                    <div className="relative my-4">
                        <input
                            onChange={handleEmail}
                            type="text"
                            id="email"
                            className="block w-72 py-2.5 px-0 text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:text-white focus:border-blue-600 peer"
                            placeholder=" "
                        />
                        <label
                            htmlFor="email"
                            className="absolute text-sm text-white duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus left-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">
                            Email
                        </label>
                    </div>
                    
                    
                    <button
                        className="w-full mb-4 text-[16px] md:text-[18px] mt-6 rounded-full bg-blue-600 hover:bg-blue-700 text-white py-2 transition-colors duration-300"
                        type="submit"
                    >
                        Send
                    </button>
                   
                </form>
            </div>
        </div>
    );
};

export default Fpassword;
