import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

interface Measurement {
  Description1: string;
  Description2: string;
  dist1: string;
  dist2: string;
  Percentage: string;
}

interface Average {
  average2: string;
}

interface OutputImage {
  output_image: string;
}

const Phimatix = () => {
  const handleBack = () => {
    window.history.back();
  };

  const loc = useLocation();
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [average, setAverage] = useState<string>('');
  const [outputImage, setOutputImage] = useState<string>('');
  const [filteredMeasurements, setFilteredMeasurements] = useState<Measurement[]>([]);
  const { id } = loc.state || {};
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    axios.get(`http://localhost:8000/uploadfile/phi_json/${id}/`)
      .then((response) => {
        const responseData = response.data;
        setMeasurements(responseData[0]); // First part: measurement data
        setAverage(responseData[1][0].average2); // Second part: average
        setOutputImage(responseData[2][0].output_image);
        setFilteredMeasurements(responseData[0]);
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
      });
  }, [id]);

  const handleFilterChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const filterValue = parseFloat(event.target.value);
    const filtered = measurements.filter(
      (measurement) => parseFloat(measurement.Percentage) < filterValue
    );
    setFilteredMeasurements(filterValue === 100 ? measurements : filtered);
  };

  const location = useLocation();
  const { uploadedImageURL } = location.state || {};

  const handleClick = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:8000/uploadfile/phi_pdf/${id}/`, {
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
    <div className="bg-gradient-to-r from-[#0d163e] to-[#00092d] text-white p-6 min-h-screen">
      <h1 className="text-3xl font-bold text-center mb-8 tracking-wide">Phimatix Results</h1>

      {/* Images Section */}
      <div className="flex flex-col md:flex-row justify-center mx-auto max-w-3xl md:space-x-10">
        <img
          src={uploadedImageURL}
          alt="Reference 1"
          className="rounded-xl max-w-full h-auto mb-4 md:mb-0 shadow-lg"
        />
        <img 
          src={outputImage.startsWith('http') ? outputImage : `http://localhost:8000/${outputImage}`} 
          alt="Reference 2" 
          className="rounded-xl max-w-full h-auto shadow-lg" 
        />
      </div>

      {/* Average Percentage */}
      <div className="flex justify-center mt-8">
        <div className="bg-gray-800/60 px-6 py-4 rounded-2xl shadow-lg">
          <h2 className="text-xl md:text-2xl lg:text-3xl font-bold">
            Average Percentage:{" "}
            <span className="ml-2 text-indigo-400">{(+average).toFixed(3)} %</span>
          </h2>
        </div>
      </div>

      {/* Back Button */}
      <button
        className="fixed top-5 left-5 w-8 h-8 bg-transparent hover:bg-black/30 rounded-lg shadow-md flex items-center justify-center"
        onClick={handleBack}
        style={{
          backgroundImage: `url('assets/icons8-arrow-30.png')`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          backgroundSize: 'contain',
        }}
      ></button>

      {/* Download Button */}
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

      {/* Filter Dropdown */}
      <div className="flex justify-end mt-5 mb-5 pr-10 md:pr-40">
        <div className="filter-dropdown-container">
          <select
            className="filter-dropdown border rounded-md p-2 text-gray-700 bg-gray-200 focus:ring-2 focus:ring-indigo-500"
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

      {/* Stylish Table */}
      <div className="relative overflow-x-auto max-h-[600px] rounded-2xl shadow-lg border border-gray-700">
        <table className="w-full text-sm text-left text-gray-200">
          <thead className="sticky top-0 bg-gradient-to-r from-indigo-800 to-indigo-900 text-white uppercase text-xs tracking-wider">
            <tr>
              <th className="py-3 px-4 border-r border-gray-700 text-center">S.No.</th>
              <th className="py-3 px-4 border-r border-gray-700">Description</th>
              <th className="py-3 px-4 border-r border-gray-700 text-center">Distance (mm)</th>
              <th className="py-3 px-4 text-center">Percentage (%)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {filteredMeasurements.map((item, index) => (
              <tr
                key={index}
                className={`transition duration-200 ${
                  index % 2 === 0 ? "bg-gray-900/40" : "bg-gray-800/40"
                } hover:bg-indigo-600 hover:text-white`}
              >
                <td className="py-3 px-4 text-center font-semibold">{index + 1}</td>
                <td className="py-3 px-4">
                  <div>{item.Description1}</div>
                  <div>{item.Description2}</div>
                </td>
                <td className="py-3 px-4 text-center">
                  <div>{item.dist1}</div>
                  <div>{item.dist2}</div>
                </td>
                <td
                  className={`py-3 px-4 text-center font-bold ${
                    parseFloat(item.Percentage) >= 90
                      ? "text-green-400"
                      : parseFloat(item.Percentage) >= 80
                      ? "text-yellow-400"
                      : "text-red-400"
                  }`}
                >
                  {item.Percentage} %
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Phimatix;
