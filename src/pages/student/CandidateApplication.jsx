import { useState, useEffect } from "react";
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";
import { db, auth } from "../../firebase/firebaseConfig";
import { useNavigate } from "react-router-dom";

const CandidateApplication = () => {
  const [elections, setElections] = useState([]);
  const [selectedElection, setSelectedElection] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    rollNumber: "",
    email: "",
    mobile: "",
    courseYear: "",
    branch: "",
    cgpa: "",
    whyApply: "",
    goals: "",
    role: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [view, setView] = useState("upcoming");
  const [totalApplications, setTotalApplications] = useState([]);
  const [userApplications, setUserApplications] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchElections = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "elections"));
        const electionsData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setElections(electionsData);
      } catch (error) {
        console.error("Error fetching elections:", error);
        setError("Failed to fetch elections. Please try again.");
      }
    };

    fetchElections();
  }, []);

  useEffect(() => {
    if (view === "your") {
      fetchUserApplications();
    }
  }, [view]);

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      setFormData((prevFormData) => ({
        ...prevFormData,
        email: user.email,
      }));
    }
  }, []);

  const fetchTotalApplications = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "candidates"));
      const applicationsData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setTotalApplications(applicationsData);
    } catch (error) {
      console.error("Error fetching total applications:", error);
      setError("Failed to fetch total applications. Please try again.");
    }
  };

  const fetchUserApplications = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        setError("Please log in to view your applications.");
        return;
      }

      const q = query(collection(db, "candidates"), where("email", "==", user.email));
      const querySnapshot = await getDocs(q);
      const applicationsData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setUserApplications(applicationsData);
    } catch (error) {
      console.error("Error fetching user applications:", error);
      setError("Failed to fetch your applications. Please try again.");
    }
  };

  const handleViewChange = (newView) => {
    setView(newView);
    setSelectedElection(null);
    if (newView === "total") {
      fetchTotalApplications();
    }
  };

  const handleApplyClick = (election) => {
    setSelectedElection(election);
    setFormData((prevFormData) => ({
      ...prevFormData,
      role: election.role,
    }));
    setView("apply");
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!selectedElection) {
      setError("No election selected.");
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      setError("Please log in to submit an application.");
      return;
    }

    try {
      await addDoc(collection(db, "candidates"), {
        ...formData,
        userId: user.uid,
        email: user.email,
        electionId: selectedElection.id,
        electionName: selectedElection.name,
        role: selectedElection.role,
        status: "Pending",
        appliedAt: new Date().toISOString(),
      });
      setSuccess("Application submitted successfully!");
      setFormData({
        name: "",
        rollNumber: "",
        email: user.email,
        mobile: "",
        courseYear: "",
        branch: "",
        cgpa: "",
        whyApply: "",
        goals: "",
        role: "",
      });
      await fetchUserApplications();
      setTimeout(() => {
        setView("your");
      }, 2000);
    } catch (error) {
      console.error("Error submitting application:", error);
      setError("Failed to submit application. Please try again.");
    }
  };

  const renderApplicationStatus = (application) => {
    const statusColors = {
      Pending: "bg-yellow-100 text-yellow-800",
      Approved: "bg-green-100 text-green-800",
      Rejected: "bg-red-100 text-red-800",
    };

    return (
      <div key={application.id} className="bg-white rounded-lg shadow-lg p-6 mb-4 transition-transform transform hover:scale-105 ease-in-out duration-300 hover:shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-blue-800">{application.electionName}</h3>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[application.status]}`}>
            {application.status}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-gray-600">Name</p>
            <p className="font-medium">{application.name}</p>
          </div>
          <div>
            <p className="text-gray-600">Roll Number</p>
            <p className="font-medium">{application.rollNumber}</p>
          </div>
          <div>
            <p className="text-gray-600">Email</p>
            <p className="font-medium">{application.email}</p>
          </div>
          <div>
            <p className="text-gray-600">Mobile</p>
            <p className="font-medium">{application.mobile}</p>
          </div>
          <div>
            <p className="text-gray-600">Branch</p>
            <p className="font-medium">{application.branch}</p>
          </div>
          <div>
            <p className="text-gray-600">Course Year</p>
            <p className="font-medium">{application.courseYear}</p>
          </div>
          <div>
            <p className="text-gray-600">CGPA</p>
            <p className="font-medium">{application.cgpa}</p>
          </div>
          <div>
            <p className="text-gray-600">Role</p>
            <p className="font-medium">{application.role}</p>
          </div>
          <div>
            <p className="text-gray-600">Applied On</p>
            <p className="font-medium">
              {new Date(application.appliedAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="mt-4">
          <p className="text-gray-600">Why Apply</p>
          <p className="mt-1 text-gray-800">{application.whyApply}</p>
        </div>
        <div className="mt-4">
          <p className="text-gray-600">Goals</p>
          <p className="mt-1 text-gray-800">{application.goals}</p>
        </div>
      </div>
    );
  };

  const handleGiveVoteClick = () => {
    navigate("/voting");
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-gray-100 to-white flex flex-col items-center p-6">
      <button
        onClick={handleGiveVoteClick}
        className="fixed right-6 top-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-xl flex items-center space-x-2"
      >
        <span>Give Vote !</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      <div className="flex gap-4 mb-6 mt-4">
        <button
          onClick={() => handleViewChange("upcoming")}
          className={`px-6 py-3 rounded-lg font-semibold transition-transform transform hover:scale-110 ease-in-out duration-300 ${
            view === "upcoming" ? "bg-blue-600 text-white shadow-lg" : "bg-gray-200 text-gray-700 shadow"
          }`}
        >
          Upcoming Elections
        </button>
        <button
          onClick={() => handleViewChange("total")}
          className={`px-6 py-3 rounded-lg font-semibold transition-transform transform hover:scale-110 ease-in-out duration-300 ${
            view === "total" ? "bg-blue-600 text-white shadow-lg" : "bg-gray-200 text-gray-700 shadow"
          }`}
        >
          Total Applications
        </button>
        <button
          onClick={() => handleViewChange("your")}
          className={`px-6 py-3 rounded-lg font-semibold transition-transform transform hover:scale-110 ease-in-out duration-300 ${
            view === "your" ? "bg-blue-600 text-white shadow-lg" : "bg-gray-200 text-gray-700 shadow"
          }`}
        >
          Your Applications
        </button>
      </div>

      {error && <div className="bg-red-100 text-red-700 px-4 py-3 rounded mb-4 w-full max-w-4xl">{error}</div>}
      {success && <div className="bg-green-100 text-green-700 px-4 py-3 rounded mb-4 w-full max-w-4xl">{success}</div>}

      {view === "upcoming" && (
        <>
          <h1 className="text-3xl font-bold text-blue-800 mb-6">Upcoming Elections</h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {elections.map((election) => (
              <div key={election.id} className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 transform hover:scale-105">
                <h3 className="text-xl font-bold text-blue-800 mb-2">{election.name}</h3>
                <p className="text-gray-700 mb-1"><strong>Role:</strong> {election.role}</p>
                <p className="text-gray-700 mb-1"><strong>Application Dates:</strong> {election.applicationDates.start} to {election.applicationDates.end}</p>
                <p className="text-gray-700 mb-1"><strong>Voting Date:</strong> {election.votingDate}</p>
                <button
                  onClick={() => handleApplyClick(election)}
                  className="mt-4 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors duration-300 shadow-md hover:shadow-lg"
                >
                  Apply
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      {view === "total" && (
        <>
          <h1 className="text-3xl font-bold text-blue-800 mb-6">Total Applications</h1>
          <div className="w-full max-w-4xl overflow-x-auto">
            <table className="min-w-full bg-white rounded-lg shadow-md">
              <thead>
                <tr>
                  <th className="px-6 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Election
                  </th>
                  <th className="px-6 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {totalApplications.map((application) => (
                  <tr key={application.id} className="hover:bg-gray-50 transition-colors duration-200">
                    <td className="px-6 py-4 border-b border-gray-200">{application.name}</td>
                    <td className="px-6 py-4 border-b border-gray-200">{application.electionName}</td>
                    <td className="px-6 py-4 border-b border-gray-200">{application.role}</td>
                    <td className="px-6 py-4 border-b border-gray-200">
                      <span className={`px-2 py-1 rounded-full text-sm ${statusColors[application.status]}`}>
                        {application.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {view === "your" && (
        <>
          <h1 className="text-3xl font-bold text-blue-800 mb-6">Your Applications</h1>
          <div className="w-full max-w-4xl">
            {userApplications.length === 0 ? (
              <div className="bg-white p-6 rounded-lg shadow-md text-center">
                <p className="text-gray-600">You haven't submitted any applications yet.</p>
                <button
                  onClick={() => handleViewChange("upcoming")}
                  className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-300 shadow-md hover:shadow-lg"
                >
                  View Upcoming Elections
                </button>
              </div>
            ) : (
              userApplications.map(renderApplicationStatus)
            )}
          </div>
        </>
      )}

      {view === "apply" && selectedElection && (
        <div className="mt-8 bg-white p-8 rounded-lg shadow-xl w-full max-w-2xl">
          <h2 className="text-2xl font-bold text-blue-800 mb-4">Apply for {selectedElection.name}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            {Object.keys(formData).map((key) => (
              <div key={key}>
                <label className="block text-gray-700 font-medium mb-1">
                  {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, " $1").trim()}
                </label>
                {key === "whyApply" || key === "goals" ? (
                  <textarea
                    name={key}
                    value={formData[key]}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={4}
                    required
                  />
                ) : (
                  <input
                    type={key === "email" ? "email" : key === "mobile" ? "tel" : "text"}
                    name={key}
                    value={formData[key]}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    disabled={key === "email" || key === "role"}
                  />
                )}
              </div>
            ))}
            <div className="flex gap-4">
              <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors duration-300 shadow-md hover:shadow-lg">
                Submit Application
              </button>
              <button
                type="button"
                onClick={() => handleViewChange("upcoming")}
                className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition-colors duration-300 shadow-md hover:shadow-lg"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default CandidateApplication;