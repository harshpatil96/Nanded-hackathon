import { useState, useEffect } from "react";
import PropTypes from "prop-types";

const CheatingRecordsList = ({ records }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageURLs, setImageURLs] = useState({});

  useEffect(() => {
    const urls = {};
    
    records.forEach((record) => {
      // If record.photo is already a string URL (not a Blob), use it directly
      if (typeof record.photo === "string" && record.photo.startsWith("blob:")) {
        urls[record.id] = record.photo; 
      } else {
        urls[record.id] = record.photo; // Already a valid URL
      }
    });

    setImageURLs(urls);

  }, [records]);

  return (
    <div className="w-full bg-white shadow-md rounded-lg overflow-hidden mt-8">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-800 text-white text-left">
            <th className="p-3">Name</th>
            <th className="p-3">Photo</th>
            <th className="p-3">Description</th>
            <th className="p-3">Department</th>
            <th className="p-3">Year</th>
            <th className="p-3">Date</th>
          </tr>
        </thead>
        <tbody>
          {records.length > 0 ? (
            records.map((record) => (
              <tr key={record.id} className="border-b hover:bg-gray-50 transition">
                <td className="p-3">{record.name}</td>
                <td className="p-3">
                  {imageURLs[record.id] ? (
                    <img
                      src={imageURLs[record.id]}
                      alt="Proof"
                      className="h-16 w-16 object-cover rounded cursor-pointer hover:scale-110 transition"
                      onClick={() => setSelectedImage(imageURLs[record.id])}
                    />
                  ) : (
                    <span className="text-gray-500">Image not available</span>
                  )}
                </td>
                <td className="p-3">{record.description}</td>
                <td className="p-3">{record.department}</td>
                <td className="p-3">{record.year}</td>
                <td className="p-3">{record.date}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className="p-3 text-center text-gray-500">
                No records found.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {selectedImage && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-50">
          <div className="relative p-4 bg-white rounded-lg shadow-lg">
            <button
              className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
              onClick={() => setSelectedImage(null)}
            >
              X
            </button>
            <img src={selectedImage} alt="Enlarged proof" className="max-w-full max-h-[80vh] rounded" />
          </div>
        </div>
      )}
    </div>
  );
};

CheatingRecordsList.propTypes = {
  records: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      photo: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired,
      department: PropTypes.string.isRequired,
      year: PropTypes.string.isRequired,
      date: PropTypes.string.isRequired,
    })
  ).isRequired,
};

export default CheatingRecordsList;
