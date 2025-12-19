import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

interface Measurement {
  Name: string;
  patient_value: string;
  reference_value: string;
  gr_percentage: string;
}

interface Average {
  average: string;
}

interface OutputImage {
  output_image: string;
}

const Goldenratio = () => {

  const handleBack = () => {
    window.history.back();
  };

  // const loca = useLocation();
  const location = useLocation();
  const { id, uploadedImageURL } = location.state || {};
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [average, setAverage] = useState<string>('');
  const [outputImage, setOutputImage] = useState<string>('');
  const [filteredMeasurements, setFilteredMeasurements] = useState<Measurement[]>([]);
  const SERVER_URL = 'http://3.110.41.174:8000';
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!id) return;

    const url = `${SERVER_URL}/uploadfile/gr_json/${id}/`;
    console.log("GR JSON response: ", url);

    // axios.get(`http://3.110.41.174:8000/uploadfile/gr_json/${id}/`)
    axios.get(url)
      .then((response) => {
        const responseData = response.data;
        console.log("GR JSON response:", responseData);

        if(responseData && responseData.length > 0) {
            setMeasurements(responseData[0]); // First part: measurement data
            setAverage(responseData[1][0].average); // Second part: average
            setOutputImage(responseData[2][0].output_image); // Third part: output image
            setFilteredMeasurements(responseData[0]);
        }
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
      });
  }, [id]);

  const handleFilterChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const filterValue = parseFloat(event.target.value);
    const filtered = measurements.filter(
      (measurement) => parseFloat(measurement.gr_percentage) < filterValue
    );
    setFilteredMeasurements(filterValue === 100 ? measurements : filtered);
  };

  const handleClick = async () => {
    setLoading(true); 
    try {
      // const response = await axios.get(`http://3.110.41.174:8000/uploadfile/gr_pdf/${id}/`, {
      const response = await axios.get(`${SERVER_URL}/uploadfile/gr_pdf/${id}/`, {
        responseType: 'blob', 
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Golden_ratio.pdf`); 
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
      <h1 className="text-2xl font-bold text-center mb-8">Golden Ratio Results</h1>
      <div className="flex flex-col md:flex-row justify-center mx-auto max-w-md h-md md:space-x-10 shadow-md">
        <img src={uploadedImageURL} alt="Reference 1" className="rounded-md max-w-full h-auto mb-4 md:mb-0" />
        <img 
          src={outputImage.startsWith('http') ? outputImage : `http://3.110.41.174:8000/${outputImage}`} 
          alt="Reference 2" 
          className="rounded-md max-w-full h-auto" 
        />
      </div>
      <div className="flex justify-start mx-5 md:mx-40 mt-6 pl-5">
        <h2 className="text-lg md:text-xl lg:text-2xl font-bold mb-2">
          Average Percentage: <span className="ml-2">{(+average).toFixed(3)} %</span>
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
              <th className="py-2 px-4 border-b border-gray-600 border-r">S.No.</th>
              <th className="py-2 px-4 border-b border-gray-600 border-r">Name</th>
              <th className="py-2 px-4 border-b border-gray-600 border-r">Input Distance (mm)</th>
              <th className="py-2 px-4 border-b border-gray-600 border-r">Reference Distance (mm)</th>
              <th className="py-2 px-4 border-b border-gray-600 ">Percentage (%)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700" >
            {filteredMeasurements.map((item, index) => (
              <tr key={index} className={`transition duration-200 ${
                  index % 2 === 0 ? "bg-gray-900/40" : "bg-gray-800/40"
                } hover:bg-indigo-600 hover:text-white`}>

                <td className="py-3 px-4 text-center font-semibold">{index + 1}</td>
                <td className="py-3 px-4 border-b border-gray-600 border-r text-center">{item.Name}</td>
                <td className="py-3 px-4 border-b border-gray-600 border-r text-center">{item.patient_value}</td>
                <td className="py-3 px-4 border-b border-gray-600 border-r text-center">{item.reference_value}</td>
                

                  <td 
                    className={`py-3 px-4 text-center font-bold ${
                      (() => {
                        const percentage = Number(
                          item.gr_percentage);

                        if (percentage > 100) return "text-neonpurple-500"; // warning case
                        if (percentage >= 90) return "text-neonpink-500";
                        if (percentage >= 80) return "text-neongreen-400";
                        if (percentage >= 70) return "text-neonblue-400";
                        if (percentage >= 60) return "text-neonyellow-400";
                        if (percentage >= 50) return "text-neonorange-400";
                        return "text-neonred-400";
                      })()
                    }`}
                  >
                    {Number(
                      item.gr_percentage
                    ).toFixed(3)} %
                  </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Goldenratio;
