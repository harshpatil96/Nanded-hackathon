import { useState, useEffect } from "react";
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";
import { db, auth } from "../../firebase/firebaseConfig";

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
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [view, setView] = useState("upcoming");
  const [totalApplications, setTotalApplications] = useState([]);
  const [userApplications, setUserApplications] = useState([]);

  // Fetch elections on component mount
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

  // Fetch user applications on component mount and when view changes to "your"
  useEffect(() => {
    if (view === "your") {
      fetchUserApplications();
    }
  }, [view]);

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
        status: "Pending",
        appliedAt: new Date().toISOString(),
      });
      setSuccess("Application submitted successfully!");
      setFormData({
        name: "",
        rollNumber: "",
        email: "",
        mobile: "",
        courseYear: "",
        branch: "",
        cgpa: "",
        whyApply: "",
        goals: "",
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
      <div key={application.id} className="bg-white rounded-lg shadow-md p-6 mb-4">
        <div className="flex justify-between items-start mb-4">
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

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center p-6">
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => handleViewChange("upcoming")}
          className={`px-6 py-2 rounded-lg ${
            view === "upcoming" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"
          }`}
        >
          Upcoming Elections
        </button>
        <button
          onClick={() => handleViewChange("total")}
          className={`px-6 py-2 rounded-lg ${
            view === "total" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"
          }`}
        >
          Total Applications
        </button>
        <button
          onClick={() => handleViewChange("your")}
          className={`px-6 py-2 rounded-lg ${
            view === "your" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"
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
              <div key={election.id} className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-bold text-blue-800 mb-2">{election.name}</h3>
                <p className="text-gray-700 mb-1"><strong>Role:</strong> {election.role}</p>
                <p className="text-gray-700 mb-1"><strong>Application Dates:</strong> {election.applicationDates.start} to {election.applicationDates.end}</p>
                <p className="text-gray-700 mb-1"><strong>Voting Date:</strong> {election.votingDate}</p>
                <button
                  onClick={() => handleApplyClick(election)}
                  className="mt-4 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg"
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
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {totalApplications.map((application) => (
                  <tr key={application.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 border-b border-gray-200">{application.name}</td>
                    <td className="px-6 py-4 border-b border-gray-200">{application.electionName}</td>
                    <td className="px-6 py-4 border-b border-gray-200">
                      <span className={`px-2 py-1 rounded-full text-sm ${
                        application.status === "Pending" ? "bg-yellow-100 text-yellow-800" :
                        application.status === "Approved" ? "bg-green-100 text-green-800" :
                        "bg-red-100 text-red-800"
                      }`}>
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
                <p className="text-gray-600">You haven&apos;t submitted any applications yet.</p>
                <button
                  onClick={() => handleViewChange("upcoming")}
                  className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
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
                    className="w-full px-4 py-2 border rounded-lg"
                    rows={4}
                    required
                  />
                ) : (
                  <input
                    type={key === "email" ? "email" : key === "mobile" ? "tel" : "text"}
                    name={key}
                    value={formData[key]}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg"
                    required
                  />
                )}
              </div>
            ))}
            <div className="flex gap-4">
              <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
                Submit Application
              </button>
              <button
                type="button"
                onClick={() => handleViewChange("upcoming")}
                className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300"
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