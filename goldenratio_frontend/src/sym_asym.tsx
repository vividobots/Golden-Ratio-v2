import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

interface Measurement {
  Name: string;
  Distance: string;
  Symmetry: string | null;  // Allow null
  Percentage: string ; // Allow null
}

interface OutputImage {
  output_image: string;
  output_image1: string;
  output_image2: string;
}

const Sym_asym = () => {

  const handleBack = () => {
    window.history.back();
  };

  const loc = useLocation();
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  // const [average, setAverage] = useState<string>('0');
  const [outputImage, setOutputImage] = useState<OutputImage>({
    output_image: '',
    output_image1: '',
    output_image2: '',
  });const [filteredMeasurements, setFilteredMeasurements] = useState<Measurement[]>([]);

  const [loading, setLoading] = useState(false);

  const { id } = loc.state || {};

  useEffect(() => {
    if (id) {
      axios.get(`http://localhost:8000/uploadfile/sym_json/${id}/`)
        .then((response) => {
          const responseData = response.data;

          setMeasurements(responseData[0] || []); // Ensure this is an array
          setOutputImage({
            output_image: responseData[1][0]?.output_image || '',
            output_image1: responseData[2][0]?.output_image1 || '',
            output_image2: responseData[3][0]?.output_image2 || '',
          });
          setFilteredMeasurements(responseData[0]);
        })
        .catch((error) => {
          console.error('Error fetching data:', error);
        });
    }
  }, [id]);

  const handleFilterChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const filterValue = parseFloat(event.target.value);
    const filtered = measurements.filter(
      (measurement) => parseFloat(measurement.Percentage) < filterValue
    );
    setFilteredMeasurements(filterValue === 100 ? measurements : filtered);
  };

  const getImgUrl = (path: string) => {
    if (!path) return '';
    // If it already starts with http, return it as is.
    if (path.startsWith('http')) return path;
    // Otherwise, prepend the server URL
    return `http://localhost:8000/${path.startsWith('/') ? path.slice(1) : path}`;
  };

  const handleClick = async () => {
    setLoading(true); 
    try {
      const response = await axios.get(`http://localhost:8000/uploadfile/sym_pdf/${id}/`, {
        responseType: 'blob', 
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${id}.pdf`); 
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url); 
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false); 
    }
  };

  return (
    <div className="bg-gradient-to-r from-[#0d163e] to-[#00092d] text-white p-6 bg-fixed">
      <h1 className="text-2xl font-bold text-center mb-8">Symmetric Asymmetriic Results</h1>
      <div className="flex flex-col md:flex-row justify-center mx-auto max-w-md h-md md:space-x-10 shadow-md">
        <img src={getImgUrl(outputImage.output_image)} alt="Reference 1" className="rounded-md max-w-full h-auto mb-4 md:mb-0" />
        <img src={getImgUrl(outputImage.output_image)} alt="Reference 2" className="rounded-md max-w-full h-auto mb-4 md:mb-0" />
        <img src={getImgUrl(outputImage.output_image)} alt="Reference 3" className="rounded-md max-w-full h-auto" />
      </div>
      <div className="flex justify-start mx-5 md:mx-40 mt-6 pl-5">
        <h2 className="text-lg md:text-xl lg:text-2xl font-bold mb-2">
          {/* Average Percentage: <span className="ml-2">{(+average).toFixed(3)} %</span> */}
        </h2>
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

          <button
          className="fixed top-8 right-8 w-14 h-14 bg-transparent bg-center bg-contain rounded-lg shadow-md transition hover:bg-black hover:bg-opacity-30"
          onClick={handleClick}
          style={{
            backgroundImage: `url('assets/background.png')`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            backgroundSize: 'contain',
      }}
      ></button>
      <div className="flex justify-end mt-5 mb-5 pr-40 mx-5">
        <div className="filter-dropdown-container">
          <select
            className="filter-dropdown border rounded-md p-2 text-gray-700 bg-gray-200"
            onChange={handleFilterChange}
          >
            <option value="100">Show All</option>
            <option value="95">Below 95%</option>
            <option value="90">Below 90%</option>
            <option value="85">Below 85%</option>
            <option value="80">Below 80%</option>
          </select>
        </div>
      </div>
      <div className="relative overflow-x-auto rounded-md">
        <table className="w-3/4 mx-auto text-sm text-left bg-sky-500/[.10]  ">
          <thead className="text-xs uppercase g-sky-500/[.10] ">
            <tr>
              <th className="py-2 px-4 border-b border-gray-600 border-r">S.No.</th>
              <th className="py-2 px-4 border-b border-gray-600 border-r">Name</th>
              <th className="py-2 px-4 border-b border-gray-600 border-r">Distance (mm)</th>
              <th className="py-2 px-4 border-b border-gray-600 border-r">Symmetry</th>
              <th className="py-2 px-4 border-b border-gray-600">Percentage (%)</th>
            </tr>
          </thead>
          <tbody>
            {filteredMeasurements.map((item, index) => (
              <tr key={index} className="hover:bg-gray-500">
                <td className="py-2 px-4 border-b border-gray-600 border-r">{index + 1}</td>
                <td className="py-2 px-4 border-b border-gray-600 border-r">{item.Name}</td>
                <td className="py-2 px-4 border-b border-gray-600 border-r">{item.Distance}</td>
                <td className="py-2 px-4 border-b border-gray-600 border-r">{item.Symmetry || 'N/A'}</td> {/* Display N/A for null */}
                <td className="py-2 px-4 border-b border-gray-600">{item.Percentage || 'N/A'}</td> {/* Display N/A for null */}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Sym_asym;
