import { useState } from "react";

type Props = {
  setUser: (user: any) => void;
};

const Login = ({ setUser }: Props) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    const u = username.trim();
    const p = password.trim();

    // 👑 ADMIN
    if (u === "klmadmin" && p === "klmchitadmin") {
      localStorage.setItem(
        "user",
        JSON.stringify({
          name: "Admin",
          username: "klmadmin",
          role: "admin",
        }),
      );

      window.location.reload();
      return;
    }

    // 👤 MEMBER
    if (u === "klmchitmem" && p === "klmchit") {
      localStorage.setItem(
        "user",
        JSON.stringify({
          name: "Member",
          username: "klmchitmem",
          role: "member",
        }),
      );

      window.location.reload();
      return;
    }

    alert("Invalid username or password");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded-xl shadow w-full max-w-sm">
        <h2 className="text-xl font-bold mb-4 text-center">Login</h2>

        <input
          placeholder="Username"
          className="w-full border p-2 rounded mb-3"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full border p-2 rounded mb-4"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleLogin}
          className="w-full bg-blue-500 text-white py-2 rounded-lg active:scale-95 transition"
        >
          Login
        </button>
      </div>
    </div>
  );
};

export default Login;
