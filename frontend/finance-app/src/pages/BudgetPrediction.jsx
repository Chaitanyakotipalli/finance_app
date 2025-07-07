import { useEffect, useState } from 'react';
import axios from 'axios';

function BudgetPrediction({ months = 12 }) {
    const [predictedBudgets, setPredictedBudgets] = useState(null);
    const user_id = localStorage.getItem("user_id");
    useEffect(() => {
        axios.get(`http://127.0.0.1:8000/analytics/predict_budget`, {
            params: { user_id, months }
            })
            .then(res => setPredictedBudgets(res.data))
            .catch(err => console.error("Prediction failed", err));
                        
    }, [months]);

    if (!predictedBudgets) {
        return <p className="text-gray-500 text-center">Loading budget predictions...</p>;
    }

    const totalBudget = Object.values(predictedBudgets).reduce((sum, val) => sum + val, 0);

    return (
        <div className="w-full px-16 py-6 mx-auto max-w-7xl">
            {/* Heading */}
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-blue-700 text-center flex justify-center items-center gap-2">
                📈 Next Month's Predicted Budget
            </h2>

            {/* Total */}
            <p className="text-lg font-bold text-green-700 mb-8 text-center flex justify-center items-center gap-2">
                🧾 Total Budget Prediction: ₹{totalBudget.toFixed(2)}
            </p>

            {/* Responsive Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
                {Object.entries(predictedBudgets).map(([category, amount]) => (
                    <div
                        key={category}
                        className="bg-white rounded-2xl shadow-lg p-6 sm:p-6 w-full max-w-[280px] mx-auto 
                                text-center border border-indigo-200 hover:scale-105 transition-transform"
                    >
                        <h3 className="text-lg font-semibold text-indigo-800 mb-2">{category}</h3>
                        <p className="text-2xl font-bold text-blue-800">₹{amount}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default BudgetPrediction;
