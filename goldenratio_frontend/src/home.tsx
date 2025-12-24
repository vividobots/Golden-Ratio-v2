import axios from "axios";
import { motion } from "framer-motion";
import { AlertCircle, CloudUpload, LogOut, Upload } from "lucide-react"; // Added AlertCircle
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "./components//ui/button";
import { Card, CardContent } from "./components//ui/card";
import { fromGlobalId } from "./Decode/rawPk";

const initialValues = {
  file_upload: null as File | null,
  user: null,
};

const Home = () => {
  const [isDisabled, setIsDisabled] = useState(false);
  const navigate = useNavigate();
  const [values, setValues] = useState(initialValues);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [resolutionError, setResolutionError] = useState<string | null>(null); // New State for Error
  const location = useLocation();
  const { fileId, fileImage } = location.state || {};
  const [user, setUser] = useState<string | null>(null);

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    const loggedInUser = localStorage.getItem("goldenratio");
    if (!loggedInUser) navigate("/login");

    if (userId) {
      const { id: rawPk } = fromGlobalId(userId);
      setUser(rawPk);
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("goldenratio");
    navigate("/login");
  };

  const username = localStorage.getItem("username") || "";
  const getInitials = (name: string) =>
    name
      .trim()
      .split(" ")
      .map((part) => part.charAt(0).toUpperCase())
      .join("");
  const initials = getInitials(username);

  // --- MODIFIED FILE HANDLER WITH RESOLUTION CHECK ---
  const handleFileChange = (event: any) => {
    const file = event.target.files[0];
    if (!file) return;

    // 1. Check File Size (Limit: 10MB to match your backend)
    const MAX_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_SIZE) {
        setResolutionError(`File is too large (${(file.size / 1024 / 1024).toFixed(2)}MB). Maximum allowed is 10MB.`);
        setValues((prev) => ({ ...prev, file_upload: null })); // Clear file
        setImagePreview(null);
        return;
    }

    const reader = new FileReader();
    
    reader.onload = (e: any) => {
      const img = new Image();
      img.src = e.target.result;

      img.onload = () => {
        const width = img.width;
        const height = img.height;

        // Define Limits
        const MIN_DIMENSION = 600;
        const MAX_DIMENSION = 4096; // Standard 4K limit

        // 2. Check Resolution (Min & Max)
        if (width < MIN_DIMENSION || height < MIN_DIMENSION) {
          setResolutionError(`Resolution too low (${width}x${height}px). Minimum ${MIN_DIMENSION}x${MIN_DIMENSION}px required.`);
          setValues((prev) => ({ ...prev, file_upload: file }));
          setImagePreview(e.target.result);
        } 
        else if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
           setResolutionError(`Resolution too high (${width}x${height}px). Maximum ${MAX_DIMENSION}x${MAX_DIMENSION}px allowed.`);
           // Disable upload but show preview so they know what they picked
           setValues((prev) => ({ ...prev, file_upload: file }));
           setImagePreview(e.target.result);
        }
        else {
          // Valid Image
          setResolutionError(null);
          setValues((prev) => ({ ...prev, file_upload: file }));
          setImagePreview(e.target.result);
        }
      };
    };

    reader.readAsDataURL(file);
  };

  const uploadFile = async (event: any) => {
    event.preventDefault();
    if (!imagePreview || resolutionError) return; // Prevent if error exists

    const formData = new FormData();
    formData.append("user", user || "");

    if (values.file_upload) formData.append("image", values.file_upload);

    setIsDisabled(true);

    try {
      const res = await axios.post(
        "http://localhost:8000/api/process_image/", 
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      const newFileId = res.data.id;

      navigate(`/select_method/${newFileId}/True/`, {
        state: {
          uploadedImageURL: imagePreview, 
          id: newFileId,
          shrinkUrl: res.data.shrink_url,
          bulgeUrl: res.data.bulge_url,
        }
      });

    } catch (error) {
      console.error("Processing Failed: ", error);
      alert("Processing failed. Please check server logs.")
      setIsDisabled(false);
    }
  };

  return (
    <div
      className="relative min-h-screen bg-gradient-to-br from-blue-100 to-purple-200 text-gray-900 flex flex-col"
    >
      {/* Header */}
      <div className="flex justify-between items-center p-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 flex items-center justify-center rounded-full bg-indigo-600 text-white text-lg font-bold shadow-md">
            {initials}
          </div>
          <span className="text-lg font-semibold">{username}</span>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => navigate("/uploadedimage")}
          >
            <Upload className="w-5 h-5" /> My Uploads
          </Button>
          <Button
            variant="default"
            className="flex items-center gap-2"
            onClick={handleLogout}
          >
            <LogOut className="w-5 h-5" /> Logout
          </Button>
        </div>
      </div>

      {/* Title */}
      <motion.div
        className="text-center mt-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="font-serif text-5xl font-bold text-indigo-700">
          Aureus <span className="text-yellow-600">Lens</span>
          <p className="mt-2 text-lg font-medium text-gray-700">
          by <span className="text-yellow-600">Vividobots</span>
        </p>
        </h1>
      </motion.div>

      {/* Upload Section */}
      <form
        onSubmit={uploadFile}
        className="flex-grow flex justify-center items-center"
      >
        <Card className="w-[90%] max-w-lg shadow-2xl bg-white/80 backdrop-blur-md">
          <CardContent className="p-6 flex flex-col items-center">
            <label
              htmlFor="file-upload"
              className={`w-full h-72 flex flex-col items-center justify-center border-2 border-dashed rounded-xl cursor-pointer transition ${
                imagePreview 
                  ? (resolutionError ? "border-red-500 bg-red-50" : "border-indigo-500") 
                  : "hover:border-indigo-500"
              }`}
            >
              {!imagePreview ? (
                <>
                  <CloudUpload className="w-12 h-12 text-gray-400" />
                  <span className="mt-2 text-gray-600 font-medium">
                    Upload your photo
                  </span>
                  <span className="text-xs text-gray-400 mt-1">Min resolution: 600x600 px</span>
                  <span className="text-xs text-gray-400 mt-1">Max resolution: 4096x4096 px</span>
                </>
              ) :    (
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-72 object-cover rounded-xl shadow-md"
                />
              )}
            </label>
            <input
              type="file"
              id="file-upload"
              className="hidden"
              accept=".png, .jpg, .jpeg, .gif"
              onChange={handleFileChange}
            />
            
            {/* Warning Message Display */}
            {resolutionError && (
              <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded flex items-center gap-2 w-full text-sm font-medium animate-pulse">
                <AlertCircle className="w-5 h-5" />
                {resolutionError}
              </div>
            )}

            <Button
              type="submit"
              className={`mt-6 w-full ${resolutionError ? "opacity-50 cursor-not-allowed" : ""}`}
              disabled={isDisabled || !!resolutionError} 
            >
              {isDisabled ? "Processing..." : "Process"}
            </Button>
          </CardContent>
        </Card>
      </form>
    </div>
  );
};

export default Home;
