import { useState } from 'react';
import axios from 'axios';

function BudgetRecommendations() {
    const [months, setMonths] = useState();
    const [saving, setSaving] = useState();
    const [recommendation, setRecommendation] = useState(null);
    const [error, setError] = useState("");
    const user_id = localStorage.getItem("user_id");
    const fetchRecommendations = async () => {
        try {
            const res = await axios.get("http://127.0.0.1:8000/analytics/recommend_budget", {
                params: {
                    months,
                    target_saving: saving,
                    user_id
                }
            });
            setRecommendation(res.data);
            setError("");
        } catch (err) {
            console.error("Failed to fetch recommendations", err);
            setError(err?.response?.data?.detail || "Something went wrong.");
            setRecommendation(null);
        }
    };

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">💡 Budget Recommendations</h2>

            <div className="flex flex-col md:flex-row gap-4 mb-4 text-black-700">
                <div className="flex  gap-4 mb-4 text-black-700">
                    <input
                        type="number"
                        className="border p-1 text-sm rounded w-40"
                        placeholder="Enter Months"
                        value={months}
                        onChange={e => setMonths(e.target.value)}
                    />
                    <input
                        type="number"
                        className="border p-1 text-sm rounded w-40"
                        placeholder="Target Saving (e.g., 2000)"
                        value={saving}
                        onChange={e => setSaving(e.target.value)}
                    />
                </div>
                <div className="flex  gap-4 mb-4 text-black-700">
                    <button
                        className="bg-blue-700 text-indigo-700 text-sm px-3 py-1 rounded hover:bg-blue-200 transition"
                        onClick={fetchRecommendations}
                    >
                        Get Recommendations
                    </button>
                </div>
            </div>

            {error && <p className="text-red-600 font-medium">{error}</p>}

            {recommendation && (
                <div>
                    <p className="text-black-700 mb-2">
                        📆 Based on the past <strong>{recommendation.months_considered}</strong> months, your average spending is ₹<strong>{recommendation.total_spent}</strong>. After saving ₹<strong>{recommendation.target_saving}</strong>, here's your suggested budget:
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Object.entries(recommendation.recommended_budget).map(([category, amount]) => (
                            <div key={category} className="bg-blue-100 p-4 rounded-xl shadow">
                                <h3 className="text-lg font-semibold">{category}</h3>
                                <p className="text-xl font-bold text-blue-700">₹{amount}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default BudgetRecommendations;
