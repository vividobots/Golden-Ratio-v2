import { GraphQLClient, gql } from 'graphql-request';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import BASEURL from './URLs/BaseURL';
import URL from './URLs/URL';

const GET_PROCESSED_IMAGES_BY_USER = gql`
  query getProcessedImagesByUser($id: String!) {
    processedImageByUser(userId: $id) {
      id
      originalImage
    }
  }
`;

interface FileDetail {
  id: string;
  originalImage: string;
}

const Upload: React.FC = () => {
  const userId = localStorage.getItem('userId');
  const [files, setFiles] = useState<FileDetail[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate(); // Use useNavigate hook

  const fetchFiles = async (userIdValue: string) => {
    setLoading(true);
    try {
      const client = new GraphQLClient(BASEURL);
      const variables = { id: userIdValue };
      const data: any = await client.request(GET_PROCESSED_IMAGES_BY_USER, variables);
      
      const rows = data?.processedImageByUser ?? [];
      
      setFiles(Array.isArray(rows) ? rows : []);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch files");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchFiles(userId);
    }
  }, [userId]);

  if (error) {
    return <div className="text-white text-center mt-10">Error: {error}</div>;
  }

  const handleImageClick = (fileId: string, fileImage: string) => {
    // Navigate to select_method page with both fileId and fileImage
    navigate(`/select_method/${fileId}/False/`, { 
      state: { 
        uploadedImageURL: fileImage, 
        id: fileId 
      } 
    });
  };

  return (
    <div className="bg-gradient-to-r from-[#0d163e] to-[#00092d] text-white p-6 bg-fixed min-h-screen">
        <h1 className="text-2xl font-bold text-center mb-8">Uploaded Images</h1>
      {loading ? <p className="text-center">Loading...</p> : (
        <div className="grid grid-cols-1 sm:grid-cols-4 md:grid-cols-4 gap-6">
          {files.map((file) => {
              let path = file.originalImage;
              if (!path.startsWith('http')) {
                  if (!path.startsWith('/')) path = '/' + path;
                  if (!path.startsWith('/media')) path = '/media' + path;
                  path = URL + path;
              }
              
              return (
              <div key={file.id} className="mx-auto max-w-xs h-[300px] overflow-hidden shadow-md bg-black/20 rounded-md">
                <img className="rounded-md h-full w-full object-cover cursor-pointer hover:opacity-80 transition"
                  
                  src={path}
                  alt={`File ${file.id}`}
                  onClick={() => handleImageClick(file.id, path)}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Upload;
