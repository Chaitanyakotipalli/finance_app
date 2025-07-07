import { useState, useEffect } from 'react';
import axios from 'axios';

function MonthlyLimit() {
    const [limit, setLimit] = useState(() => {
        return parseFloat(localStorage.getItem("monthlyLimit")) || 10000;
    });
    const [spent, setSpent] = useState(null);
    const user_id = localStorage.getItem("user_id");
    useEffect(() => {
        axios.get("http://127.0.0.1:8000/analytics/monthly_spending",{params:{user_id}})
            .then(res => setSpent(res.data.total_spent))
            .catch(err => console.error("Failed to fetch spending", err));
    }, []);

    const handleLimitChange = (e) => {
        const val = parseFloat(e.target.value) || 0;
        setLimit(val);
        localStorage.setItem("monthlyLimit", val);
    };

    const remaining = spent !== null ? limit - spent : null;
    const percentage = spent !== null ? Math.min((spent / limit) * 100, 100) : 0;

    const statusColor = () => {
        if (remaining === null) return "bg-gray-400";
        if (remaining < 0) return "bg-red-500";
        if (percentage > 85) return "bg-yellow-500";
        return "bg-green-500";
    };

    return (
        <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-200 w-full max-w-xl mx-auto">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">💰 Monthly Expense Limit</h2>

            <div className="mb-4">
                <label className="text-gray-700 font-medium text-sm mb-1 block">Set your monthly limit (₹):</label>
                <input
                    type="number"
                    value={limit}
                    onChange={handleLimitChange}
                    className="w-40 p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            {spent !== null && (
                <div>
                    <div className="flex justify-between items-center mb-2 text-sm text-gray-600">
                        <span>Spent: ₹{spent.toFixed(2)}</span>
                        <span>Limit: ₹{limit.toFixed(2)}</span>
                    </div>

                    <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden mb-3">
                        <div
                            className={`h-full ${statusColor()} transition-all duration-700 ease-out`}
                            style={{ width: `${percentage}%` }}
                        ></div>
                    </div>

                    {remaining >= 0 ? (
                        <p className="text-green-700 font-medium">
                            ✅ You have ₹{remaining.toFixed(2)} left in your budget.
                        </p>
                    ) : (
                        <p className="text-red-600 font-semibold">
                            ⚠️ Over limit by ₹{Math.abs(remaining).toFixed(2)}!
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}

export default MonthlyLimit;
