import { useState, useEffect, useRef } from 'react';
import TransactionCard from './TransactionCard.jsx';
import axios from 'axios';

function TransactionBox({ label, data, setData }) {
  const [input, setInput] = useState({ name: '', amount: '', category: '', date: '', type_: 'Income' });
  const [customCategory, setCustomCategory] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [showAllIncome, setShowAllIncome] = useState(false);
  const [showAllExpense, setShowAllExpense] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [categories, setCategories] = useState([]);
  const [newCat, setNewCat] = useState({ name: '', icon: '' });
  const [showAddCategory, setShowAddCategory] = useState(false);

  const user_id = localStorage.getItem("user_id");

  useEffect(() => {
    axios.get("http://127.0.0.1:8000/categories/", {
      params: { user_id},
    })
      .then((res) => setCategories(res.data))
      .catch((err) => console.error("Error loading categories:", err));
  }, []);

  useEffect(() => {
    axios.get("http://127.0.0.1:8000/transactions/", {
      params: { user_id},
    })
      .then((res) => setData(res.data))
      .catch((err) => console.error("Error loading transactions:", err));
  }, []);

  function getCategoryIcon(name) {
    const found = categories.find(cat => cat.name === name);
    return found ? found.icon : '📁';
  }

  function addTransaction() {
    console.log("▶️ addTransaction called:", input, "user_id=", user_id);
    const { name, amount, category, date, type_ } = input;
    if (!name || !amount || !category || !date) {
      alert("Please enter all details");
      return;
    }

    const finalCategory = category === 'Other' ? customCategory : category;

    const newTransaction = {
      name,
      amount,
      category: finalCategory,
      date,
      type_,
    };

    if (editingId !== null) {
      const updated = data.map(item =>
        item.id === editingId ? { ...item, ...newTransaction } : item
      );
      setData(updated);
      setEditingId(null);
    } else {
      axios.post("http://127.0.0.1:8000/transactions/", newTransaction, {
        params: { user_id },
      })
        .then((res) => {
          setData([res.data, ...data]);
        })
        .catch((err) => console.error("Error saving transaction:", err));
    }

    setInput({ name: '', amount: '', category: '', date: '', type_: 'Income' });
    setCustomCategory('');
  }

  function deleteTransaction(id) {
    axios.delete(`http://127.0.0.1:8000/transactions/${id}`, {
      params: { user_id },
    })
      .then(() => {
        setData(data.filter((item) => item.id !== id));
      })
      .catch((err) => console.error("Delete error:", err));
  }

  function editTransaction(id) {
    const item = data.find((i) => i.id === id);
    if (item) {
      setInput({
        name: item.name,
        amount: item.amount,
        category: item.category,
        date: item.date,
        type_: item.type_,
      });
      setEditingId(id);
      if (item.category === 'Other') setCustomCategory(item.category);
    }
  }

  function addCategory() {
    if (!newCat.name || !newCat.icon) {
      alert("Please enter both category name and icon.");
      return;
    }

    axios.post("http://127.0.0.1:8000/categories/", newCat, {
      params: { user_id },
    })
      .then((res) => {
        setCategories([res.data, ...categories]);
        setNewCat({ name: '', icon: '' });
        setShowAddCategory(false);
      })
      .catch((err) => {
        console.error("Full error:", err.response?.data || err.message);
        alert("Something went wrong: " + (err.response?.data?.detail || err.message));
      });
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            {label}
          </h2>
          <p className="text-gray-600 text-lg">Manage your finances with ease</p>
        </div>

        {/* Add Transaction Button */}
        {!showForm && (
          <div className="flex justify-center mb-8">
            <button 
              className="group relative inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 hover:from-blue-600 hover:to-purple-700"
              onClick={() => setShowForm(true)}
            >
              <svg className="w-5 h-5 transition-transform group-hover:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Transaction
            </button>
          </div>
        )}

        {/* Transaction Form */}
        {showForm && (
          <div className="max-w-2xl mx-auto mb-10">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-4">
                <h3 className="text-xl font-bold text-white text-center">
                  {editingId !== null ? '✏️ Edit Transaction' : '✨ Add New Transaction'}
                </h3>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Transaction Type */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Transaction Type</label>
                  <select 
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
                    value={input.type_} 
                    onChange={(e) => setInput({ ...input, type_: e.target.value })}
                  >
                    <option value="Income">💰 Income</option>
                    <option value="Expense">💸 Expense</option>
                  </select>
                </div>

                {/* Name */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Transaction Name</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-400"
                    placeholder="Enter transaction name..." 
                    value={input.name} 
                    onChange={(e) => setInput({ ...input, name: e.target.value })} 
                  />
                </div>

                {/* Amount */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Amount</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">$</span>
                    <input 
                      type="number" 
                      className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-400"
                      placeholder="0.00" 
                      value={input.amount} 
                      onChange={(e) => setInput({ ...input, amount: e.target.value })} 
                    />
                  </div>
                </div>

                {/* Date */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Date</label>
                  <input 
                    type="date" 
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    value={input.date} 
                    onChange={(e) => setInput({ ...input, date: e.target.value })} 
                  />
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Category</label>
                  <select 
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
                    value={input.category} 
                    onChange={(e) => setInput({ ...input, category: e.target.value })}
                  >
                    <option value="">Select a category...</option>
                    {categories.map((cat, idx) => (
                      <option key={idx} value={cat.name}>{cat.icon} {cat.name}</option>
                    ))}
                    <option value="Other">➕ Add new category</option>
                  </select>
                </div>

                {/* Custom Category */}
                {input.category === 'Other' && (
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">New Category Name</label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-400"
                      placeholder="Enter new category name..." 
                      value={customCategory} 
                      onChange={(e) => setCustomCategory(e.target.value)} 
                    />
                  </div>
                )}

                {/* Add Category Section */}
                {showAddCategory && (
                  <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                    <h4 className="font-medium text-gray-700">Add New Category</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Category Name</label>
                        <input 
                          type="text" 
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                          placeholder="e.g., Food, Transport..." 
                          value={newCat.name} 
                          onChange={(e) => setNewCat({ ...newCat, name: e.target.value })} 
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Icon</label>
                        <input 
                          type="text" 
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                          placeholder="🍔" 
                          value={newCat.icon} 
                          onChange={(e) => setNewCat({ ...newCat, icon: e.target.value })} 
                          maxLength={2} 
                        />
                      </div>
                    </div>
                    <button 
                      className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-200"
                      onClick={addCategory}
                    >
                      Add Category
                    </button>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-gray-100">
                  <button 
                    className="flex-1 px-6 py-3 text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors duration-200 font-medium"
                    onClick={() => setShowAddCategory(!showAddCategory)}
                  >
                    {showAddCategory ? 'Cancel New Category' : '➕ Add New Category'}
                  </button>
                  
                  <div className="flex gap-2">
                    <button 
                      className="px-6 py-3 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                      onClick={() => setShowForm(false)}
                    >
                      Cancel
                    </button>
                    <button 
                      className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
                      onClick={() => {
                        addTransaction();
                        setShowForm(false);
                      }}
                    >
                      {editingId !== null ? 'Update' : 'Save'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Transaction History */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Income History */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <span className="text-2xl">💰</span>
                Income History
              </h3>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                {[...data]
                  .filter(i => i.type_ === 'Income')
                  .sort((a, b) => new Date(b.date) - new Date(a.date))
                  .slice(0, showAllIncome ? undefined : 3)
                  .map(item => (
                    <TransactionCard
                      key={item.id}
                      item={item}
                      getCategoryIcon={getCategoryIcon}
                      editTransaction={editTransaction}
                      deleteTransaction={deleteTransaction}
                    />
                  ))}
              </div>
              
              {data.filter(i => i.type_ === 'Income').length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-2">💸</div>
                  <p>No income transactions yet</p>
                </div>
              )}
              
              {data.filter(i => i.type_ === 'Income').length > 3 && (
                <div className="text-center mt-6">
                  <button 
                    className="inline-flex items-center gap-2 px-4 py-2 text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200"
                    onClick={() => setShowAllIncome(!showAllIncome)}
                  >
                    {showAllIncome ? (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                        See Less
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                        See All ({data.filter(i => i.type_ === 'Income').length})
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Expense History */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-red-500 to-pink-600 px-6 py-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <span className="text-2xl">💸</span>
                Expense History
              </h3>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                {[...data]
                  .filter(i => i.type_ === 'Expense')
                  .sort((a, b) => new Date(b.date) - new Date(a.date))
                  .slice(0, showAllExpense ? undefined : 3)
                  .map(item => (
                    <TransactionCard
                      key={item.id}
                      item={item}
                      getCategoryIcon={getCategoryIcon}
                      editTransaction={editTransaction}
                      deleteTransaction={deleteTransaction}
                    />
                  ))}
              </div>
              
              {data.filter(i => i.type_ === 'Expense').length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-2">💰</div>
                  <p>No expense transactions yet</p>
                </div>
              )}
              
              {data.filter(i => i.type_ === 'Expense').length > 3 && (
                <div className="text-center mt-6">
                  <button 
                    className="inline-flex items-center gap-2 px-4 py-2 text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200"
                    onClick={() => setShowAllExpense(!showAllExpense)}
                  >
                    {showAllExpense ? (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                        See Less
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                        See All ({data.filter(i => i.type_ === 'Expense').length})
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TransactionBox;