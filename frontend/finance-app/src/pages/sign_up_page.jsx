import { useState } from "react";
import axios from "axios";

function SignUp({ setLoggedInUser }) {
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSignUp = async () => {
    try {
      const res = await axios.post("http://127.0.0.1:8000/signup", {
        name,
        mobile,
        password,
      });
      localStorage.setItem("user_id", res.data.id); // Backend returns "id", not "user_id"
      localStorage.setItem("name", res.data.name);
      setLoggedInUser(res.data);
    } catch (err) {
      setError("Mobile already registered or error during signup");
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white shadow-md rounded">
      <h2 className="text-xl font-bold mb-4">Sign Up</h2>

      <input
        type="text"
        placeholder="Name"
        className="border p-2 mb-2 w-full"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
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
        onClick={handleSignUp}
        className="bg-blue-500 text-white p-2 rounded w-full"
      >
        Sign Up
      </button>

      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  );
}

export default SignUp;
