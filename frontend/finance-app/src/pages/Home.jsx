import { useEffect, useState } from 'react';
import axios from 'axios';
import BudgetPrediction from './BudgetPrediction.jsx';
import BudgetRecommendations from './BudgetRecommendations.jsx';
import MonthlyLimit from './MonthlyLimit.jsx';
import Icon from '../components/icon';
import '../App.css';

function Home() {
    const [dateAnalysis, setDateAnalysis] = useState([]);
    const [trends, setTrends] = useState(null);
    const [periodicTrends, setPeriodicTrends] = useState(null);
    const user_id = localStorage.getItem("user_id");
    const periodColors = {
        day: "from-indigo-500 to-indigo-600",
        week: "from-amber-500 to-orange-500",
        month: "from-blue-500 to-blue-600",
        year: "from-purple-500 to-purple-600"
    };

    const periodIcons = {
        day: '🕒',
        week: '📆',
        month: '🗓️',
        year: '📊'
    };

    useEffect(() => {
        axios.all([
            axios.get('http://127.0.0.1:8000/analytics/all',{params:{user_id}}),
            axios.get('http://127.0.0.1:8000/analytics/trends',{params:{user_id}})
        ])
        .then(([allRes, trendRes]) => {
            const expenseData = allRes.data.date.filter(d => d.type_ === 'Expense');
            setDateAnalysis(expenseData);
            setTrends(getTrendInsights(expenseData));
            setPeriodicTrends(trendRes.data);
        })
        .catch(err => console.error("Failed to fetch analytics", err));
    }, []);

    const getTrendInsights = (expenses) => {
        if (expenses.length === 0) {
            return {
                highest: { category: "-", total: 0 },
                lowest: { category: "-", total: 0 },
                mostFrequentCategory: "-",
                maxSpendingDay: "-"
            };
        }

        let highest = expenses[0], lowest = expenses[0];
        const categoryCount = {}, dateTotals = {};

        for (const e of expenses) {
            if (e.total > highest.total) highest = e;
            if (e.total < lowest.total) lowest = e;
            categoryCount[e.category] = (categoryCount[e.category] || 0) + 1;
            dateTotals[e.day] = (dateTotals[e.day] || 0) + e.total;
        }

        let mostFrequentCategory = "-", maxCount = 0;
        for (const [cat, count] of Object.entries(categoryCount)) {
            if (count > maxCount) {
                mostFrequentCategory = cat;
                maxCount = count;
            }
        }

        return { highest, lowest, mostFrequentCategory };
    };

    const getTotal = (list, type_) => {
        const item = list.find(t => t.type_ === type_);
        return item ? item.total : 0;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
            <div className="container mx-auto px-4 py-8 max-w-7xl">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
                        💰 Financial Dashboard
                    </h1>
                    <p className="text-gray-600 text-lg">Track your finances with smart insights</p>
                </div>

                {/* Budget Overview Section - Full width components */}
                <div className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                        <span className="bg-gradient-to-r from-blue-500 to-purple-500 w-1 h-8 rounded-full mr-3"></span>
                        Budget Overview
                    </h2>
                    
                    {/* Budget Prediction - Full Width */}
                    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300 mb-6">
                        <BudgetPrediction months={6} />
                    </div>
                    
                    {/* Budget Recommendations and Monthly Limit - Side by Side */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                            <BudgetRecommendations months={0} savingsGoal={0} />
                        </div>
                        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                            <MonthlyLimit />
                        </div>
                    </div>
                    
                    {/* Smart Tips - Full Width */}
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl shadow-lg p-6 border border-green-100 hover:shadow-xl transition-shadow duration-300">
                        <div className="text-center">
                            <div className="text-4xl mb-3">💡</div>
                            <h3 className="text-2xl font-semibold text-green-800 mb-3">Smart Financial Tips</h3>
                            <p className="text-green-600 mb-4">AI-powered insights to optimize your finances</p>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                                <div className="bg-green-100 rounded-lg p-4">
                                    <div className="text-2xl mb-2">📊</div>
                                    <h4 className="font-semibold text-green-800 mb-1">Track Spending</h4>
                                    <p className="text-sm text-green-700">Monitor your expenses across categories</p>
                                </div>
                                <div className="bg-green-100 rounded-lg p-4">
                                    <div className="text-2xl mb-2">🎯</div>
                                    <h4 className="font-semibold text-green-800 mb-1">Set Goals</h4>
                                    <p className="text-sm text-green-700">Create achievable savings targets</p>
                                </div>
                                <div className="bg-green-100 rounded-lg p-4">
                                    <div className="text-2xl mb-2">💰</div>
                                    <h4 className="font-semibold text-green-800 mb-1">Save Smart</h4>
                                    <p className="text-sm text-green-700">Optimize your budget allocation</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Analytics Section */}
                <div className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                        <span className="bg-gradient-to-r from-purple-500 to-pink-500 w-1 h-8 rounded-full mr-3"></span>
                        Analytics Overview
                    </h2>

                    {(!trends || !periodicTrends) ? (
                        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                            <p className="text-gray-600 text-lg">Loading trends...</p>
                        </div>
                    ) : (
                        <>
                            {/* Trend Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="bg-red-100 rounded-full p-3">
                                            <span className="text-2xl">🔼</span>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm text-gray-500 font-medium">Highest Expense</p>
                                            <p className="text-2xl font-bold text-red-600">₹{trends.highest.total}</p>
                                        </div>
                                    </div>
                                    <p className="text-lg font-semibold text-gray-800">{trends.highest.category}</p>
                                </div>

                                <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="bg-green-100 rounded-full p-3">
                                            <span className="text-2xl">🔽</span>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm text-gray-500 font-medium">Lowest Expense</p>
                                            <p className="text-2xl font-bold text-green-600">₹{trends.lowest.total}</p>
                                        </div>
                                    </div>
                                    <p className="text-lg font-semibold text-gray-800">{trends.lowest.category}</p>
                                </div>

                                <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="bg-blue-100 rounded-full p-3">
                                            <span className="text-2xl">📈</span>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm text-gray-500 font-medium">Most Frequent</p>
                                        </div>
                                    </div>
                                    <p className="text-lg font-bold text-blue-600">{trends.mostFrequentCategory}</p>
                                </div>
                            </div>

                            {/* Periodic Trends */}
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                                {['day', 'week', 'month', 'year'].map((period) => (
                                    <div
                                        key={period}
                                        className={`bg-gradient-to-br ${periodColors[period]} rounded-xl shadow-lg p-6 text-white hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}
                                    >
                                        <div className="flex items-center justify-between mb-6">
                                            <h3 className="text-xl font-bold capitalize flex items-center">
                                                <span className="mr-2 text-2xl">{periodIcons[period]}</span>
                                                {period}ly
                                            </h3>
                                        </div>
                                        
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between bg-white/20 rounded-lg p-3 backdrop-blur-sm">
                                                <div className="flex items-center">
                                                    <Icon name="trendUp" size={24} className="text-green-200 mr-3" />
                                                    <span className="font-medium">Income</span>
                                                </div>
                                                <span className="font-bold text-lg">
                                                    ₹{getTotal(periodicTrends[`${period}_trends`], 'Income').toFixed(0)}
                                                </span>
                                            </div>
                                            
                                            <div className="flex items-center justify-between bg-white/20 rounded-lg p-3 backdrop-blur-sm">
                                                <div className="flex items-center">
                                                    <Icon name="trendDown" size={24} className="text-red-200 mr-3" />
                                                    <span className="font-medium">Expense</span>
                                                </div>
                                                <span className="font-bold text-lg">
                                                    ₹{getTotal(periodicTrends[`${period}_trends`], 'Expense').toFixed(0)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Home;