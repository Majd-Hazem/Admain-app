import React from "react";
import axios from "axios";
import { toast } from "react-toastify"; // ← تأكد من أنك تستخدمها
import "./ReactivatePage.css";

function ReactivatePage() {
  const handleReactivateAll = async () => {
    try {
      const response = await axios.put(
        "http://eallaenjazapi.runasp.net/api/Student_/ADMAIN_UPDATE_STUDENT_SET_UN_ACTIVE",
        null,
        { headers: { Accept: "text/plain" } }
      );

      toast.success(response.data || "تمت إعادة التفعيل بنجاح");
    } catch (error) {
      console.error("❌ فشل في التفعيل:", error);
      toast.error("⚠️ فشل في إعادة التفعيل");
    }
  };

  return (
    <div className="page-box">
      <h2>إعادة تفعيل حسابات مقدمي الخدمات</h2>
      <p>اضغط على الزر لإعادة تفعيل جميع الحسابات المعطلة تلقائيًا.</p>
      <button className="reactivate-button" onClick={handleReactivateAll}>
        إعادة تفعيل الكل
      </button>
    </div>
  );
}

export default ReactivatePage;
