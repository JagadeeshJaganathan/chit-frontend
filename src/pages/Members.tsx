import { useEffect, useState, useCallback } from "react";
import API from "../services/api";
import AddMember from "../components/Addmember";

const Members = () => {
  const [groups, setGroups] = useState<any[]>([]);
  const [selectedGroup, setSelectedGroup] = useState("");
  const [members, setMembers] = useState<any[]>([]);

  // ✏️ Edit state
  const [editId, setEditId] = useState("");
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isAdmin = user.role === "admin";

  // 🔹 Load groups
  const loadGroups = async () => {
    try {
      const res = await API.get("/groups");
      setGroups(res.data);

      if (res.data.length > 0) {
        setSelectedGroup(res.data[0]._id);
      }
    } catch (err) {
      console.log(err);
    }
  };

  // 🔹 Load members
  const loadMembers = useCallback(async () => {
    if (!selectedGroup) return;

    try {
      const res = await API.get(`/members/${selectedGroup}`);
      setMembers(res.data);
    } catch (err) {
      console.log(err);
    }
  }, [selectedGroup]);

  // 🔹 Delete member
  const deleteMember = async (id: string) => {
    try {
      await API.delete(`/members/${id}`);
      await loadMembers();
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    loadGroups();
  }, []);

  useEffect(() => {
    loadMembers();
  }, [loadMembers]);

  return (
    <div className="p-4 space-y-4 pb-20 bg-gray-100 min-h-screen">
      {/* 📦 Group Selector */}
      <select
        className="w-full border p-3 rounded-xl bg-white shadow-sm"
        value={selectedGroup}
        onChange={(e) => setSelectedGroup(e.target.value)}
      >
        {groups.map((g: any) => (
          <option key={g._id} value={g._id}>
            {g.name}
          </option>
        ))}
      </select>

      {/* ➕ Add Member */}
      {isAdmin && (
        <div className="bg-white p-4 rounded-xl shadow">
          <AddMember groupId={selectedGroup} onSuccess={loadMembers} />
        </div>
      )}

      {/* 👥 Members */}
      <div className="space-y-3">
        {members.length === 0 ? (
          <p className="text-gray-400 text-center">No members</p>
        ) : (
          members.map((m: any) => (
            <div
              key={m._id}
              className="bg-white rounded-xl shadow p-3 space-y-2"
            >
              {/* 🔹 Top Row */}
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">{m.name}</p>
                  <p className="text-sm text-gray-500">{m.phone}</p>
                </div>

                {isAdmin && (
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setEditId(m._id);
                        setEditName(m.name);
                        setEditPhone(m.phone);
                      }}
                      className="text-blue-500 text-sm active:scale-95 transition"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => deleteMember(m._id)}
                      className="text-red-500 text-sm active:scale-95 transition"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>

              {/* ✏️ Edit Panel */}
              {editId === m._id && (
                <div className="bg-gray-50 border rounded-xl p-3 space-y-3 animate-fadeIn">
                  <input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Name"
                    className="w-full border p-2 rounded-lg"
                  />

                  <input
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    placeholder="Phone"
                    className="w-full border p-2 rounded-lg"
                  />

                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setEditId("")}
                      className="text-gray-500 text-sm"
                    >
                      Cancel
                    </button>

                    <button
                      onClick={async () => {
                        await API.put(`/members/${m._id}`, {
                          name: editName,
                          phone: editPhone,
                        });

                        setEditId("");
                        loadMembers();
                      }}
                      className="bg-green-500 text-white px-4 py-1 rounded-lg text-sm active:scale-95 transition"
                    >
                      Save
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Members;
