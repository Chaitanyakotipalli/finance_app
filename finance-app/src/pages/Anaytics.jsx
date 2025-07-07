import { useEffect, useState } from 'react';
import axios from 'axios';
import BudgetPrediction from './BudgetPrediction.jsx';
import BudgetRecommendations from './BudgetRecommendations.jsx';

function Analytics({ type_ }) {
    const [analysis, setAnalysis] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedPeriod, setSelectedPeriod] = useState('month');
    const user_id = localStorage.getItem("user_id");

    const periodConfig = {
        year: { icon: '📊', label: 'Yearly', color: 'from-purple-500 to-purple-600', bgColor: 'bg-purple-50', textColor: 'text-purple-800', borderColor: 'border-purple-200' },
        month: { icon: '🗓️', label: 'Monthly', color: 'from-blue-500 to-blue-600', bgColor: 'bg-blue-50', textColor: 'text-blue-800', borderColor: 'border-blue-200' },
        week: { icon: '📅', label: 'Weekly', color: 'from-green-500 to-green-600', bgColor: 'bg-green-50', textColor: 'text-green-800', borderColor: 'border-green-200' },
        date: { icon: '📆', label: 'Daily', color: 'from-orange-500 to-orange-600', bgColor: 'bg-orange-50', textColor: 'text-orange-800', borderColor: 'border-orange-200' }
    };

    useEffect(() => {
        if (!user_id) return;
        setLoading(true);
        axios.get("http://127.0.0.1:8000/analytics/all", { params: { user_id } })
            .then(res => {
                const filtered = {
                    year: res.data.year.filter(d => d.type_ === type_),
                    month: res.data.month.filter(d => d.type_ === type_),
                    week: res.data.week.filter(d => d.type_ === type_),
                    date: res.data.date.filter(d => d.type_ === type_),
                };
                setAnalysis(filtered);
            })
            .catch(err => console.error('Failed to fetch analytics:', err))
            .finally(() => setLoading(false));
    }, [type_, user_id]);

    const getTotalAmount = (data) => data.reduce((sum, item) => sum + item.total, 0);
    const getTopCategories = (data, limit = 5) => data.sort((a, b) => b.total - a.total).slice(0, limit);

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 p-4">
                <div className="container mx-auto max-w-7xl">
                    <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto mb-6"></div>
                        <p className="text-gray-600 text-xl">Loading {type_} analysis...</p>
                        <p className="text-gray-500 text-sm mt-2">Please wait while we crunch the numbers</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!analysis) return null;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
            <div className="container mx-auto px-4 py-8 max-w-7xl">
                <div className="text-center mb-12">
                    <div className="flex items-center justify-center mb-4">
                        <div className={`p-4 rounded-full ${type_ === 'Expense' ? 'bg-red-100' : 'bg-green-100'} mr-4`}>
                            <span className="text-4xl">{type_ === 'Expense' ? '📤' : '📥'}</span>
                        </div>
                        <h1 className={`text-4xl md:text-5xl font-bold bg-gradient-to-r ${type_ === 'Expense' ? 'from-red-600 to-red-700' : 'from-green-600 to-green-700'} bg-clip-text text-transparent`}>
                            {type_} Analysis
                        </h1>
                    </div>
                    <p className="text-gray-600 text-lg">Comprehensive insights into your {type_.toLowerCase()} patterns</p>
                </div>

                {type_ === "Expense" && (
                    <div className="mb-12">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                            <span className="bg-gradient-to-r from-red-500 to-red-600 w-1 h-8 rounded-full mr-3"></span>
                            Budget Insights
                        </h2>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                                <BudgetPrediction months={6} />
                            </div>
                            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                                <BudgetRecommendations />
                            </div>
                        </div>
                    </div>
                )}

                <div className="mb-8">
                    <div className="flex flex-wrap gap-2 justify-center">
                        {Object.entries(periodConfig).map(([period, config]) => (
                            <button
                                key={period}
                                onClick={() => setSelectedPeriod(period)}
                                className={`px-6 py-3 rounded-full font-medium transition-all duration-300 flex items-center space-x-2 ${
                                    selectedPeriod === period ? `bg-gradient-to-r ${config.color} text-white shadow-lg transform scale-105` : 'bg-white text-gray-600 hover:bg-gray-50 shadow-md hover:shadow-lg'
                                }`}
                            >
                                <span className="text-xl">{config.icon}</span>
                                <span>{config.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    {Object.entries(periodConfig).map(([period, config]) => {
                        const total = getTotalAmount(analysis[period]);
                        const count = analysis[period].length;
                        return (
                            <div
                                key={period}
                                className={`${config.bgColor} rounded-xl shadow-lg p-6 border ${config.borderColor} hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-3xl">{config.icon}</span>
                                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${config.textColor} bg-white`}>
                                        {count} entries
                                    </div>
                                </div>
                                <h3 className={`text-lg font-semibold ${config.textColor} mb-2`}>
                                    {config.label} Total
                                </h3>
                                <p className={`text-2xl font-bold ${config.textColor}`}>
                                    ₹{total.toLocaleString()}
                                </p>
                            </div>
                        );
                    })}
                </div>

                {/* Detailed Analysis */}
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                        <span className={`bg-gradient-to-r ${periodConfig[selectedPeriod].color} w-1 h-8 rounded-full mr-3`}></span>
                        {periodConfig[selectedPeriod].label} Breakdown
                    </h2>
                    
                    {analysis[selectedPeriod].length === 0 ? (
                        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                            <div className="text-6xl mb-4">📊</div>
                            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Data Available</h3>
                            <p className="text-gray-500">No {type_.toLowerCase()} data found for the {selectedPeriod} period.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Top Categories */}
                            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                                <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                                    <span className="text-2xl mr-2">🏆</span>
                                    Top Categories
                                </h3>
                                <div className="space-y-3">
                                    {getTopCategories(analysis[selectedPeriod]).map((entry, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                                            <div className="flex items-center">
                                                <div className={`w-3 h-3 rounded-full mr-3 ${
                                                    idx === 0 ? 'bg-yellow-500' :
                                                    idx === 1 ? 'bg-gray-400' :
                                                    idx === 2 ? 'bg-amber-600' : 'bg-blue-500'
                                                }`}></div>
                                                <span className="font-medium text-gray-700">{entry.category}</span>
                                            </div>
                                            <span className="font-bold text-gray-800">₹{entry.total.toLocaleString()}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* All Categories */}
                            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                                <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                                    <span className="text-2xl mr-2">📋</span>
                                    All Categories
                                </h3>
                                <div className="max-h-96 overflow-y-auto space-y-2">
                                    {analysis[selectedPeriod]
                                        .sort((a, b) => b.total - a.total)
                                        .map((entry, idx) => (
                                            <div key={idx} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors duration-200">
                                                <span className="text-gray-700">{entry.category}</span>
                                                <span className="font-semibold text-gray-800">₹{entry.total.toLocaleString()}</span>
                                            </div>
                                        ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white rounded-xl shadow-lg p-6 text-center border border-gray-100">
                        <div className="text-4xl mb-3">📊</div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">Total Categories</h3>
                        <p className="text-2xl font-bold text-indigo-600">
                            {analysis[selectedPeriod].length}
                        </p>
                    </div>
                    <div className="bg-white rounded-xl shadow-lg p-6 text-center border border-gray-100">
                        <div className="text-4xl mb-3">💰</div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">Average Amount</h3>
                        <p className="text-2xl font-bold text-green-600">
                            ₹{analysis[selectedPeriod].length > 0 ? 
                                Math.round(getTotalAmount(analysis[selectedPeriod]) / analysis[selectedPeriod].length).toLocaleString() : 
                                0
                            }
                        </p>
                    </div>
                    <div className="bg-white rounded-xl shadow-lg p-6 text-center border border-gray-100">
                        <div className="text-4xl mb-3">🎯</div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">Highest Single</h3>
                        <p className="text-2xl font-bold text-red-600">
                            ₹{analysis[selectedPeriod].length > 0 ? 
                                Math.max(...analysis[selectedPeriod].map(item => item.total)).toLocaleString() : 
                                0
                            }
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Analytics;