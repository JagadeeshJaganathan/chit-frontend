import { useState } from "react";
import API from "../services/api";
import { useLanguage } from "../context/LanguageContext";

const AddMember = ({ groupId, onSuccess }: any) => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const { t } = useLanguage();

  const handleSubmit = async () => {
    if (!name.trim() || !phone.trim()) {
      alert(`${t("name")} / ${t("phone")}`);
      return;
    }

    try {
      await API.post("/members", {
        name,
        phone,
        groupId,
      });

      alert(t("add_member"));
      setName("");
      setPhone("");
      onSuccess();
    } catch (err: any) {
      alert(err.response?.data?.message || "Error");
    }
  };

  return (
    <div>
      <p className="section-title">{t("add_member")}</p>
      <h3 className="mt-2 text-xl font-extrabold">{t("quick_add_mobile")}</h3>
      <div className="mt-4 space-y-3">
        <input
          className="input-surface"
          placeholder={t("name")}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          className="input-surface"
          placeholder={t("phone")}
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <button
          className="pill-button w-full bg-[#c75c2a] text-white"
          onClick={handleSubmit}
        >
          {t("add_member")}
        </button>
      </div>
    </div>
  );
};

export default AddMember;
