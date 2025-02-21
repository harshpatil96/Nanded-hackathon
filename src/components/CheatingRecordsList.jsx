import PropTypes from "prop-types"; // Import PropTypes


const CheatingRecordsList = ({ records }) => {
  return (
    <div className="w-full bg-white shadow-md rounded-lg overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="bg-gray-800 text-white">
            <th className="p-3">Name</th>
            <th className="p-3">Photo</th>
            <th className="p-3">Description</th>
            <th className="p-3">Department</th>
            <th className="p-3">Year</th>
          </tr>
        </thead>
        <tbody>
          {records.length > 0 ? (
            records.map((record) => (
              <tr key={record.id} className="border-b hover:bg-gray-50 transition">
                <td className="p-3">{record.name}</td>
                <td className="p-3">
                  <img
                    src={record.photo}
                    alt="Proof"
                    className="h-16 w-16 object-cover rounded"
                  />
                </td>
                <td className="p-3">{record.description}</td>
                <td className="p-3">{record.department}</td>
                <td className="p-3">{record.year}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="p-3 text-center text-gray-500">
                No records found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

// Add PropTypes validation
CheatingRecordsList.propTypes = {
  records: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      photo: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired,
      department: PropTypes.string.isRequired,
      year: PropTypes.string.isRequired,
    })
  ).isRequired,
};

export default CheatingRecordsList;