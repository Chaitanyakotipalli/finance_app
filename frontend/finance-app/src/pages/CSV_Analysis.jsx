import React, { useState } from 'react';

function CSVUpload() {
  const [message, setMessage] = useState('');
  const user_id = localStorage.getItem("user_id");

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`http://127.0.0.1:8000/upload_csv/?user_id=${user_id}`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      setMessage(data.message || "✅ Upload complete.");
    } catch (err) {
      console.error(err);
      setMessage("❌ Upload failed.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 pl-32">
      <div className="w-full max-w-xl p-6 bg-white rounded-2xl shadow-lg border border-gray-200">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
          📤 Upload Bank Statement
        </h2>

        <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-blue-400 rounded-xl cursor-pointer bg-blue-50 hover:bg-blue-100 transition">
          <input
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="hidden"
          />
          <span className="text-blue-600 font-medium">Click to select a CSV file</span>
          <span className="text-sm text-gray-500 mt-1">Only .csv format is supported</span>
        </label>

        {message && (
          <p
            className={`mt-4 text-center font-medium ${
              message.includes("failed") ? "text-red-600" : "text-green-600"
            }`}
          >
            {message}
          </p>
        )}
      </div>
    </div>
  );
}

export default CSVUpload;
