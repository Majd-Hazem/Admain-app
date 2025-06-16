import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import "./Login.css";

function Login() {
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // التحقق من بيانات الدخول الثابتة
    const { username, password } = credentials;
    const isAdmin = username === "admin" && password === "123456";

    if (isAdmin) {
      login("admin"); // تسجيل الدخول كأدمن
      // التوجيه إلى لوحة التحكم
      navigate("/admin-dashboard/services", { replace: true });
    } else {
      alert("اسم المستخدم أو كلمة المرور غير صحيحة");
    }
  };

  return (
    <div className="login-page">
      <form className="login-box" onSubmit={handleSubmit}>
        <h2>تسجيل الدخول</h2>

        <input
          type="text"
          name="username"
          placeholder="اسم المستخدم"
          value={credentials.username}
          onChange={handleChange}
          autoComplete="username"
          required
        />

        <input
          type="password"
          name="password"
          placeholder="كلمة المرور"
          value={credentials.password}
          onChange={handleChange}
          autoComplete="current-password"
          required
        />

        <button type="submit">دخول</button>
      </form>
    </div>
  );
}

export default Login;
