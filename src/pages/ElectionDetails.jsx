import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { db, auth } from "../firebase/firebaseConfig.js"; // Import Firebase config
import { doc, getDoc, collection, query, where, getDocs, updateDoc, arrayUnion } from "firebase/firestore";

const ElectionDetails = () => {
    const { electionId } = useParams(); // Get election ID from URL params
    const [election, setElection] = useState(null);
    const [candidates, setCandidates] = useState([]);
    const [userVote, setUserVote] = useState(null);
    const user = auth.currentUser; // Get the logged-in user

    useEffect(() => {
        if (!electionId) return;

        const fetchElectionDetails = async () => {
            try {
                const electionDoc = await getDoc(doc(db, "elections", electionId));
                if (electionDoc.exists()) {
                    setElection({ id: electionDoc.id, ...electionDoc.data() });
                }

                // Fetch Candidates for the Election
                const q = query(collection(db, "candidates"), where("electionId", "==", electionId));
                const candidatesSnapshot = await getDocs(q);
                setCandidates(candidatesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

                // Check if user has already voted
                if (user) {
                    const userVoteDoc = await getDoc(doc(db, "votes", user.uid));
                    if (userVoteDoc.exists() && userVoteDoc.data()[electionId]) {
                        setUserVote(userVoteDoc.data()[electionId]); // Store voted candidate ID
                    }
                }
            } catch (error) {
                console.error("Error fetching election details:", error);
            }
        };

        fetchElectionDetails();
    }, [electionId, user]);

    const handleVote = async (candidateId) => {
        if (!user) {
            alert("Please log in to vote.");
            return;
        }

        try {
            const userVoteRef = doc(db, "votes", user.uid);
            const candidateRef = doc(db, "candidates", candidateId);

            // Store user's vote
            await updateDoc(userVoteRef, { [electionId]: candidateId });

            // Increment candidate's vote count
            await updateDoc(candidateRef, { votes: arrayUnion(user.uid) });

            setUserVote(candidateId); // Disable vote button after voting
        } catch (error) {
            console.error("Error voting:", error);
        }
    };

    if (!election) return <p>Loading election details...</p>;

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold">{election.name}</h1>
            <p className="text-lg text-gray-600">Role: {election.role}</p>
            <p className="text-lg text-gray-600">Voting Date: {election.votingDate}</p>
            <p className="text-lg text-gray-600">
                Voting Time: {election.votingTime?.start} - {election.votingTime?.end}
            </p>
            <div className="mt-4 flex gap-4">
                <button className="bg-green-500 hover:bg-green-700 text-white px-4 py-2 rounded">
                    Apply Now
                </button>
                <button 
                    className="bg-blue-500 hover:bg-blue-700 text-white px-4 py-2 rounded"
                    disabled={userVote !== null}
                    onClick={() => alert("Redirecting to voting section...")}
                >
                    {userVote ? "Voted" : "Vote"}
                </button>
            </div>
            

            <h2 className="text-2xl font-semibold mt-6">Candidates</h2>
            <div className="mt-4">
                {candidates.map((candidate) => (
                    <div key={candidate.id} className="border p-4 rounded-lg shadow-md mb-4">
                        <h3 className="text-xl font-bold">{candidate.name}</h3>
                        <p className="text-gray-700">{candidate.campaignDetails}</p>
                        <button
                            className={`mt-2 px-4 py-2 rounded text-white ${userVote ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-700"
                                }`}
                            onClick={() => handleVote(candidate.id)}
                            disabled={userVote !== null}
                        >
                            {userVote ? "Voted" : "Vote"}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ElectionDetails;
