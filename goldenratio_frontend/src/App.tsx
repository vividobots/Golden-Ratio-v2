// @ts-ignore: allow side-effect import of CSS without type declarations
import './App.css';
import Login from './login';
// @ts-ignore: allow side-effect import of CSS without type declarations
import { Route, Routes } from 'react-router-dom';
import ActivationPage from './activation';
import Bulge from './bulge';
import CompareReport from './compare_report';
import Cpassword from './confirm_password';
import Fpassword from './forgot_password';
import Goldenratio from './golden_ratio';
import Home from './home';
// @ts-ignore: allow side-effect import of CSS without type declarations
import './index.css';
import Phimatrix from './phimatrix';
import Reference from './refer';
import Register from './register';
import Select_method from './select_method';
import Strink from './shrink';
import Symmetric from './sym_asym';
import Upload from './uploadedimage';

function App() {

  return (
    <div className='App' >
        
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login/>} />
          <Route path="/activate/:token" element={<ActivationPage />} />
          <Route path='/forgot_password' element={<Fpassword />} /> 
          <Route path='/reset_password' element={<Cpassword />} />
          <Route path="/confirm_password/:token" element={<Cpassword />} />
          <Route path='/home' element={<Home/>}/>
          <Route path="/select_method/:id/:state" element={<Select_method />} />
          <Route path="/refer" element={<Reference />} />
          <Route path="/phimatrix" element={<Phimatrix />} />
          <Route path="/golden_ratio" element={< Goldenratio />} />
          <Route path="/sym_asym" element={<Symmetric />} />
          <Route path="/compare_report" element={<CompareReport/>} />
          <Route path="/uploadedimage" element={<Upload/>} />
          <Route path='/strink' element={<Strink />} />
          <Route path='/bulge' element={< Bulge />} />

        </Routes>
     
    </div>
  ); 
}

export default App;
