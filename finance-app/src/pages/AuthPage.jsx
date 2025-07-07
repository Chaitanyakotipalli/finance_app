import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function AuthPage({ setLoggedIn }) {
  const [isLogin, setIsLogin] = useState(true);
  const [mobile, setMobile] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleAuth = async () => {
    try {
      setError(""); // Clear error before attempt
      setLoading(true);
      
      console.log('Starting authentication...'); // Debug log
      
      // Test backend connectivity first
      console.log('Testing backend connectivity...');
      
      // Create axios instance with longer timeout
      const axiosInstance = axios.create({
        timeout: 30000, // 30 seconds timeout
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (isLogin) {
        console.log('Attempting login with mobile:', mobile); // Debug log
        
        const res = await axiosInstance.post("http://127.0.0.1:8000/login", { 
          mobile, 
          password 
        });
        
        console.log('Login response status:', res.status); // Debug log
        console.log('Login response data:', res.data); // Debug log
        
        // Store user data - handle both possible response formats
        const userId = res.data.user_id || res.data.id;
        const userName = res.data.name;
        
        if (!userId) {
          throw new Error('No user ID received from server');
        }
        
        if (!userName) {
          throw new Error('No user name received from server');
        }
        
        localStorage.setItem("user_id", userId.toString());
        localStorage.setItem("name", userName);
        
        console.log('Stored user_id:', localStorage.getItem("user_id")); // Debug log
        console.log('Stored name:', localStorage.getItem("name")); // Debug log
        
        setLoggedIn(true);
        navigate("/");
      } else {
        console.log('Attempting signup with:', { name, mobile }); // Debug log
        
        const res = await axiosInstance.post("http://127.0.0.1:8000/signup", { 
          name, 
          mobile, 
          password 
        });
        
        console.log('Signup response status:', res.status); // Debug log
        console.log('Signup response data:', res.data); // Debug log
        
        // Store user data - handle both possible response formats
        const userId = res.data.id || res.data.user_id;
        const userName = res.data.name;
        
        if (!userId) {
          throw new Error('No user ID received from server');
        }
        
        if (!userName) {
          throw new Error('No user name received from server');
        }
        
        localStorage.setItem("user_id", userId.toString());
        localStorage.setItem("name", userName);
        
        console.log('Stored user_id:', localStorage.getItem("user_id")); // Debug log
        console.log('Stored name:', localStorage.getItem("name")); // Debug log
        
        setLoggedIn(true);
        navigate("/");
      }
    } catch (err) {
      console.error('Auth error:', err); // Debug log
      
      if (err.code === 'ECONNABORTED') {
        setError("Connection timeout. Please check if your backend server is running.");
      } else if (err.response) {
        console.error('Error response status:', err.response.status); // Debug log
        console.error('Error response data:', err.response.data); // Debug log
        
        if (err.response.data?.detail) {
          setError(err.response.data.detail);
        } else if (err.response.data?.message) {
          setError(err.response.data.message);
        } else if (err.response.status === 401) {
          setError("Invalid credentials");
        } else if (err.response.status === 400) {
          setError("Invalid request data");
        } else {
          setError(`Server error: ${err.response.status}`);
        }
      } else if (err.request) {
        console.error('No response received:', err.request); // Debug log
        setError("Cannot connect to server. Please check if your backend is running on http://127.0.0.1:8000");
      } else {
        console.error('Request setup error:', err.message); // Debug log
        setError("An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    handleAuth();
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white shadow-md rounded mt-10">
      <h2 className="text-xl font-bold mb-4">{isLogin ? "Login" : "Sign Up"}</h2>

      <form onSubmit={handleFormSubmit}>
        {!isLogin && (
          <input
            type="text"
            placeholder="Name"
            className="border p-2 mb-2 w-full rounded"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required={!isLogin}
          />
        )}

        <input
          type="text"
          placeholder="Mobile"
          className="border p-2 mb-2 w-full rounded"
          value={mobile}
          onChange={(e) => setMobile(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          className="border p-2 mb-2 w-full rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button
          type="submit"
          disabled={loading || !mobile || !password || (!isLogin && !name)}
          className={`p-2 rounded w-full font-semibold ${
            loading || !mobile || !password || (!isLogin && !name)
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-blue-500 text-white hover:bg-blue-600"
          }`}
        >
          {loading ? "Processing..." : (isLogin ? "Login" : "Sign Up")}
        </button>
      </form>

      {error && <p className="text-red-500 mt-2 text-sm">{error}</p>}

      <p className="mt-4 text-sm">
        {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
        <button
          onClick={() => {
            setIsLogin(!isLogin);
            setError("");
            setMobile("");
            setPassword("");
            setName("");
          }}
          className="text-blue-500 underline"
        >
          {isLogin ? "Sign up" : "Log in"}
        </button>
      </p>
    </div>
  );
}

export default AuthPage;