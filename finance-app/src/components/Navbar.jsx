import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { 
  Home, 
  CreditCard, 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  FileText, 
  LogOut, 
  User,
  Menu,
  X
} from "lucide-react";

function Navbar({ setLoggedIn, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [userName, setUserName] = useState("");
  const [userInitials, setUserInitials] = useState("");
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    // Get user info from localStorage
    const storedName = localStorage.getItem("name");
    if (storedName) {
      setUserName(storedName);
      // Generate initials from name
      const initials = storedName
        .split(" ")
        .map(word => word.charAt(0).toUpperCase())
        .join("")
        .slice(0, 2);
      setUserInitials(initials);
    }
  }, []);

  const handleLogout = () => {
    console.log('Navbar: Logging out...'); // Debug log
    
    // Clear localStorage
    localStorage.removeItem("user_id");
    localStorage.removeItem("name");
    
    // Update state
    setLoggedIn(false);
    
    // Call the onLogout callback if provided
    if (onLogout) {
      onLogout();
    }
    
    // Navigate to auth page
    navigate("/auth");
    setShowLogoutConfirm(false);
  };

  const navItems = [
    { path: "/", label: "Dashboard", icon: Home },
    { path: "/transactions", label: "Transactions", icon: CreditCard },
    { path: "/analysis", label: "Overall Analysis", icon: BarChart3 },
    { path: "/income-analysis", label: "Income Analysis", icon: TrendingUp },
    { path: "/expense-analysis", label: "Expense Analysis", icon: TrendingDown },
    { path: "/csv-analysis", label: "CSV Analysis", icon: FileText },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className={`${isCollapsed ? 'w-16' : 'w-64'} transition-all duration-300 bg-gradient-to-b from-slate-900 to-slate-800 text-white min-h-screen flex flex-col shadow-2xl border-r border-slate-700`}>
      {/* Header */}
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <h2 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              FinanceApp
            </h2>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-lg hover:bg-slate-700 transition-colors"
          >
            {isCollapsed ? <Menu size={20} /> : <X size={20} />}
          </button>
        </div>
      </div>

      {/* User Profile Section */}
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold shadow-lg">
              {userInitials || <User size={20} />}
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-slate-800"></div>
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {userName || "User"}
              </p>
              <p className="text-xs text-slate-400">Online</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-3 px-3 py-3 rounded-lg transition-all duration-200 group relative ${
                active 
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg' 
                  : 'hover:bg-slate-700 text-slate-300 hover:text-white'
              }`}
            >
              <Icon size={20} className={`${active ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
              {!isCollapsed && (
                <span className="font-medium">{item.label}</span>
              )}
              {active && (
                <div className="absolute left-0 top-0 w-1 h-full bg-white rounded-r-full"></div>
              )}
              
              {/* Tooltip for collapsed state */}
              {isCollapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-slate-800 text-white text-sm rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50 shadow-lg">
                  {item.label}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Logout Section */}
      <div className="p-4 border-t border-slate-700">
        <button
          onClick={() => setShowLogoutConfirm(true)}
          className={`w-full flex items-center space-x-3 px-3 py-3 rounded-lg transition-all duration-200 text-red-400 hover:text-red-300 hover:bg-red-900/20 group ${
            isCollapsed ? 'justify-center' : ''
          }`}
        >
          <LogOut size={20} />
          {!isCollapsed && <span className="font-medium">Logout</span>}
          
          {/* Tooltip for collapsed state */}
          {isCollapsed && (
            <div className="absolute left-full ml-2 px-2 py-1 bg-slate-800 text-white text-sm rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50 shadow-lg">
              Logout
            </div>
          )}
        </button>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4 shadow-2xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Confirm Logout
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to logout? You'll need to sign in again to access your account.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Navbar;