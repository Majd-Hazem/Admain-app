import React from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify"; // تم إضافة ToastContainer هنا
import "react-toastify/dist/ReactToastify.css"; // تأكد من استيراد الـ CSS الخاصة بـ react-toastify
import "./ReactivatePage.css";

function ReactivatePage() {
  const handleReactivateAll = async () => {
    try {
      const response = await axios.put(
        "http://eallaenjazapi.runasp.net/api/Student_/ADMAIN_UPDATE_STUDENT_SET_UN_ACTIVE",
        null,
        { headers: { Accept: "text/plain" } }
      );

      // console.log(response.data); // تحقق من محتوى الاستجابة في الـ console
      toast.success("تمت إعادة التفعيل بنجاح");
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

      {/* تأكد من أن ToastContainer موجود هنا */}
      <ToastContainer />
    </div>
  );
}

export default ReactivatePage;
