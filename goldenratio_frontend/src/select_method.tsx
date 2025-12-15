import { gql, GraphQLClient } from 'graphql-request';
import { useEffect, useState } from 'react';
import { MdHome } from 'react-icons/md';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import BASEURL from './URLs/BaseURL';
import URL from './URLs/URL';

const GET_ORIGINAL_IMAGE = gql`
  query getprocessedImage($id: String!) {
    processedImage(id: $id) {
      id
      originalImage
    }
  }
`;

  // replaced fileUpload with originalImage in the above query

const Select_method = () => {
  // const { id, state } = useParams<{id: string, state: string }>();
  const { id } = useParams<{ id: string }>();
  // console.log("id&State", id, state);
  console.log("id", id);

  const location = useLocation(); // 2. Get location to access state

  // 3. Extract uploadedImageURL safely
  const locationState = location.state as { uploadedImageURL?: string } | null;
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [imageData, setImageData] = useState<string | null>(null);
  // const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const MdHomeIcon = MdHome as unknown as React.FC<{ className?: string }>;
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // const toggleDropdown = () => {
  //   setIsDropdownOpen(!isDropdownOpen);
  // };

  const handleDownloadReport = async () => {
     if (!id) return;
     try {
        // This triggers the PDF generation endpoint
        const baseUrl = URL.endsWith('/') ? URL.slice(0, -1) : URL;
        const response = await fetch(`${baseUrl}/uploadfile/pdf/${id}/`);
        if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Report_${id}.pdf`;
            document.body.appendChild(a);
            a.click();
            a.remove();
        } else {
            alert("Failed to generate report. Please try again.");
        }
     } catch (e) {
         console.error(e);
         alert("Error downloading report.");
     }
  };
  
  const navigate = useNavigate();

  useEffect(() => {
    if (locationState?.uploadedImageURL) {
      setImageData(locationState.uploadedImageURL);
      return;
    }

    const fetchImage = async () => {
      if (!id) return; // Check for ID

      try {
        const client = new GraphQLClient(BASEURL);
        // const data :any = await client.request(GET_IMAGE_BY_ID, { id });
        const data :any = await client.request(GET_ORIGINAL_IMAGE, { id });
        // The URL returned from Django/Graphene will be relative (e.g., /media/originals/image.jpg)
        // setImageData(data.imageGetById.fileUpload);
        // 4. If fetching from backend, we MUST prepend the URL here
        // so that 'imageData' state always holds a valid, complete src string.
        const imgUrl = data.imageGetById.originalImage;
        setImageData(imgUrl.startsWith('http') ? imgUrl : URL + imgUrl);
        // console.log(data.imageGetById.fileUpload)
      } catch (err) {
          console.error("GraphQL fetch error:", err);
      }
    };

    // 5. PRIORITY LOGIC:
    // If we have the image from the previous screen (State), use it immediately.
    // If not (user refreshed page), fetch it from backend.

      fetchImage(); 
  }, [id, locationState]);
  
  return (
    <div className="relative min-h-screen bg-gradient-to-r from-[#0d163e] to-[#00092d] text-white flex flex-col justify-between items-center">
      <button
        className="fixed top-5 right-5 w-8 h-8 bg-transparent hover:bg-black/30 rounded-lg shadow-md flex items-center justify-center"
        onClick={() => (window.location.href = '/')}
      >
        <MdHomeIcon className="text-8xl" />
      </button>
     
      <button
        className="fixed top-5 left-5 p-2 bg-[#0d163e] bg-opacity-90 rounded-lg shadow-md flex flex-col gap-1 cursor-pointer z-10"
        onClick={toggleMenu}
      >
        <div className={`w-7 h-1 bg-white transition ${isMenuOpen ? 'transform rotate-[-45deg] translate-y-1.5' : ''}`}></div>
        <div className={`w-7 h-1 bg-white transition ${isMenuOpen ? 'opacity-0' : ''}`}></div>
        <div className={`w-7 h-1 bg-white transition ${isMenuOpen ? 'transform rotate-[45deg] -translate-y-1.5' : ''}`}></div>
      </button>

      {isMenuOpen && (
        <div className="fixed top-16 left-5 p-4 bg-[#0d163e] bg-opacity-90 rounded-lg shadow-md z-10">
          <button
              className="block w-full text-left p-2 bg-black bg-opacity-30 text-white rounded-md text-lg hover:bg-yellow-400"
              // 6. Use 'imageData' directly here, as it is now guaranteed to be the full path
              onClick={() => navigate('/compare_report', { state: { uploadedImageURL: imageData, id } })}
            >
              Compare Report
          </button>
          <button className="block w-full text-left p-2 bg-black bg-opacity-30 text-white rounded-md text-lg hover:bg-yellow-400"
          onClick={handleDownloadReport}
          >Download Report</button>
          <div className="relative mt-2">
            
          </div>
        </div>
      )}

      <div className="fixed bottom-5 right-5 text-right">
        
      </div>

      <div className="container mx-auto max-w-md h-[37.25rem] p-5">
        <h1 className="text-center text-white text-3xl mb-12">Uploaded Image</h1>
        <div className="mx-auto max-w-lg h-[700px] overflow-hidden shadow-md">
        {imageData ? (
            <img
              className="rounded-md max-w-full h-auto"
              // Fix the image path using the absolute URL and the relative path from Graphene
              // 7. CRITICAL FIX: Removed 'URL +' because we handled it in useEffect
              src = {imageData}
              alt="Uploaded"
            />
          ) : (
            <p className="text-center text-white">Loading image...</p>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto mt-20 mb-10 text-center p-5 bg-black bg-opacity-10 rounded-md shadow-md">
      {/* 8. Updated navigations to use 'imageData' directly */}
      <button onClick={() => navigate('/refer',{ state: { uploadedImageURL: imageData , id} })} className="m-2 py-2 px-6 bg-transparent text-white border rounded-md hover:bg-yellow-600" >Input As Reference </button>     {/* Fixed to use imageData directly by removing URL */}
      <button onClick={() => navigate('/golden_ratio',{ state: { uploadedImageURL: imageData , id} })} className="m-2 py-2 px-6 bg-transparent text-white border rounded-md hover:bg-yellow-600" > Golden Ratio</button>    {/* Fixed to use imageData directly by removing URL */}
      <button onClick={() => navigate('/phimatrix',{ state: { uploadedImageURL: imageData , id} })} className="m-2 py-2 px-6 bg-transparent text-white border rounded-md hover:bg-yellow-600"> Phi Matrix</button>      {/* Fixed to use imageData directly by removing URL */}
      <button onClick={() => navigate('/sym_asym',{ state: { uploadedImageURL: imageData , id} })} className="m-2 py-2 px-6 bg-transparent text-white border rounded-md hover:bg-yellow-600">Symmetric Asymmetric</button>      {/* Fixed to use imageData directly by removing URL */}
      <button onClick={() => navigate('/strink',{ state: { uploadedImageURL: imageData , id} })} className="m-2 py-2 px-6 bg-transparent text-white border rounded-md hover:bg-yellow-600">Shrink</button>      {/* Fixed to use imageData directly by removing URL */}
      <button onClick={() => navigate('/bulge',{ state: { uploadedImageURL: imageData , id} })} className="m-2 py-2 px-6 bg-transparent text-white border rounded-md hover:bg-yellow-600">Bulge</button>    {/* Fixed to use imageData directly by removing URL */}
      </div>
    </div>
  );
};

export default Select_method;
