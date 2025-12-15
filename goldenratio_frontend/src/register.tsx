
import request, { gql } from "graphql-request";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import BASEURL from "./URLs/BaseURL";
import * as Yup from "yup";
import { useFormik } from "formik";

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
          setStatus("Registration failed. Please try again.");
          console.error(response.register.errors);
        }
      } catch (error) {
        console.error("Signup error:", error);
        setStatus("An error occurred. Please try again.");
      } finally {
        setLoading(false);
        setSubmitting(false);
      }
    },
  });

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
        <h1 className="text-3xl md:text-4xl text-white font-bold text-center mb-6">Signup</h1>
        <form onSubmit={formik.handleSubmit}>
          <div className="relative my-4">
            <input
              type="text"
              id="username"
              className="block w-72 py-2.5 px-0 text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:text-white focus:border-blue-600 peer"
              placeholder=" "
              {...formik.getFieldProps("username")}
            />
            <label
              htmlFor="username"
              className="absolute text-sm text-white duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus left-0 peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
            >
              Username
            </label>
            {formik.touched.username && formik.errors.username ? (
              <span className="text-red-500 text-sm">{formik.errors.username}</span>
            ) : null}
          </div>

          <div className="relative my-4">
            <input
              type="email"
              id="email"
              className="block w-72 py-2.5 px-0 text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:text-white focus:border-blue-600 peer"
              placeholder=" "
              {...formik.getFieldProps("email")}
            />
            <label
              htmlFor="email"
              className="absolute text-sm text-white duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus left-0 peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
            >
              Email
            </label>
            {formik.touched.email && formik.errors.email ? (
              <span className="text-red-500 text-sm">{formik.errors.email}</span>
            ) : null}
          </div>

          <div className="relative my-4">
            <input
              type="password"
              id="password"
              className="block w-72 py-2.5 px-0 text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:text-white focus:border-blue-600 peer"
              placeholder=" "
              {...formik.getFieldProps("password")}
            />
            <label
              htmlFor="password"
              className="absolute text-sm text-white duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus left-0 peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
            >
              Password
            </label>
            {formik.touched.password && formik.errors.password ? (
              <span className="text-red-500 text-sm">{formik.errors.password}</span>
            ) : null}
          </div>

          <div className="relative my-4">
            <input
              type="password"
              id="confirmPassword"
              className="block w-72 py-2.5 px-0 text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:text-white focus:border-blue-600 peer"
              placeholder=" "
              {...formik.getFieldProps("confirmPassword")}
            />
            <label
              htmlFor="confirmPassword"
              className="absolute text-sm text-white duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus left-0 peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
            >
              Confirm Password
            </label>
            {formik.touched.confirmPassword && formik.errors.confirmPassword ? (
              <span className="text-red-500 text-sm">{formik.errors.confirmPassword}</span>
            ) : null}
          </div>

          {formik.status && (
            <div className="text-red-500 text-sm">{formik.status}</div>
          )}

          <button
            className="w-full mb-4 text-[16px] md:text-[18px] mt-6 rounded-full bg-blue-600 hover:bg-blue-700 text-white py-2 transition-colors duration-300"
            type="submit"
            disabled={loading || !formik.isValid || formik.isSubmitting}
          >
            {loading ? <span className="loader mr-2"></span> : null} Signup
          </button>

          <div>
            <span className="m-4">Already have an account? <Link className="text-blue-500" to='/login'>Sign in</Link></span>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;

