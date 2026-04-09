import { useState } from "react";
import API from "../services/api";

const AddMember = ({ groupId, onSuccess }: any) => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const handleSubmit = async () => {
    if (!name.trim() || !phone.trim()) {
      alert("Enter member name and phone");
      return;
    }

    try {
      await API.post("/members", {
        name,
        phone,
        groupId,
      });

      alert("Member added");
      setName("");
      setPhone("");
      onSuccess();
    } catch (err: any) {
      alert(err.response?.data?.message || "Error");
    }
  };

  return (
    <div>
      <p className="section-title">Add Member</p>
      <h3 className="mt-2 text-xl font-extrabold">Quick add from mobile</h3>
      <div className="mt-4 space-y-3">
        <input
          className="input-surface"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          className="input-surface"
          placeholder="Phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <button
          className="pill-button w-full bg-[#c75c2a] text-white"
          onClick={handleSubmit}
        >
          Add Member
        </button>
      </div>
    </div>
  );
};

export default AddMember;
