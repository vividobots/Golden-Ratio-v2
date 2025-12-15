/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",  // better to cover all folders, not just ./src/*
  ],
  theme: {
    extend: {
      colors: {
        neonpurple: {
          500: "#BC13FE", // neon purple
        },
        neongreen: {
          400: "#39FF14", // neon green
        },
        neonblue:{
          400: "#04ffeaff", // neon blue
        },
        neonyellow: {
          400: "#fffc51ff", // neon yellow
        },
        neonorange: {
          400: "#ff7944ff", // neon orange
        },
        neonpink: {
          400: "#ff68f7ff", // neon pink
        },
        neonred: {
          400: "#ff0000ff", // neon red
        },
      },
      boxShadow: {
        neon: "0 0 5px #BC13FE, 0 0 20px #BC13FE, 0 0 40px #BC13FE",
      },
    },
  },
  plugins: [],
}
