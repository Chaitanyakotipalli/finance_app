import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  TrendingUp,
  TrendingDown,
  Wallet, // replaced PiggyBank
  Filter,
  Calendar,
  Tag,
  DollarSign,
  BarChart3,
  Clock,
  Target
} from 'lucide-react';

function SummaryCards() {
  const user_id = localStorage.getItem("user_id");
  const [summary, setSummary] = useState({
    total_income: 0,
    total_expense: 0,
    net_savings: 0
  });
  const [year_analysis, set_year_analysis] = useState([]);
  const [month_analysis, set_month_analysis] = useState([]);
  const [week_analysis, set_week_analysis] = useState([]);
  const [date_analysis, set_date_analysis] = useState([]);
  const [filters, setfilters] = useState({
    start_date: '',
    end_date: '',
    type_: '',
    category: ''
  });
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('year');

  const handleChange = (e) => {
    setfilters({ ...filters, [e.target.name]: e.target.value });
  };

  const fetchFilteredData = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.start_date) params.start_date = filters.start_date;
      if (filters.end_date) params.end_date = filters.end_date;
      if (filters.type_) params.type_ = filters.type_;
      if (filters.category) params.category = filters.category;

      const res = await axios.get('http://127.0.0.1:8000/analytics/filter', { params: {user_id} });
      setResults(res.data || []);
    } catch (err) {
      console.error("Error fetching data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    axios.get('http://127.0.0.1:8000/analytics/all',{params: {user_id}})
      .then(res => {
        console.log('Fetched analytics:', res.data);
        const data = res.data || {};
        setSummary(data.summary || {});
        set_year_analysis(data.year || []);
        set_month_analysis(data.month || []);
        set_week_analysis(data.week || []);
        set_date_analysis(data.date || []);
      })
      .catch(err => console.error("Failed to fetch summary:", err));
  }, []);

  const filteredYearAnalysis = filters.type_ ? year_analysis.filter(d => d.type_ === filters.type_) : year_analysis;
  const filteredMonthAnalysis = filters.type_ ? month_analysis.filter(d => d.type_ === filters.type_) : month_analysis;
  const filteredWeekAnalysis = filters.type_ ? week_analysis.filter(d => d.type_ === filters.type_) : week_analysis;
  const filteredDateAnalysis = filters.type_ ? date_analysis.filter(d => d.type_ === filters.type_) : date_analysis;

  const getAnalysisData = () => {
    switch (activeTab) {
      case 'year': return filteredYearAnalysis || [];
      case 'month': return filteredMonthAnalysis || [];
      case 'week': return filteredWeekAnalysis || [];
      case 'date': return filteredDateAnalysis || [];
      default: return [];
    }
  };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 w-full pl-16 ">
            {/* HEADER */}
            <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Financial Dashboard
                    </h1>
                    <p className="text-gray-600 mt-1">Track your income, expenses, and savings</p>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <Clock className="w-4 h-4" />
                    <span>Last updated: {new Date().toLocaleDateString()}</span>
                </div>
                </div>
            </div>
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* SUMMARY CARDS */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* INCOME */}
                    <div className="group bg-gradient-to-br from-emerald-50 to-green-100 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-green-200/50">
                        <div className="flex items-center justify-between">
                        <div>
                            <p className="text-green-600 text-sm font-medium mb-1">Total Income</p>
                            <p className="text-3xl font-bold text-green-800">₹{(summary.total_income || 0).toLocaleString()}</p>
                        </div>
                        <div className="bg-green-500/20 p-3 rounded-full group-hover:bg-green-500/30 transition-colors">
                            <TrendingUp className="w-8 h-8 text-green-600" />
                        </div>
                        </div>
                        <div className="mt-4 flex items-center text-green-600 text-sm">
                        <TrendingUp className="w-4 h-4 mr-1" />
                        <span>+12% from last month</span>
                        </div>
                    </div>

                    <div className="group bg-gradient-to-br from-rose-50 to-red-100 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-red-200/50">
                        <div className="flex items-center justify-between">
                        <div>
                            <p className="text-red-600 text-sm font-medium mb-1">Total Expenses</p>
                            <p className="text-3xl font-bold text-red-800">₹{(summary.total_expense || 0).toLocaleString()}</p>
                        </div>
                        <div className="bg-red-500/20 p-3 rounded-full group-hover:bg-red-500/30 transition-colors">
                            <TrendingDown className="w-8 h-8 text-red-600" />
                        </div>
                        </div>
                        <div className="mt-4 flex items-center text-red-600 text-sm">
                        <TrendingDown className="w-4 h-4 mr-1" />
                        <span>+5% from last month</span>
                        </div>
                    </div>

                    <div className={`group p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border ${
                        summary.net_savings >= 0 
                        ? 'bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200/50' 
                        : 'bg-gradient-to-br from-amber-50 to-orange-100 border-amber-200/50'
                    }`}>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className={`text-sm font-medium mb-1 ${summary.net_savings >= 0 ? 'text-blue-600' : 'text-amber-600'}`}>
                                Net Savings
                                </p>
                                <p className={`text-3xl font-bold ${summary.net_savings >= 0 ? 'text-blue-800' : 'text-amber-800'}`}>
                                ₹{(summary.net_savings || 0).toLocaleString()}
                                </p>
                            </div>
                            <div className={`p-3 rounded-full transition-colors ${summary.net_savings >= 0 ? 'bg-blue-500/20 group-hover:bg-blue-500/30' : 'bg-amber-500/20 group-hover:bg-amber-500/30'}`}>
                                <Wallet className={`w-8 h-8 ${summary.net_savings >= 0 ? 'text-blue-600' : 'text-amber-600'}`} />
                            </div>
                            </div>
                            <div className={`mt-4 flex items-center text-sm ${summary.net_savings >= 0 ? 'text-blue-600' : 'text-amber-600'}`}>
                            <Target className="w-4 h-4 mr-1" />
                            <span>Goal: ₹60,000</span>
                            </div>
                        </div>
                    </div>

                {/* Filter Section */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 mb-8 border border-gray-200/50">
                    <div className="flex items-center mb-6">
                        <Filter className="w-6 h-6 text-blue-600 mr-3" />
                        <h2 className="text-xl font-bold text-gray-800">Filter Analytics</h2>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        <div className="space-y-2">
                            <label className="flex items-center text-sm font-medium text-gray-700">
                                <Calendar className="w-4 h-4 mr-2" />
                                Start Date
                            </label>
                            <input
                                type="date"
                                name="start_date"
                                value={filters.start_date}
                                onChange={handleChange}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            />
                        </div>
                        
                        <div className="space-y-2">
                            <label className="flex items-center text-sm font-medium text-gray-700">
                                <Calendar className="w-4 h-4 mr-2" />
                                End Date
                            </label>
                            <input
                                type="date"
                                name="end_date"
                                value={filters.end_date}
                                onChange={handleChange}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            />
                        </div>
                        
                        <div className="space-y-2">
                            <label className="flex items-center text-sm font-medium text-gray-700">
                                <BarChart3 className="w-4 h-4 mr-2" />
                                Type
                            </label>
                            <select
                                name="type_"
                                value={filters.type_}
                                onChange={handleChange}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            >
                                <option value="">All Types</option>
                                <option value="Income">Income</option>
                                <option value="Expense">Expense</option>
                            </select>
                        </div>
                        
                        <div className="space-y-2">
                            <label className="flex items-center text-sm font-medium text-gray-700">
                                <Tag className="w-4 h-4 mr-2" />
                                Category
                            </label>
                            <input
                                type="text"
                                name="category"
                                value={filters.category}
                                onChange={handleChange}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                placeholder="Enter category"
                            />
                        </div>
                    </div>

                    <button
                        onClick={fetchFilteredData}
                        disabled={loading}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                        {loading ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Loading...
                            </>
                        ) : (
                            <>
                                <Filter className="w-4 h-4 mr-2" />
                                Apply Filter
                            </>
                        )}
                    </button>

                    {/* Results Table */}
                    {results.length > 0 && (
                        <div className="mt-6">
                            <h3 className="text-lg font-semibold mb-4 text-gray-800">Filtered Results</h3>
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse bg-white rounded-lg overflow-hidden shadow-sm">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="p-4 text-left text-sm font-semibold text-gray-700 border-b">Date</th>
                                            <th className="p-4 text-left text-sm font-semibold text-gray-700 border-b">Type</th>
                                            <th className="p-4 text-left text-sm font-semibold text-gray-700 border-b">Category</th>
                                            <th className="p-4 text-right text-sm font-semibold text-gray-700 border-b">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {results.map((item, idx) => (
                                            <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                                <td className="p-4 text-sm text-gray-600 border-b border-gray-100">{item.date}</td>
                                                <td className="p-4 border-b border-gray-100">
                                                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                                                        item.type_ === 'Income' 
                                                            ? 'bg-green-100 text-green-800' 
                                                            : 'bg-red-100 text-red-800'
                                                    }`}>
                                                        {item.type_}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-sm text-gray-600 border-b border-gray-100">{item.category}</td>
                                                <td className="p-4 text-right text-sm font-medium text-gray-800 border-b border-gray-100">
                                                    ₹{item.total.toLocaleString()}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>

                {/* Analysis Section */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50">
                    <div className="p-6 border-b border-gray-200">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Financial Analysis</h2>
                        
                        {/* Tab Navigation */}
                        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
                            {[
                                { key: 'year', label: 'Yearly' },
                                { key: 'month', label: 'Monthly' },
                                { key: 'week', label: 'Weekly' },
                                { key: 'date', label: 'Daily' }
                            ].map((tab) => (
                                <button
                                    key={tab.key}
                                    onClick={() => setActiveTab(tab.key)}
                                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                                        activeTab === tab.key
                                            ? 'bg-white text-blue-600 shadow-sm'
                                            : 'text-gray-600 hover:text-gray-800'
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Type Filter */}
                        <div className="mt-4 flex items-center space-x-4">
                            <label className="text-sm font-medium text-gray-700">Filter by type:</label>
                            <select
                                value={filters.type_}
                                name="type_"
                                onChange={handleChange}
                                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="">All Types</option>
                                <option value="Income">Income Only</option>
                                <option value="Expense">Expense Only</option>
                            </select>
                        </div>
                    </div>

                    <div className="p-6">
                        {getAnalysisData().length === 0 ? (
                            <div className="text-center py-12">
                                <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                                    <BarChart3 className="w-8 h-8 text-gray-400" />
                                </div>
                                <p className="text-gray-500 text-lg">No data available for this period</p>
                                <p className="text-gray-400 text-sm mt-1">Try adjusting your filters or date range</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse">
                                    <thead>
                                        <tr className="bg-gray-50">
                                            <th className="p-4 text-left text-sm font-semibold text-gray-700 border-b">Type</th>
                                            <th className="p-4 text-left text-sm font-semibold text-gray-700 border-b">Category</th>
                                            <th className="p-4 text-right text-sm font-semibold text-gray-700 border-b">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {getAnalysisData().map((item, idx) => (
                                            <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                                <td className="p-4 border-b border-gray-100">
                                                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                                                        item.type_ === 'Income' 
                                                            ? 'bg-green-100 text-green-800' 
                                                            : 'bg-red-100 text-red-800'
                                                    }`}>
                                                        {item.type_}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-sm text-gray-600 border-b border-gray-100">{item.category}</td>
                                                <td className="p-4 text-right border-b border-gray-100">
                                                    <span className={`text-sm font-medium ${
                                                        item.type_ === 'Income' ? 'text-green-600' : 'text-red-600'
                                                    }`}>
                                                        ₹{item.total.toLocaleString()}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SummaryCards;