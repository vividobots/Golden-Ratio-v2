import axios from "axios";
import { motion } from "framer-motion";
import { CloudUpload, LogOut, Upload } from "lucide-react";
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

  const handleFileChange = (event: any) => {
    const file = event.target.files[0];
    setValues((prev) => ({ ...prev, file_upload: file }));

    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    if (file) reader.readAsDataURL(file);
  };

  const uploadFile = async (event: any) => {
    event.preventDefault();
    if (!imagePreview) return;

    const formData = new FormData();
    formData.append("user", user || "");

    if (values.file_upload) formData.append("image", values.file_upload); // CRITICAL: Use 'image'

    setIsDisabled(true);

    try {
      // UPLOAD IMAGE
      const res = await axios.post(
        "http://localhost:8000/api/process_image/", // Use the new fixed URL
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      const newFileId = res.data.id;

      // Navigate using the ID
      // We pass the new ID and the image preview URL for the next screen
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
                imagePreview ? "hidden" : "hover:border-indigo-500"
              }`}
            >
              <CloudUpload className="w-12 h-12 text-gray-400" />
              <span className="mt-2 text-gray-600 font-medium">
                Upload your photo
              </span>
            </label>
            <input
              type="file"
              id="file-upload"
              className="hidden"
              accept=".png, .jpg, .jpeg, .gif"
              onChange={handleFileChange}
            />
            {imagePreview && (
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full h-72 object-cover rounded-xl shadow-md"
              />
            )}
            {fileImage && !imagePreview && (
              <img
                src={fileImage}
                alt="Preview"
                className="w-full h-72 object-cover rounded-xl shadow-md"
              />
            )}

            <Button
              type="submit"
              className="mt-6 w-full"
              disabled={isDisabled}
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
