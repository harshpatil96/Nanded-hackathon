import { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  setDoc,
  onSnapshot,
  getDoc,
} from "firebase/firestore";
import { db, auth } from "../../firebase/firebaseConfig";
import VotingAnalysis from "../../components/VotingAnalysis"; // Import Voting Analysis Component

const VotingPage = () => {
  const [candidates, setCandidates] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [hasVoted, setHasVoted] = useState(false);
  const [votingPeriod, setVotingPeriod] = useState(null);
  const [isVotingOpen, setIsVotingOpen] = useState(false);
  const [countdown, setCountdown] = useState("");
  const [electionId, setElectionId] = useState(null); // Track the current election ID
  const [nextVotingPeriod, setNextVotingPeriod] = useState(null); // Track the next voting period
  const [winner, setWinner] = useState(null); // Track the winner of the election
  const [winners, setWinners] = useState([]); // Track all winners

  useEffect(() => {
    const fetchVotingPeriod = async () => {
      try {
        const electionsRef = collection(db, "elections");
        const querySnapshot = await getDocs(electionsRef);
        if (!querySnapshot.empty) {
          const elections = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          // Sort elections by voting date
          elections.sort((a, b) => new Date(a.votingDate) - new Date(b.votingDate));

          const currentDate = new Date();
          let nextElection = null;

          // Find the next election
          for (const election of elections) {
            const votingDate = new Date(election.votingDate);
            if (votingDate > currentDate) {
              nextElection = election;
              break;
            }
          }

          if (nextElection) {
            setNextVotingPeriod({
              date: nextElection.votingDate,
              startTime: nextElection.votingTime.start,
              endTime: nextElection.votingTime.end,
            });
          }

          // Set the current election (if voting is ongoing)
          const currentElection = elections.find((election) => {
            const startTime = new Date(`${election.votingDate}T${election.votingTime.start}`);
            const endTime = new Date(`${election.votingDate}T${election.votingTime.end}`);
            return currentDate >= startTime && currentDate <= endTime;
          });

          if (currentElection) {
            setElectionId(currentElection.id);
            setVotingPeriod({
              date: currentElection.votingDate,
              startTime: currentElection.votingTime.start,
              endTime: currentElection.votingTime.end,
            });
          }
        }
      } catch (error) {
        console.error("Error fetching voting period:", error);
        setError("Failed to fetch voting period. Please try again.");
      }
    };

    fetchVotingPeriod();
  }, []);

  useEffect(() => {
    const checkVotingPeriod = () => {
      if (votingPeriod) {
        const currentDate = new Date();
        const startTime = new Date(`${votingPeriod.date}T${votingPeriod.startTime}`);
        const endTime = new Date(`${votingPeriod.date}T${votingPeriod.endTime}`);

        if (currentDate >= startTime && currentDate <= endTime) {
          setIsVotingOpen(true); // Voting is open
          setCountdown(""); // Clear countdown when voting is open
        } else {
          setIsVotingOpen(false); // Voting is closed
          const timeUntilStart = startTime - currentDate;
          if (timeUntilStart > 0) {
            startCountdown(timeUntilStart); // Start countdown if voting hasn't started yet
          } else {
            setCountdown("Voting has ended."); // Show message if voting has ended
          }
        }
      }
    };

    const startCountdown = (timeUntilStart) => {
      const interval = setInterval(() => {
        const now = new Date().getTime();
        const distance = startTime - now;

        if (distance <= 0) {
          clearInterval(interval);
          setIsVotingOpen(true); // Voting is now open
          setCountdown("");
        } else {
          const days = Math.floor(distance / (1000 * 60 * 60 * 24));
          const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((distance % (1000 * 60)) / 1000);
          setCountdown(`${days}d ${hours}h ${minutes}m ${seconds}s`);
        }
      }, 1000);
    };

    checkVotingPeriod();
    const interval = setInterval(checkVotingPeriod, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [votingPeriod]); // Run this effect when votingPeriod changes

  useEffect(() => {
    const fetchAcceptedCandidates = async () => {
      try {
        const q = query(collection(db, "candidates"), where("status", "==", "Accepted"));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
          const candidatesData = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setCandidates(candidatesData);
        });

        return () => unsubscribe();
      } catch (error) {
        console.error("Error fetching candidates:", error);
        setError("Failed to fetch candidates. Please try again.");
      }
    };

    fetchAcceptedCandidates();
  }, []);

  useEffect(() => {
    const checkIfUserVoted = async () => {
      const user = auth.currentUser;
      if (!user) {
        setError("Please log in to vote.");
        return;
      }

      try {
        const userVoteQuery = query(
          collection(db, "votes"),
          where("userId", "==", user.uid),
          where("electionId", "==", electionId) // Check for the current election
        );
        const querySnapshot = await getDocs(userVoteQuery);
        if (!querySnapshot.empty) setHasVoted(true);
      } catch (error) {
        console.error("Error checking user vote:", error);
        setError("Failed to check voting status. Please try again.");
      }
    };

    if (electionId) {
      checkIfUserVoted();
    }
  }, [electionId]); // Run this effect when electionId changes

  const handleVote = async (candidateId, role) => {
    const user = auth.currentUser;
    if (!user) {
      setError("Please log in to vote.");
      return;
    }

    if (hasVoted) {
      setError("You have already voted for this election.");
      return;
    }

    try {
      // Check if the user has already voted for this role in the current election
      const userVoteQuery = query(
        collection(db, "votes"),
        where("userId", "==", user.uid),
        where("electionId", "==", electionId),
        where("role", "==", role)
      );
      const querySnapshot = await getDocs(userVoteQuery);
      if (!querySnapshot.empty) {
        setError("You have already voted for this role in this election.");
        return;
      }

      // Submit the vote
      const voteRef = doc(collection(db, "votes"));
      await setDoc(voteRef, {
        userId: user.uid,
        candidateId: candidateId,
        electionId: electionId, // Track the election ID
        role: role, // Track the role
        votedAt: new Date().toISOString(),
      });

      // Update the candidate's vote count
      const candidateRef = doc(db, "candidates", candidateId);
      const candidateDoc = await getDoc(candidateRef);
      const currentVotes = candidateDoc.data().votes || 0;

      await setDoc(candidateRef, { votes: currentVotes + 1 }, { merge: true });

      setSuccess("Your vote has been submitted successfully!");
      setHasVoted(true);
    } catch (error) {
      console.error("Error submitting vote:", error);
      setError("Failed to submit vote. Please try again.");
    }
  };

  // Filter candidates for the current election
  const filteredCandidates = candidates.filter(
    (candidate) => candidate.electionId === electionId
  );

  // Calculate the winner after voting ends
  useEffect(() => {
    if (!isVotingOpen && filteredCandidates.length > 0) {
      let maxVotes = 0;
      let winnerCandidate = null;

      filteredCandidates.forEach((candidate) => {
        if (candidate.votes > maxVotes) {
          maxVotes = candidate.votes;
          winnerCandidate = candidate;
        }
      });

      setWinner(winnerCandidate);
    }
  }, [isVotingOpen, filteredCandidates]);

  // Fetch all winners from past elections
  useEffect(() => {
    const fetchWinners = async () => {
      try {
        const votesRef = collection(db, "votes");
        const votesSnapshot = await getDocs(votesRef);
        const votesData = votesSnapshot.docs.map((doc) => doc.data());

        const winnersMap = new Map();

        votesData.forEach((vote) => {
          const { electionId, candidateId, role } = vote;
          const key = `${electionId}-${role}`;

          if (!winnersMap.has(key)) {
            winnersMap.set(key, { electionId, role, candidateId, votes: 0 });
          }

          winnersMap.get(key).votes += 1;
        });

        const winnersList = [];
        winnersMap.forEach((value) => {
          const candidate = candidates.find((c) => c.id === value.candidateId);
          if (candidate) {
            winnersList.push({ ...candidate, role: value.role, votes: value.votes });
          }
        });

        setWinners(winnersList);
      } catch (error) {
        console.error("Error fetching winners:", error);
        setError("Failed to fetch winners. Please try again.");
      }
    };

    fetchWinners();
  }, [candidates]);

  // Countdown for next voting period
  useEffect(() => {
    if (nextVotingPeriod && !isVotingOpen) {
      const startTime = new Date(`${nextVotingPeriod.date}T${nextVotingPeriod.startTime}`);
      const interval = setInterval(() => {
        const now = new Date().getTime();
        const distance = startTime - now;

        if (distance <= 0) {
          clearInterval(interval);
          setCountdown("Voting is open!");
        } else {
          const days = Math.floor(distance / (1000 * 60 * 60 * 24));
          const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((distance % (1000 * 60)) / 1000);
          setCountdown(`${days}d ${hours}h ${minutes}m ${seconds}s`);
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [nextVotingPeriod, isVotingOpen]);

  return (
    <div className="min-h-screen bg-gradient-to-r from-gray-50 to-gray-100 flex flex-col items-center p-6">
      <h1 className="text-3xl font-bold text-blue-800 mb-6">Vote for Candidates</h1>

      {error && <div className="bg-red-100 text-red-700 px-4 py-3 rounded mb-4 w-full max-w-4xl">{error}</div>}
      {success && <div className="bg-green-100 text-green-700 px-4 py-3 rounded mb-4 w-full max-w-4xl">{success}</div>}

      {/* Show countdown or voting content based on voting status */}
      {!isVotingOpen ? (
        <div className="text-center">
          <h2 className="text-2xl font-bold text-blue-800 mb-4">Next Voting Countdown</h2>
          {nextVotingPeriod ? (
            <p className="text-gray-700 text-xl">{countdown}</p>
          ) : (
            <p className="text-gray-700 text-xl">No upcoming elections.</p>
          )}

          {/* Display winners list before and after voting */}
          {winners.length > 0 && (
            <div className="mt-8 w-full max-w-6xl">
              <h2 className="text-3xl font-bold text-blue-800 mb-6 text-center">🏆 Past Election Winners 🏆</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {winners.map((winner, index) => (
                  <div
                    key={index}
                    className="bg-gradient-to-r from-purple-500 to-indigo-500 p-6 rounded-lg shadow-lg text-white hover:shadow-xl transition-shadow duration-300"
                  >
                    <h3 className="text-2xl font-semibold mb-2">{winner.name}</h3>
                    <p className="text-lg">
                      <strong>Role:</strong> {winner.role}
                    </p>
                    <p className="text-lg">
                      <strong>Votes:</strong> {winner.votes || 0}
                    </p>
                    <p className="text-lg">
                      <strong>Branch:</strong> {winner.branch}
                    </p>
                    <p className="text-lg">
                      <strong>Course Year:</strong> {winner.courseYear}
                    </p>
                    <p className="text-lg">
                      <strong>CGPA:</strong> {winner.cgpa}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Voting Analysis Component */}
          <VotingAnalysis candidates={filteredCandidates} />

          <div className="w-full max-w-6xl">
            <h2 className="text-2xl font-bold text-blue-800 mb-6 text-center">Candidates</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCandidates.length === 0 ? (
                <p className="text-gray-600">No candidates available for voting.</p>
              ) : (
                filteredCandidates.map((candidate) => (
                  <div
                    key={candidate.id}
                    className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
                  >
                    <h3 className="text-xl font-bold text-blue-800 mb-2">{candidate.name}</h3>
                    <p className="text-gray-700 mb-1">
                      <strong>Role:</strong> {candidate.role}
                    </p>
                    <p className="text-gray-700 mb-1">
                      <strong>Branch:</strong> {candidate.branch}
                    </p>
                    <p className="text-gray-700 mb-1">
                      <strong>Course Year:</strong> {candidate.courseYear}
                    </p>
                    <p className="text-gray-700 mb-1">
                      <strong>CGPA:</strong> {candidate.cgpa}
                    </p>
                    <p className="text-gray-700 mb-1">
                      <strong>Votes:</strong> {candidate.votes || 0}
                    </p>
                    <button
                      onClick={() => handleVote(candidate.id, candidate.role)}
                      disabled={hasVoted}
                      className={`mt-4 w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 ${
                        hasVoted ? "opacity-50 cursor-not-allowed" : "hover:scale-105"
                      }`}
                    >
                      {hasVoted ? "Voted" : "Vote"}
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}

      {/* Display the winner after voting ends */}
      {!isVotingOpen && winner && (
        <div className="mt-8 w-full max-w-4xl bg-gradient-to-r from-purple-500 to-indigo-500 p-6 rounded-lg shadow-lg text-white text-center">
          <h2 className="text-3xl font-bold mb-4">🏆 Election Winner 🏆</h2>
          <h3 className="text-2xl font-semibold mb-2">{winner.name}</h3>
          <p className="text-lg">
            <strong>Role:</strong> {winner.role}
          </p>
          <p className="text-lg">
            <strong>Votes:</strong> {winner.votes || 0}
          </p>
          <p className="text-lg">
            <strong>Branch:</strong> {winner.branch}
          </p>
          <p className="text-lg">
            <strong>Course Year:</strong> {winner.courseYear}
          </p>
          <p className="text-lg">
            <strong>CGPA:</strong> {winner.cgpa}
          </p>
        </div>
      )}
    </div>
  );
};

export default VotingPage;