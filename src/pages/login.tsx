import { KeyboardEvent, useState } from "react";
import API from "../services/api";
import { useLanguage } from "../context/LanguageContext";

type Props = {
  setUser: (user: any) => void;
};

const Login = ({ setUser }: Props) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useLanguage();

  const handleLogin = async () => {
    const u = username.trim();
    const p = password.trim();

    if (!u || !p) {
      alert(t("enter_username_password"));
      return;
    }

    try {
      setIsLoading(true);

      const res = await API.post("/auth/login", {
        username: u,
        password: p,
      });

      localStorage.setItem("user", JSON.stringify(res.data.user));
      localStorage.setItem("token", res.data.token);
      setUser(res.data.user);
    } catch (err: any) {
      alert(err.response?.data?.message || "Invalid username or password");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !isLoading) {
      void handleLogin();
    }
  };

  return (
    <div className="app-shell flex items-center justify-center">
      <div className="glass-card w-full max-w-sm rounded-[32px] p-6">
        <p className="section-title">KLM Chit</p>
        <h2 className="mt-2 text-[2rem] font-extrabold leading-tight">{t("login")}</h2>
        <p className="mt-2 text-sm text-[#7b6a56]">
          Built for on-the-go admin work and quick member lookup.
        </p>

        <div className="mt-6 space-y-3">
          <input
            placeholder={t("username")}
            className="input-surface"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={handleKeyDown}
          />

          <input
            type="password"
            placeholder={t("password")}
            className="input-surface"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>

        <button
          onClick={() => void handleLogin()}
          disabled={isLoading}
          className="pill-button mt-5 w-full bg-[#c75c2a] text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? t("logging_in") : t("login")}
        </button>
      </div>
    </div>
  );
};

export default Login;
