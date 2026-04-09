import { useCallback, useEffect, useMemo, useState } from "react";
import API from "../services/api";
import AddMember from "../components/Addmember";
import Breadcrumbs from "../components/Breadcrumbs";
import { useLanguage } from "../context/LanguageContext";

const Members = () => {
  const [groups, setGroups] = useState<any[]>([]);
  const [selectedGroup, setSelectedGroup] = useState("");
  const [members, setMembers] = useState<any[]>([]);
  const [editId, setEditId] = useState("");
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isAdmin = user.role === "admin";
  const { t } = useLanguage();

  const activeGroups = useMemo(
    () => groups.filter((group) => !group.isEnded),
    [groups],
  );

  const selectedGroupData = activeGroups.find(
    (group) => group._id === selectedGroup,
  );

  const loadGroups = useCallback(async () => {
    try {
      const res = await API.get("/groups");
      const nextGroups = res.data.filter((group: any) => !group.isEnded);
      setGroups(res.data);

      if (nextGroups.length === 0) {
        setSelectedGroup("");
        setMembers([]);
        return;
      }

      setSelectedGroup((currentValue) => {
        const existing = nextGroups.find(
          (group: any) => group._id === currentValue,
        );
        return existing?._id || nextGroups[0]._id;
      });
    } catch (err) {
      console.log(err);
    }
  }, []);

  const loadMembers = useCallback(async () => {
    if (!selectedGroup) return;

    try {
      const res = await API.get(`/members/${selectedGroup}`);
      setMembers(res.data);
    } catch (err) {
      console.log(err);
    }
  }, [selectedGroup]);

  const deleteMember = async (id: string) => {
    const ok = window.confirm("Delete this member?");
    if (!ok) return;

    try {
      await API.delete(`/members/${id}`);
      await loadMembers();
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    loadGroups();
  }, [loadGroups]);

  useEffect(() => {
    loadMembers();
  }, [loadMembers]);

  if (activeGroups.length === 0) {
    return (
      <div className="space-y-4 fade-in-up">
        <Breadcrumbs items={[t("home"), t("members")]} />
        <div className="glass-card rounded-[28px] p-6">
          <p className="section-title">No active groups</p>
          <h1 className="mt-2 text-2xl font-extrabold">
            Members will appear here
          </h1>
          <p className="mt-2 text-sm text-[#7b6a56]">
            Create a new chit in Settings before adding members.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 fade-in-up">
      <Breadcrumbs items={[t("home"), t("members")]} />

      <div className="glass-card rounded-[30px] p-5">
        <p className="section-title">{t("people")}</p>
        <h1 className="mt-2 text-[1.65rem] font-extrabold leading-tight">
          {t("manage_members")}
        </h1>
        <p className="mt-2 text-sm text-[#7b6a56]">
          Switch groups, add people fast, and update details.
        </p>

        <select
          className="input-surface mt-5"
          value={selectedGroup}
          onChange={(e) => setSelectedGroup(e.target.value)}
        >
          {activeGroups.map((group: any) => (
            <option key={group._id} value={group._id}>
              {group.name}
            </option>
          ))}
        </select>

        {selectedGroupData && (
          <div className="mt-4 rounded-[22px] bg-[#fff7f0] p-4">
            <p className="font-bold">{selectedGroupData.name}</p>
            <p className="mt-1 text-sm text-[#7b6a56]">
              {members.length} {t("members_in_group")}
            </p>
          </div>
        )}
      </div>

      {isAdmin && (
        <div className="soft-card rounded-[28px] p-4">
          <AddMember groupId={selectedGroup} onSuccess={loadMembers} />
        </div>
      )}

      <div className="space-y-3">
        {members.length === 0 ? (
          <div className="soft-card rounded-[26px] p-5 text-center">
            <p className="text-sm text-[#7b6a56]">{t("no_members_group")}</p>
          </div>
        ) : (
          members.map((member: any) => (
            <div key={member._id} className="soft-card rounded-[26px] p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-lg font-extrabold">{member.name}</p>
                  <p className="mt-1 text-sm text-[#7b6a56]">{member.phone}</p>
                </div>

                {isAdmin && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setEditId(member._id);
                        setEditName(member.name);
                        setEditPhone(member.phone);
                      }}
                      className="pill-button bg-[#e9efff] px-4 py-2 text-sm text-[#3558a8]"
                    >
                      {t("edit")}
                    </button>
                    <button
                      onClick={() => deleteMember(member._id)}
                      className="pill-button bg-[#f8dfd7] px-4 py-2 text-sm text-[#b54848]"
                    >
                      {t("delete")}
                    </button>
                  </div>
                )}
              </div>

              {editId === member._id && (
                <div className="mt-4 space-y-3 rounded-[22px] bg-[#faf6ef] p-4">
                  <input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder={t("name")}
                    className="input-surface"
                  />
                  <input
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    placeholder={t("phone")}
                    className="input-surface"
                  />

                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => setEditId("")}
                      className="pill-button bg-[#efe8dc] px-4 py-2 text-sm text-[#6f604c]"
                    >
                      {t("cancel")}
                    </button>
                    <button
                      onClick={async () => {
                        await API.put(`/members/${member._id}`, {
                          name: editName,
                          phone: editPhone,
                        });

                        setEditId("");
                        loadMembers();
                      }}
                      className="pill-button bg-[#2f8f62] px-4 py-2 text-sm text-white"
                    >
                      {t("save")}
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
