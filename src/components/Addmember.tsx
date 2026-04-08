import { useState } from "react";
import API from "../services/api";

const AddMember = ({ groupId, onSuccess }: any) => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const handleSubmit = async () => {
    try {
      await API.post("/members", {
        name,
        phone,
        groupId,
      });

      alert("Member added ✅");

      setName("");
      setPhone("");

      onSuccess(); // refresh dashboard
    } catch (err: any) {
      alert(err.response?.data?.message || "Error");
    }
  };

  return (
    <div className="bg-blue-50 rounded-xl p-6 shadow flex flex-col md:flex-row md:items-end gap-4">
      <div className="flex-1">
        <h3 className="text-lg font-semibold text-blue-700 mb-2">Add Member</h3>
        <div className="flex flex-col md:flex-row gap-3">
          <input
            className="border border-blue-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 w-full md:w-48"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            className="border border-blue-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 w-full md:w-48"
            placeholder="Phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2 rounded-lg shadow transition-colors duration-150"
            onClick={handleSubmit}
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddMember;
