import PropTypes from "prop-types"; // Import PropTypes
import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  Title,
} from "chart.js";

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend, Title);

const VotingAnalysis = ({ candidates }) => {
  const chartData = {
    labels: candidates.map((candidate) => candidate.name),
    datasets: [
      {
        label: "Votes",
        data: candidates.map((candidate) => candidate.votes || 0),
        backgroundColor: [
          "rgba(255, 99, 132, 0.6)",
          "rgba(54, 162, 235, 0.6)",
          "rgba(255, 206, 86, 0.6)",
          "rgba(75, 192, 192, 0.6)",
          "rgba(153, 102, 255, 0.6)",
          "rgba(255, 159, 64, 0.6)",
        ],
        borderColor: [
          "rgba(255, 99, 132, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(75, 192, 192, 1)",
          "rgba(153, 102, 255, 1)",
          "rgba(255, 159, 64, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top" },
      title: { display: true, text: "Voting Analysis", font: { size: 18 } },
    },
  };

  return (
    <div className="w-full max-w-4xl mb-8 bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-blue-800 mb-6 text-center">
        Voting Analysis
      </h2>
      <div className="w-full h-96 mx-auto">
        <Pie data={chartData} options={chartOptions} />
      </div>
    </div>
  );
};

// ✅ Add PropTypes validation
VotingAnalysis.propTypes = {
  candidates: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      votes: PropTypes.number,
    })
  ).isRequired,
};

export default VotingAnalysis;
