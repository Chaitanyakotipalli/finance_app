import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Login({ setLoggedInUser }) {
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await axios.post("http://127.0.0.1:8000/login", {
        mobile,
        password,
      });
      localStorage.setItem("user_id", res.data.user_id);
      localStorage.setItem("name", res.data.name);
      setLoggedInUser(res.data);
      navigate("/"); // Redirect on success
    } catch (err) {
      console.error(err);
      setError("Invalid credentials");
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white shadow-md rounded mt-10">
      <h2 className="text-xl font-bold mb-4 text-blue-600">Login</h2>

      <input
        type="text"
        placeholder="Mobile"
        className="border p-2 mb-2 w-full"
        value={mobile}
        onChange={(e) => setMobile(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        className="border p-2 mb-2 w-full"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button
        onClick={handleLogin}
        disabled={!mobile || !password}
        className={`p-2 rounded w-full font-semibold ${
          mobile && password
            ? "bg-blue-500 text-white hover:bg-blue-600"
            : "bg-gray-300 text-gray-500 cursor-not-allowed"
        }`}
      >
        Login
      </button>

      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  );
}

export default Login;
