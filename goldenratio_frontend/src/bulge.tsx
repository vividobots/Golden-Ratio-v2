import { GraphQLClient, gql } from 'graphql-request';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import BASEURL from './URLs/BaseURL';
import URL from './URLs/URL';

const GET_IMAGE_BY_ID = gql`
   query getProcessedImage($id: String!) {
    processedImage(id: $id) {
      id
      bulgeImage
    }
  }
`;

const Bulge = () => {
  const location = useLocation();
  const { uploadedImageURL, id } = location.state || {};
  const [imageData, setImageData] = useState<string | null>(null);
  

  useEffect(() => {
    const fetchImage = async () => {
      try {
        const client = new GraphQLClient(BASEURL); 
        const data :any = await client.request(GET_IMAGE_BY_ID, { id });
        setImageData(data.processedImage.bulgeImage);
       
      } catch (err) {
        console.error(err);
      }
    };
    if (id) fetchImage();
  }, [id]);

  const handleBack = () => window.history.back();

  const getDisplayUrl = (path: string | null) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    
    let cleanPath = path.startsWith('/') ? path : '/' + path;
    
    if (!cleanPath.startsWith('/media')) {
        cleanPath = '/media' + cleanPath;
    }
    return `${URL}${cleanPath}`;
    
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-[#0d163e] to-[#00092d] text-white p-6 bg-fixed">
      <h1 className="text-2xl font-bold text-center mb-8">Bulge_Image Results</h1>
      <div className="flex flex-col md:flex-row justify-center mx-auto max-w-md h-md md:space-x-10 shadow-md">
        <img src={uploadedImageURL} alt="Reference 1" className="rounded-md max-w-full h-auto mb-4 md:mb-0" />

        {imageData ? (
            <img
              className="rounded-md max-w-full h-auto mb-4 md:mb-0"
              
              src={getDisplayUrl(imageData)}

              alt="Bulge Result"
            />
          ) : (
            <p className="text-center text-white">Loading or No Image...</p>
          )}
      </div>
      
      <button
          className="fixed top-5 left-5 w-7 h-7 bg-transparent hover:bg-black/30 rounded-lg shadow-md flex items-center justify-center"
          onClick={handleBack} 
          style={{
            backgroundImage: `url('assets/icons8-arrow-30.png')`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            backgroundSize: 'contain',
      }}
      ></button>
    </div>
  );
};

export default Bulge;
