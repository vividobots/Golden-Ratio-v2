import axios from 'axios';
import { useEffect, useState } from 'react';
import { MdHome } from 'react-icons/md';
import { useLocation } from 'react-router-dom';
import URL from './URLs/URL';

interface Average {
  average: string;
}
interface Average {
  average1: string;
}
interface Average {
  average: string;
}

const CompareReport = () => {
  const [average, setAverage] = useState<string>('');
  const [avg, setAvg] = useState<string>('');
  const [avgs, setAvgs] = useState<string>('');
  const loca = useLocation();
  // const navigate = useNavigate();
  const { id } = loca.state || {};

  const { uploadedImageURL } = loca.state || {};

const handleBack = () => {
  window.history.back();
  // navigate(-1);
};

const getCleanImage = (url: string) => {
    if (!url) return '';
    
    if (url.includes('http') && url.lastIndexOf('http') > 0) {
        const parts = url.split('http');
        // Reconstruct the last part: 'http' + last element
        let lastPart = 'http' + parts[parts.length - 1];
        // If it starts with 'http://3.110.41.174:8000//', fix the double slash
        return lastPart.replace('8000//', '8000/'); 
    }
    
    // Fix missing domain
    if (url.startsWith('/media')) {
        return `${URL}${url}`;
    }
    
    return url;
  };

  useEffect(() => {
    if (!id) return;

    // Golden Ratio
    axios.get(`${URL}/uploadfile/gr_json/${id}/`)
    .then(response => {
      // Safe access using ?. to prevent crashes
      const val = response.data?.[1]?.[0]?.average || response.data?.average || 0;
      setAverage(val);
    })
    .catch(error => console.error('Error fetching GR data:', error));
  }, [id]);

  useEffect(() => {
    if (!id) return;

    // Input as Reference
    axios.get(`${URL}/uploadfile/inpt_json/${id}/`)
    .then(response => {
      const val = response.data?.[1]?.[0]?.average1 || response.data?.average || 0;
      setAvgs(val);
    })
    .catch(error => console.error('Error fetching Input data:', error));
  }, [id]);

  useEffect(() => {
    if (!id) return;

    // Phi Matrix
    axios.get(`${URL}/uploadfile/phi_json/${id}/`)
    .then(response => {
      const val = response.data?.[1]?.[0]?.average2 || response.data?.average || 0;
      setAvg(val);
    })
    .catch(error => console.error('Error fetching Phi data:', error));
  }, [id]);

  return (
    <div className="relative min-h-screen bg-gradient-to-r from-[#0d163e] to-[#00092d] text-white flex flex-col justify-between items-center">
      
      {/* --- BACK BUTTON (Top Left) --- */}
      <button
        className="fixed top-5 left-5 w-8 h-8 bg-transparent hover:bg-black/30 rounded-lg shadow-md flex items-center justify-center z-50"
        onClick={handleBack}
        style={{
            backgroundImage: `url('assets/icons8-arrow-30.png')`, // Ensure this asset exists or remove style for default button
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            backgroundSize: 'contain',
            border: '1px solid white' // Added border so you can see it if icon is missing
        }}
      >
        {/* Fallback arrow if image missing */}
        <span className="text-xl">←</span> 
      </button>

      {/* Home Button */}
      <button
        className="fixed top-5 right-5 w-8 h-8 bg-transparent hover:bg-black/30 rounded-lg shadow-md flex items-center justify-center"
        onClick={() => (window.location.href = '/')}
      >
        {MdHome({ className: "text-8xl" })}
      </button>

      {/* Main Heading */}
      <div className="fixed bottom-5 right-5 text-right">
        <h1>
          <span className="font-serif text-4xl md:text-4xl text-blue-600">Aureus</span>{' '}
          <span className="font-serif text-4xl md:text-4xl text-yellow-600">Lens</span>
          <br />
          <span className="ml-28 md:ml-56 font-serif text-lg md:text-2xl text-blue-600">by</span>{' '}
          <span className="ml-2 font-serif text-lg md:text-2xl text-yellow-600">Vividobots</span>
        </h1>
      </div>

      <div className="container mx-auto max-w-md h-[37.25rem] p-5">
        {/* <h1 className="text-center text-white text-3xl mb-12">Compare Report</h1> */}
        <div className="mx-auto max-w-lg h-[700px] overflow-hidden shadow-md">
          <img
            className="rounded-md max-w-full h-auto"
            src={getCleanImage(uploadedImageURL)}
            alt="Uploaded Analysis"
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
        </div>
      </div>

      
      <div className="flex flex-col lg:flex-row justify-between items-center w-full max-w-5xl p-8 gap-5 lg:gap-10">

        <div className="flex-4 text-center">
          <h2 className="font-serif text-yellow-600 text-2xl md:text-3xl mb-3 md:mb-8">Phi Matrix</h2>
          <p className="font-serif text-lg text-2xl md:text-xl">{'Overall Percentage: ' + (+avg).toFixed(3) + ' %'}</p>

        </div>

        <div className="flex-4 text-center">
          <h2 className="font-serif text-yellow-600 text-2xl md:text-3xl mb-3 md:mb-8">Input Reference</h2>
          <p className="font-serif text-lg text-2xl md:text-xl">{'Overall Percentage: ' + (+avgs).toFixed(3) + ' %'}</p>

        </div>


        <div className="flex-4 text-center">
          <h2 className="font-serif text-yellow-600 text-2xl md:text-3xl mb-3 md:mb-8">Golden Ratio</h2>
            <p className="font-serif text-lg text-2xl md:text-xl">{'Overall Percentage: ' + (+average).toFixed(3) + ' %'}</p>
            
  
        </div>
      </div>
    </div>
  );
};

export default CompareReport;
