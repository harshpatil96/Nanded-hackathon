import React, { useState, useEffect } from "react";
import { collection, addDoc, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";

const ContestElections = () => {
  const [electionName, setElectionName] = useState("");
  const [roles, setRoles] = useState([]);
  const [applicationDates, setApplicationDates] = useState({ start: "", end: "" });
  const [votingDate, setVotingDate] = useState("");
  const [votingTime, setVotingTime] = useState({ start: "", end: "" });
  const [error, setError] = useState("");
  const [elections, setElections] = useState([]);

  // Fetch elections from Firestore
  const fetchElections = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "elections"));
      const electionsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setElections(electionsData);
    } catch (error) {
      console.error("Error fetching elections:", error);
      setError("Failed to fetch elections. Please try again.");
    }
  };

  useEffect(() => {
    fetchElections();
  }, []);

  // Handle delete election
  const handleDeleteElection = async (electionId) => {
    try {
      // Show confirmation dialog
      const confirmDelete = window.confirm("Are you sure you want to delete this election?");
      
      if (confirmDelete) {
        // Delete the document from Firestore
        await deleteDoc(doc(db, "elections", electionId));
        
        // Update the local state by removing the deleted election
        setElections(elections.filter(election => election.id !== electionId));
        
        // Show success message
        alert("Election deleted successfully!");
      }
    } catch (error) {
      console.error("Error deleting election:", error);
      setError("Failed to delete election. Please try again.");
    }
  };

  // Handle role selection
  const handleRoleChange = (role) => {
    setRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!electionName || roles.length === 0 || !applicationDates.start || !applicationDates.end || !votingDate || !votingTime.start || !votingTime.end) {
      setError("Please fill all required fields.");
      return;
    }
  
    try {
      const electionPromises = roles.map(async (role) => {
        return addDoc(collection(db, "elections"), {
          name: electionName,
          role: role,
          applicationDates: applicationDates,
          votingDate: votingDate,
          votingTime: votingTime,
        });
      });
  
      await Promise.all(electionPromises);
      alert("Election created successfully!");
  
      setElectionName("");
      setRoles([]);
      setApplicationDates({ start: "", end: "" });
      setVotingDate("");
      setVotingTime({ start: "", end: "" });
      setError("");
  
      // Refresh elections list
      await fetchElections();
    } catch (error) {
      console.error("Error adding document: ", error);
      setError("Failed to create election. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center p-6">
      {/* Create Election Form */}
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-2xl transform transition-all duration-300 hover:shadow-2xl mb-8">
        <h1 className="text-3xl font-bold text-blue-800 mb-6 text-center">Create Election</h1>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Election Name */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">Election Name</label>
            <input
              type="text"
              value={electionName}
              onChange={(e) => setElectionName(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter election name"
              required
            />
          </div>

          {/* Select Roles */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">Select Roles</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {["President", "Vice President", "General Secretary", "Treasurer", "Cultural Secretary", "Sports Secretary"].map((role) => (
                <div key={role} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={roles.includes(role)}
                    onChange={() => handleRoleChange(role)}
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label className="ml-2 text-gray-700">{role}</label>
                </div>
              ))}
            </div>
          </div>

          {/* Application Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-700 font-medium mb-2">Application Start Date</label>
              <input
                type="date"
                value={applicationDates.start}
                onChange={(e) => setApplicationDates({ ...applicationDates, start: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">Application End Date</label>
              <input
                type="date"
                value={applicationDates.end}
                onChange={(e) => setApplicationDates({ ...applicationDates, end: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          {/* Voting Date */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">Voting Date</label>
            <input
              type="date"
              value={votingDate}
              onChange={(e) => setVotingDate(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Voting Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-700 font-medium mb-2">Voting Start Time</label>
              <input
                type="time"
                value={votingTime.start}
                onChange={(e) => setVotingTime({ ...votingTime, start: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">Voting End Time</label>
              <input
                type="time"
                value={votingTime.end}
                onChange={(e) => setVotingTime({ ...votingTime, end: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg shadow-md transition-transform transform hover:scale-105"
          >
            Create Election
          </button>
        </form>
      </div>

      {/* Upcoming Elections */}
      <div className="w-full max-w-6xl">
        <h2 className="text-2xl font-bold text-blue-800 mb-6">Upcoming Elections</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {elections.map((election) => (
            <div
              key={election.id}
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
            >
              <h3 className="text-xl font-bold text-blue-800 mb-2">{election.name}</h3>
              <p className="text-gray-700 mb-1">
                <strong>Role:</strong> {election.role}
              </p>
              <p className="text-gray-700 mb-1">
                <strong>Application Dates:</strong> {election.applicationDates.start} to{" "}
                {election.applicationDates.end}
              </p>
              <p className="text-gray-700 mb-1">
                <strong>Voting Date:</strong> {election.votingDate}
              </p>
              <p className="text-gray-700 mb-1">
                <strong>Voting Time:</strong> {election.votingTime.start} - {election.votingTime.end}
              </p>
              <button
                onClick={() => handleDeleteElection(election.id)}
                className="mt-4 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg shadow-md transition-transform transform hover:scale-105"
              >
                Delete Election
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ContestElections;