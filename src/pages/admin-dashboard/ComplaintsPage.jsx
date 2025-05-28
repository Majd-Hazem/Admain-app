// استيراد React وhooks الأساسية
import React, { useState, useEffect } from "react";
// استيراد toast للتنبيهات
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// استيراد الأيقونات من مكتبة lucide-react
import {
  FileText,
  User,
  CreditCard,
  MessageSquare,
  Upload,
  CheckCircle,
  X,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Download,
  File,
  AlertCircle,
} from "lucide-react";
// استيراد ملف الأنماط CSS
import "./ComplaintsPage.css";

// تعريف المكون الرئيسي لصفحة الشكاوى
const ComplaintsPage = () => {
  // حالة لتخزين قائمة الشكاوى
  const [complaints, setComplaints] = useState([]);
  // حالة لتخزين الشكوى المحددة حالياً
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  // حالة لتتبع الخطوة الحالية في عملية عرض تفاصيل الشكوى
  const [currentStep, setCurrentStep] = useState(1);
  // حالة لتتبع حالة التحميل
  const [loading, setLoading] = useState(false);
  // حالة لتتبع عملية إنهاء الشكوى
  const [finishing, setFinishing] = useState(false);
  // حالة لتخزين بيانات الشكوى المفصلة
  const [complaintData, setComplaintData] = useState({
    order: null,
    presenter: null,
    provider: null,
    complaint: null,
  });
  // حالة لتخزين بيانات الدفع
  const [paymentData, setPaymentData] = useState({
    buymentInfo: null,
    transactions: [],
    outstandingBalance: null,
  });
  // حالة لتخزين الملفات المرفقة
  const [attachedFiles, setAttachedFiles] = useState([]);
  // حالة لتخزين رسالة النجاح
  const [successMessage, setSuccessMessage] = useState("");

  // -------- حالات حل الشكوى (case 6) ---------
  // حالة لتخزين القيمة المحجوزة للتحويل
  const [reservedAmount, setReservedAmount] = useState(null);
  // قيمة المبلغ المدخل من الأدمن
  const [transferAmount, setTransferAmount] = useState("");
  // ملاحظة التحويل (اختياري)
  const [transferNote, setTransferNote] = useState("");
  // الجهة المستهدفة للتحويل
  const [transferTarget, setTransferTarget] = useState(""); // "provider" or "presenter"
  // حالة تحميل التحويل
  const [transferring, setTransferring] = useState(false);
  const [transferError, setTransferError] = useState("");

  // --------------------------------------------

  // تشغيل دالة جلب الشكاوى عند تحميل المكون
  useEffect(() => {
    fetchComplaints();
  }, []);

  // دالة لجلب قائمة الشكاوى من الخادم
  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        "http://eallaenjazapi.runasp.net/api/Complaints/GET_ID_ORDERS_FROM_EXITE_COMPLEMENT"
      );
      const data = await response.json();
      if (Array.isArray(data)) {
        const formatted = data.map((id) => ({ id, title: `شكوى رقم ${id}` }));
        setComplaints(formatted);
      } else {
        console.error("الاستجابة غير متوقعة:", data);
        setComplaints([]);
      }
    } catch (error) {
      console.error("فشل في تحميل الشكاوى:", error);
      toast.error("فشل في تحميل الشكاوى");
      setComplaints([]);
    } finally {
      setLoading(false);
    }
  };

  // دالة لجلب بيانات الدفع والمعاملات
  const fetchPaymentData = async (complaintId) => {
    try {
      setLoading(true);
      const buymentResponse = await fetch(
        `http://eallaenjazapi.runasp.net/api/Buyment/GET_INFO_Buyment_By_ID_Orders${complaintId}`
      );
      const buymentData = await buymentResponse.json();

      const transactionsResponse = await fetch(
        `http://eallaenjazapi.runasp.net/api/Transaction/GET_ALL_TRANSACTION_BY_ID_ORDERS${complaintId}`
      );
      const transactionsData = await transactionsResponse.json();

      const balanceResponse = await fetch(
        `http://eallaenjazapi.runasp.net/api/Transaction/GET_Knowing_the_outstanding_balance_in_the_system_By_Id_Order${complaintId}`
      );
      const balanceData = await balanceResponse.json();

      setPaymentData({
        buymentInfo: buymentData,
        transactions: Array.isArray(transactionsData) ? transactionsData : [],
        outstandingBalance: balanceData,
      });

      // تعيين القيمة المحجوزة للحلول لاحقاً أيضاً
      setReservedAmount(
        typeof balanceData === "number" ? balanceData : Number(balanceData) || 0
      );
    } catch (error) {
      console.error("فشل تحميل بيانات الدفع:", error);
      toast.error("فشل في تحميل بيانات الدفع");
      setPaymentData({
        buymentInfo: null,
        transactions: [],
        outstandingBalance: null,
      });
      setReservedAmount(0);
    } finally {
      setLoading(false);
    }
  };

  // دالة لجلب الملفات المرفقة
  const fetchAttachedFiles = async (complaintId) => {
    try {
      setLoading(true);
      const response = await fetch(
        `http://eallaenjazapi.runasp.net/api/Files/GET_ALL_GET_ALL_FILES_BY_ID_ORDERS${complaintId}`
      );
      const filesData = await response.json();

      if (Array.isArray(filesData)) {
        setAttachedFiles(filesData);
      } else {
        console.error("استجابة الملفات غير متوقعة:", filesData);
        setAttachedFiles([]);
      }
    } catch (error) {
      console.error("فشل تحميل الملفات المرفقة:", error);
      toast.error("فشل في تحميل الملفات المرفقة");
      setAttachedFiles([]);
    } finally {
      setLoading(false);
    }
  };

  // دالة لجلب تفاصيل شكوى محددة
  const fetchComplaintDetails = async (complaintId) => {
    try {
      setLoading(true);

      const orderResponse = await fetch(
        `http://eallaenjazapi.runasp.net/api/Orders/GET_INFO_ORDER_BY_ID_ORDER${complaintId}`
      );
      if (!orderResponse.ok) {
        throw new Error("فشل في جلب معلومات الطلب");
      }
      const orderData = await orderResponse.json();

      const complaintResponse = await fetch(
        `http://eallaenjazapi.runasp.net/api/Complaints/GET_Complaints_BY_ID_ORDERS${complaintId}`
      );
      if (!complaintResponse.ok) {
        throw new Error("فشل في جلب معلومات الشكوى");
      }
      const complaintInfo = await complaintResponse.json();

      const studentResponse = await fetch(
        `http://eallaenjazapi.runasp.net/api/Student_/GET_INFO_FROM_STUDENT_UNVIRSTY_PERSON_USED_SHOW_SERVES_BY_ID_STUDENT${orderData.iD_Student_Service_provider}`
      );
      if (!studentResponse.ok) {
        throw new Error("فشل في جلب معلومات مقدم الخدمة");
      }
      const studentData = await studentResponse.json();

      const presenterResponse = await fetch(
        `http://eallaenjazapi.runasp.net/api/Person/GET_Info_PERSON_BY_ID_Person_Using_Profile_Person${orderData.iD_pesron_Presenter_Order}`
      );
      if (!presenterResponse.ok) {
        throw new Error("فشل في جلب معلومات طالب الخدمة");
      }
      const presenterData = await presenterResponse.json();

      setComplaintData({
        order: orderData,
        provider: studentData,
        presenter: presenterData,
        complaint: complaintInfo,
      });

      // جلب بيانات الدفع وأيضاً تحديث القيمة المحجوزة case 6
      await fetchPaymentData(complaintId);

      // جلب الملفات المرفقة
      await fetchAttachedFiles(complaintId);
    } catch (error) {
      console.error("فشل تحميل تفاصيل الشكوى:", error);
      toast.error("فشل في تحميل تفاصيل الشكوى: " + error.message);
      setComplaintData({
        order: null,
        presenter: null,
        provider: null,
        complaint: null,
      });
      setPaymentData({
        buymentInfo: null,
        transactions: [],
        outstandingBalance: null,
      });
      setAttachedFiles([]);
      setReservedAmount(0);
    } finally {
      setLoading(false);
    }
  };

  // ----------- حل الشكوى - جلب القيمة المحجوزة من جديد عند دخول case 6 -----------
  useEffect(() => {
    // عند تغيير الخطوة إلى 6 أو الشكوى، أعِد جلب القيمة المحجوزة وافرغ القيم
    if (selectedComplaint && currentStep === 6) {
      fetchReservedAmount(selectedComplaint.id);
      setTransferAmount("");
      setTransferNote("");
      setTransferTarget("");
      setTransferError("");
    }
    // eslint-disable-next-line
  }, [currentStep, selectedComplaint]);
  // -------------------------------------------------------------------------------

  // دالة منفصلة لجلب القيمة المحجوزة (غير بيانات الدفع)
  const fetchReservedAmount = async (complaintId) => {
    try {
      const response = await fetch(
        `http://eallaenjazapi.runasp.net/api/Transaction/GET_Knowing_the_outstanding_balance_in_the_system_By_Id_Order${complaintId}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("Reserved amount result:", result); // للتشخيص

      setReservedAmount(
        typeof result === "number" ? result : Number(result) || 0
      );
    } catch (error) {
      console.error("خطأ في جلب القيمة المحجوزة:", error);
      setReservedAmount(0);
      toast.error("تعذر جلب القيمة المحجوزة");
    }
  };

  // دالة التحقق من صحة إدخال التحويل - محسّنة
  const validateTransfer = () => {
    setTransferError(""); // إعادة تعيين الأخطاء

    if (!transferAmount || transferAmount.trim() === "") {
      setTransferError("الرجاء إدخال مبلغ التحويل");
      return false;
    }

    const numericAmount = Number(transferAmount);

    if (isNaN(numericAmount)) {
      setTransferError("الرجاء إدخال مبلغ صالح (أرقام فقط)");
      return false;
    }

    if (numericAmount <= 0) {
      setTransferError("يجب أن يكون المبلغ أكبر من صفر");
      return false;
    }

    if (reservedAmount !== null && numericAmount > reservedAmount) {
      setTransferError(
        `المبلغ المدخل (${numericAmount}) أكبر من القيمة المحجوزة (${reservedAmount})`
      );
      return false;
    }

    if (!transferTarget) {
      setTransferError("يرجى اختيار جهة التحويل");
      return false;
    }

    return true;
  };

  // دالة فتح toast تأكيد التحويل (modal) - محسّنة
  const confirmTransfer = () => {
    if (!validateTransfer()) {
      toast.error(transferError);
      return;
    }

    const targetName =
      transferTarget === "provider" ? "مقدم الخدمة" : "طالب الخدمة";
    const confirmMessage = `هل أنت متأكد من تحويل مبلغ ${transferAmount} دينار إلى ${targetName}؟`;

    toast.info(
      <div style={{ textAlign: "center" }}>
        <div style={{ marginBottom: "12px", fontSize: "14px" }}>
          {confirmMessage}
        </div>
        {transferNote && (
          <div
            style={{ marginBottom: "12px", fontSize: "12px", color: "#666" }}
          >
            ملاحظة: {transferNote}
          </div>
        )}
        <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
          <button
            className="btn btn-success"
            style={{
              padding: "6px 12px",
              fontSize: "12px",
              backgroundColor: "#28a745",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
            onClick={() => {
              toast.dismiss();
              handleTransfer();
            }}
          >
            تأكيد التحويل
          </button>
          <button
            className="btn btn-outline"
            style={{
              padding: "6px 12px",
              fontSize: "12px",
              backgroundColor: "transparent",
              color: "#6c757d",
              border: "1px solid #6c757d",
              borderRadius: "4px",
              cursor: "pointer",
            }}
            onClick={() => toast.dismiss()}
          >
            إلغاء
          </button>
        </div>
      </div>,
      {
        autoClose: false,
        closeOnClick: false,
        draggable: false,
        closeButton: false,
      }
    );
  };

  // دالة تنفيذ التحويل (API POST) - محسّنة مع معالجة أفضل للأخطاء
  const handleTransfer = async () => {
    if (!selectedComplaint?.id) {
      toast.error("خطأ: لا يوجد معرف شكوى صالح");
      return;
    }

    setTransferring(true);
    setTransferError("");

    try {
      const apiBody = {
        iD_ORDERS: selectedComplaint.id,
        ammount: Number(transferAmount),
        note: transferNote || "",
        into_transfar: transferTarget === "presenter" ? 1 : 2,
      };

      console.log("Transfer API Body:", apiBody); // للتشخيص

      const response = await fetch(
        "http://eallaenjazapi.runasp.net/api/Transaction/ADD_TRANSACTION_IN_ADMAIN",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(apiBody),
        }
      );

      console.log("Transfer Response Status:", response.status); // للتشخيص

      if (!response.ok) {
        const errorText = await response.text();
        console.log("Transfer Error Response:", errorText); // للتشخيص
        throw new Error(`خطأ من الخادم (${response.status}): ${errorText}`);
      }

      const result = await response.text();
      console.log("Transfer Success Response:", result); // للتشخيص

      toast.success("تم تحويل المبلغ بنجاح ✅");

      // تحديث القيمة المحجوزة
      setReservedAmount((prev) =>
        prev !== null ? Math.max(0, prev - Number(transferAmount)) : prev
      );

      // إعادة تعيين النموذج
      setTransferAmount("");
      setTransferNote("");
      setTransferTarget("");

      // إعادة جلب بيانات الدفع المحدثة
      await fetchPaymentData(selectedComplaint.id);
    } catch (error) {
      console.error("خطأ في التحويل:", error);
      const errorMessage = error.message || "فشل في عملية التحويل";
      setTransferError(errorMessage);
      toast.error("فشل التحويل: " + errorMessage);
    } finally {
      setTransferring(false);
    }
  };

  // دالة لإنهاء الشكوى
  const finishComplaint = async () => {
    if (!selectedComplaint?.id) {
      toast.error("خطأ: لا يوجد معرف شكوى صالح");
      return;
    }
    try {
      setFinishing(true);

      const response = await fetch(
        `http://eallaenjazapi.runasp.net/api/Complaints/End_the_complaint${selectedComplaint.id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`رمز ${response.status} – ${errorText}`);
      }

      const result = await response.text();
      const message = result || "تم إنهاء الشكوى بنجاح";
      setSuccessMessage(message);
      toast.success(message);

      setTimeout(() => {
        handleCloseDetails();
        fetchComplaints();
      }, 2000);
    } catch (error) {
      toast.error(`حدث خطأ أثناء إنهاء الشكوى: ${error.message}`);
    } finally {
      setFinishing(false);
    }
  };

  // دالة للتعامل مع النقر على شكوى
  const handleComplaintClick = async (complaint) => {
    setSelectedComplaint(complaint);
    setCurrentStep(1);
    setSuccessMessage("");
    await fetchComplaintDetails(complaint.id);
  };

  // دالة لإغلاق عرض تفاصيل الشكوى
  const handleCloseDetails = () => {
    setSelectedComplaint(null);
    setCurrentStep(1);
    setSuccessMessage("");
    setComplaintData({
      order: null,
      presenter: null,
      provider: null,
      complaint: null,
    });
    setPaymentData({
      buymentInfo: null,
      transactions: [],
      outstandingBalance: null,
    });
    setAttachedFiles([]);
    setReservedAmount(null);
    setTransferAmount("");
    setTransferNote("");
    setTransferTarget("");
    setTransferError("");
  };

  // دالة للتعامل مع النقر على خطوة معينة
  const handleStepClick = (stepNumber) => {
    setCurrentStep(stepNumber);
  };

  // دالة لاستخراج اسم الملف من المسار
  const getFileName = (filePath) => {
    if (!filePath) return "ملف غير معروف";
    const parts = filePath.split("/");
    const fileName = parts[parts.length - 1];
    return fileName;
  };

  // دالة لتحديد نوع الملف وإرجاع الأيقونة المناسبة
  const getFileIcon = (filePath) => {
    if (!filePath) return <File size={20} />;
    const extension = filePath.split(".").pop()?.toLowerCase();
    switch (extension) {
      case "pdf":
        return <FileText size={20} className="file-icon pdf" />;
      case "doc":
      case "docx":
        return <FileText size={20} className="file-icon doc" />;
      case "ppt":
      case "pptx":
        return <FileText size={20} className="file-icon ppt" />;
      case "xls":
      case "xlsx":
        return <FileText size={20} className="file-icon excel" />;
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
        return <FileText size={20} className="file-icon image" />;
      default:
        return <File size={20} className="file-icon default" />;
    }
  };

  // تعريف الخطوات مع أيقوناتها وعناوينها
  const steps = [
    { number: 1, title: "معلومات الطلب", icon: <FileText size={20} /> },
    { number: 2, title: "معلومات شخصية", icon: <User size={20} /> },
    { number: 3, title: "تفاصيل الدفع", icon: <CreditCard size={20} /> },
    { number: 4, title: "تفاصيل الشكوى", icon: <MessageSquare size={20} /> },
    { number: 5, title: "الملفات المرفقة", icon: <Upload size={20} /> },
    { number: 6, title: "حل الشكوى", icon: <CheckCircle size={20} /> },
    { number: 7, title: "إنهاء الشكوى", icon: <CheckCircle size={20} /> },
  ];

  // دالة لعرض محتوى الخطوة الحالية
  const renderStepContent = () => {
    const { order, presenter, provider, complaint } = complaintData;
    const { buymentInfo, transactions, outstandingBalance } = paymentData;

    // التحقق من الخطوة الحالية وعرض المحتوى المناسب
    switch (currentStep) {
      case 1:
        // عرض معلومات الطلب
        return (
          <div className="step-content">
            {/* عنوان الخطوة */}
            <h3>معلومات الطلب</h3>
            {/* التحقق من وجود بيانات الطلب */}
            {order && (
              <div className="info-grid">
                {/* عنوان الخدمة */}
                <div className="info-item">
                  <label>عنوان الخدمة:</label>
                  <span>{order.titel_serves}</span>
                </div>
                {/* اسم الخدمة الرئيسية */}
                <div className="info-item">
                  <label>اسم الخدمة (الرئيسية):</label>
                  <span>{order.name_Serves}</span>
                </div>
                {/* فرع الخدمة */}
                <div className="info-item">
                  <label>فرع الخدمة:</label>
                  <span>{order.branch_Serves}</span>
                </div>
                {/* نوع الخدمة الرئيسية */}
                <div className="info-item">
                  <label>نوع الخدمة (الرئيسية):</label>
                  <span>{order.type_serves}</span>
                </div>
                {/* وصف الخدمة */}
                <div className="info-item">
                  <label>وصف الخدمة:</label>
                  <span>{order.describtion_Serves}</span>
                </div>
                {/* المبلغ المدفوع */}
                <div className="info-item">
                  <label>المبلغ المدفوع:</label>
                  <span>{order.price} دينار أردني</span>
                </div>
                {/* مدة التوصيل */}
                <div className="info-item">
                  <label>مدة التوصيل المتفق عليها:</label>
                  <span>{order.delivery_time}</span>
                </div>
                {/* تاريخ الطلب */}
                <div className="info-item">
                  <label>تاريخ الطلب:</label>
                  <span>{order.date_Order?.split("T")[0]}</span>
                </div>
                {/* الموقع */}
                <div className="info-item">
                  <label>الموقع:</label>
                  <span>{order.location}</span>
                </div>
                {/* التحقق من وجود ملفات مرفقة */}
                {order.files && (
                  <div className="info-item">
                    <label>الملف المرفق:</label>
                    {/* رابط لعرض الملف */}
                    <a
                      href={order.files}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="file-link"
                    >
                      عرض الملف
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>
        );

      case 2:
        // عرض المعلومات الشخصية
        return (
          <div className="step-content">
            {/* عنوان الخطوة */}
            <h3>معلومات شخصية</h3>
            <div className="persons-container">
              {/* التحقق من وجود بيانات الطالب */}
              {provider && (
                <div className="person-card">
                  <h4>مقدم الخدمة</h4>
                  <div className="person-info">
                    <img
                      src={provider.mainImageUrl}
                      alt="provider"
                      className="person-image"
                    />
                    <div className="person-details">
                      <p>
                        <strong>الاسم:</strong> {provider.fullName}
                      </p>
                      <p>
                        <strong>البريد الإلكتروني:</strong> {provider.email}
                      </p>
                      <p>
                        <strong>التخصص الجامعي:</strong>{" "}
                        {provider.universityMajor}
                      </p>
                      <p>
                        <strong>الجامعة:</strong> {provider.universityName}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* التحقق من وجود بيانات مقدم الخدمة */}
              {presenter && (
                <div className="person-card">
                  <h4>طالب الخدمة</h4>
                  <div className="person-info">
                    <img
                      src={presenter.main_Imege_Url}
                      alt="Presenter"
                      className="person-image"
                    />
                    <div className="person-details">
                      <p>
                        <strong>الاسم:</strong> {presenter.f_name}{" "}
                        {presenter.l_name}
                      </p>
                      <p>
                        <strong>البريد الإلكتروني:</strong> {presenter.email}
                      </p>
                      <p>
                        <strong>رقم الهاتف:</strong> {presenter.phone}
                      </p>

                      <p>
                        <strong>نبذة شخصية:</strong>{" "}
                        {presenter.personal_profile}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      case 3:
        // عرض تفاصيل الدفع من البيانات الحقيقية
        return (
          <div className="step-content">
            {/* عنوان الخطوة */}
            <h3> (رقم الطلب: {selectedComplaint.id}) تفاصيل الدفع</h3>

            {/* بيانات الدفع الأساسية */}
            {buymentInfo && (
              <div className="payment-summary">
                <h4>بيانات الدفع</h4>
                <div className="payment-line">
                  <span>
                    <strong>رقم العملية:</strong>{" "}
                    {buymentInfo.id || selectedComplaint.id}
                  </span>
                  <span className="separator">|</span>
                  <span>
                    <strong>المبلغ المدفوع:</strong>{" "}
                    {buymentInfo.price || buymentInfo.amount || 0} د.أ
                  </span>
                  <span className="separator">|</span>
                  <span>
                    <strong>تاريخ الدفع:</strong>{" "}
                    {buymentInfo.date?.split("T")[0] ||
                      buymentInfo.paymentDate?.split("T")[0] ||
                      "غير محدد"}
                  </span>
                  <span className="separator">|</span>
                  <span>
                    <strong>طريقة الدفع:</strong>{" "}
                    {buymentInfo.paymentMethod || "دفع إلكتروني"}
                  </span>
                </div>
              </div>
            )}

            {/* المعاملات */}
            <div className="transactions-section">
              <h4>المعاملات</h4>
              <div className="transactions-table">
                <table>
                  <thead>
                    <tr>
                      <th>رقم العملية</th>
                      <th>المبلغ</th>
                      <th>التاريخ</th>
                      <th>الاشراف</th>
                      <th>ملاحظات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.length > 0 ? (
                      transactions.map((transaction, index) => (
                        <tr key={transaction.id || index}>
                          <td>{transaction.id || index + 1}</td>
                          <td>
                            {transaction.amount || transaction.price || 0} د.أ
                          </td>
                          <td>
                            {transaction.date?.split("T")[0] ||
                              transaction.transactionDate?.split("T")[0] ||
                              "غير محدد"}
                          </td>
                          <td>
                            {transaction.type ||
                              transaction.supervisedBy ||
                              "معاملة"}
                          </td>
                          <td>
                            {transaction.description ||
                              transaction.note ||
                              "لا توجد ملاحظات"}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="no-transactions">
                          لا توجد معاملات مالية حتى الآن.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="reserved-amount">
              <h4>المبلغ المحجوز/المستحق</h4>

              {typeof outstandingBalance === "string" ? (
                // ✅ الحالة الأولى: رسالة نصية من الخادم
                <p className="reserved-info">
                  <strong>{outstandingBalance}</strong>
                </p>
              ) : typeof outstandingBalance === "number" ? (
                // ✅ الحالة الثانية: قيمة رقمية تمثل المبلغ المحجوز
                <p className="reserved-info">
                  <strong>المبلغ المحجوز حالياً: </strong>
                  {outstandingBalance} د.أ
                </p>
              ) : (
                // ✅ fallback إذا كان النوع غير معروف
                <p className="reserved-info">
                  <strong>المبلغ المحجوز حالياً: </strong>لا يوجد اي عملية على
                  الطلب
                </p>
              )}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="step-content">
            <h3>تفاصيل الشكوى</h3>
            {complaint && (
              <div className="complaint-details">
                <div className="complaint-item">
                  <label>حالة الشكوى:</label>
                  <span>{complaint.mode_Complaints}</span> {/* ← تعديل هنا */}
                </div>
                <div className="complaint-item">
                  <label>تاريخ الشكوى:</label>
                  <span>{complaint.date?.split("T")[0]}</span>{" "}
                  {/* ← تنسيق التاريخ */}
                </div>
                <div className="complaint-item full-width">
                  <label>وصف الشكوى:</label>
                  <div className="complaint-description">
                    {complaint.description}
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      case 5:
        // عرض الملفات المرفقة
        return (
          <div className="step-content">
            {/* عنوان الخطوة */}
            <h3>الملفات المرفقة</h3>
            <div className="files-section">
              {attachedFiles.length > 0 ? (
                <div className="files-grid">
                  {attachedFiles.map((file) => (
                    <div key={file.id} className="file-card">
                      <div className="file-header">
                        {getFileIcon(file.file_Path)}
                        <div className="file-info">
                          <h4 className="file-name">
                            {getFileName(file.file_Path)}
                          </h4>
                          {file.description && (
                            <p className="file-description">
                              {file.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="file-actions">
                        <a
                          href={file.file_Path}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="file-action-btn download-btn"
                        >
                          <Download size={16} />
                          تحميل
                        </a>
                        <a
                          href={file.file_Path}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="file-action-btn view-btn"
                        >
                          <FileText size={16} />
                          عرض
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-files">
                  <Upload size={48} />
                  <p>لا توجد ملفات مرفقة مع هذه الشكوى</p>
                </div>
              )}
            </div>
          </div>
        );

      case 6:
        // منطقة حل الشكوى وتحويل مبلغ مع جميع القيود (بدون Toast تأكيد)
        return (
          <div className="step-content">
            <div className="transfer-glass-card">
              <div className="transfer-glass-title">
                <CheckCircle size={26} className="transfer-title-icon" />
                <span>حل الشكوى - تحويل مبلغ</span>
              </div>
              <div className="transfer-glass-reserved">
                <span>القيمة المحتجزة:</span>{" "}
                <b>
                  {reservedAmount !== null ? (
                    <span>{reservedAmount} دينار أردني</span>
                  ) : (
                    <span>جاري التحميل...</span>
                  )}
                </b>
              </div>

              {/* يمكنك إضافة تحذير هنا دائم ثابت تحت العنوان */}
              <div
                className="transfer-warning"
                style={{
                  color: "#c47a19",
                  marginBottom: "8px",
                  textAlign: "center",
                  fontWeight: "bold",
                }}
              >
                تأكد من مراجعة المبلغ وجهة التحويل قبل الإرسال! لا يمكن التراجع
                بعد التحويل.
              </div>

              <form
                className="transfer-glass-form"
                onSubmit={async (e) => {
                  e.preventDefault();
                  // تحقق من صحة المدخلات أولاً
                  setTransferError("");
                  if (!transferAmount || transferAmount.trim() === "") {
                    setTransferError("الرجاء إدخال مبلغ التحويل");
                    return;
                  }
                  const numericAmount = Number(transferAmount);
                  if (isNaN(numericAmount)) {
                    setTransferError("الرجاء إدخال مبلغ صالح (أرقام فقط)");
                    return;
                  }
                  if (numericAmount <= 0) {
                    setTransferError("يجب أن يكون المبلغ أكبر من صفر");
                    return;
                  }
                  if (
                    reservedAmount !== null &&
                    numericAmount > reservedAmount
                  ) {
                    setTransferError(
                      `المبلغ المدخل أكبر من القيمة المحجوزة (${reservedAmount})`
                    );
                    return;
                  }
                  if (!transferTarget) {
                    setTransferError("يرجى اختيار جهة التحويل");
                    return;
                  }
                  // تنفيذ التحويل مباشرة (ربط بالـ API)
                  setTransferring(true);
                  try {
                    const apiBody = {
                      iD_ORDERS: selectedComplaint.id,
                      ammount: numericAmount,
                      note: transferNote || "",
                      into_transfar: transferTarget === "presenter" ? 1 : 2,
                    };
                    const response = await fetch(
                      "http://eallaenjazapi.runasp.net/api/Transaction/ADD_TRANSACTION_IN_ADMAIN",
                      {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json",
                          Accept: "application/json",
                        },
                        body: JSON.stringify(apiBody),
                      }
                    );
                    if (!response.ok) {
                      const errorText = await response.text();
                      setTransferError("فشل التحويل: " + errorText);
                      return;
                    }
                    // نجح التحويل
                    setTransferError(""); // إخفاء الأخطاء
                    setSuccessMessage("تم تحويل المبلغ بنجاح ✅");
                    // تحديث الرصيد
                    setReservedAmount((prev) =>
                      prev !== null ? Math.max(0, prev - numericAmount) : prev
                    );
                    setTransferAmount("");
                    setTransferNote("");
                    setTransferTarget("");
                    await fetchPaymentData(selectedComplaint.id);
                    // عرض رسالة نجاح أعلى الزر لفترة قصيرة
                    setTimeout(() => setSuccessMessage(""), 4000);
                  } catch (error) {
                    setTransferError(
                      "حدث خطأ أثناء التحويل: " + (error.message || "")
                    );
                  } finally {
                    setTransferring(false);
                  }
                }}
              >
                <div className="transfer-glass-field">
                  <span className="input-icon">💰</span>
                  <input
                    type="number"
                    className="transfer-glass-input"
                    value={transferAmount}
                    min={1}
                    step="0.01"
                    placeholder="المبلغ المراد تحويله (أرقام فقط)"
                    onChange={(e) =>
                      setTransferAmount(e.target.value.replace(/[^0-9.]/g, ""))
                    }
                    disabled={transferring}
                    autoFocus
                  />
                </div>
                <div className="transfer-glass-field">
                  <span className="input-icon">🔀</span>
                  <select
                    className="transfer-glass-input"
                    value={transferTarget}
                    onChange={(e) => setTransferTarget(e.target.value)}
                    disabled={transferring}
                  >
                    <option value="">جهة التحويل</option>
                    <option value="provider">مقدم الخدمة</option>
                    <option value="presenter">طالب الخدمة</option>
                  </select>
                </div>
                <div className="transfer-glass-field">
                  <span className="input-icon">📝</span>
                  <input
                    type="text"
                    className="transfer-glass-input"
                    value={transferNote}
                    onChange={(e) => setTransferNote(e.target.value)}
                    maxLength={150}
                    disabled={transferring}
                    placeholder="ملاحظة "
                  />
                </div>
                {/* خطأ أو نجاح */}
                {transferError && (
                  <div className="transfer-glass-error">{transferError}</div>
                )}
                {successMessage && (
                  <div className="transfer-glass-success">{successMessage}</div>
                )}
                <button
                  className="transfer-glass-btn"
                  disabled={
                    transferring || !reservedAmount || reservedAmount <= 0
                  }
                  type="submit"
                >
                  {transferring ? "جاري التحويل..." : "تحويل المبلغ"}
                </button>
              </form>
              <div className="transfer-animated-bg"></div>
            </div>
          </div>
        );
      case 7:
        return (
          <div className="step-content">
            <h3>إنهاء الشكوى</h3>
            <div className="completion-section">
              {!successMessage ? (
                <div className="completion-summary">
                  <CheckCircle size={64} className="completion-icon" />
                  <h4>هل أنت متأكد من إنهاء الشكوى؟</h4>
                  <p>
                    بمجرد الضغط على الزر سيتم تسجيل إنهاء الشكوى وإرسال تأكيد
                    للعميل.
                  </p>
                </div>
              ) : (
                <div className="completion-summary">
                  <CheckCircle size={64} className="completion-icon" />
                  <h4>{successMessage}</h4>
                </div>
              )}
              <div className="completion-actions">
                {!successMessage && (
                  <button
                    className="btn btn-success"
                    onClick={finishComplaint}
                    disabled={finishing}
                  >
                    {finishing ? "جاري إنهاء الشكوى..." : "إنهاء الشكوى"}
                  </button>
                )}
                <button
                  className="btn btn-outline"
                  onClick={handleCloseDetails}
                >
                  العودة للقائمة
                </button>
              </div>
            </div>
          </div>
        );

      default:
        // في حالة عدم تطابق أي خطوة
        return null;
    }
  };
  // إذا كانت هناك شكوى محددة، عرض واجهة التفاصيل
  if (selectedComplaint) {
    return (
      <div className="complaints-page">
        <div className="stepper-container">
          <div className="stepper-header">
            <button className="back-btn" onClick={handleCloseDetails}>
              <ArrowLeft size={20} />
              العودة لإدارة الشكاوى
            </button>
            <h2 className="header-title">الشكوى رقم {selectedComplaint.id}</h2>
          </div>
          <div className="stepper">
            {steps.map((step) => (
              <div
                key={step.number}
                className={`step ${
                  currentStep === step.number ? "step-active" : ""
                } ${currentStep > step.number ? "step-completed" : ""}`}
                onClick={() => handleStepClick(step.number)}
              >
                <div
                  className={`step-circle ${
                    currentStep === step.number ? "step-circle-active" : ""
                  } ${
                    currentStep > step.number ? "step-circle-completed" : ""
                  }`}
                >
                  {currentStep > step.number ? (
                    <CheckCircle size={16} />
                  ) : (
                    step.icon
                  )}
                </div>
                <span
                  className={`step-title ${
                    currentStep === step.number ? "step-title-active" : ""
                  } ${currentStep > step.number ? "step-title-completed" : ""}`}
                >
                  {step.title}
                </span>
              </div>
            ))}
          </div>
          <div className="step-container">
            {loading ? (
              <div className="loading">جاري التحميل...</div>
            ) : (
              renderStepContent()
            )}
          </div>
        </div>
      </div>
    );
  }

  // عرض الواجهة الرئيسية لقائمة الشكاوى
  return (
    <div className="complaints-page">
      <div className="page-header">
        <h1 className="page-title">إدارة الشكاوى</h1>
        <p className="page-subtitle">اختر شكوى للاطلاع على تفاصيلها</p>
      </div>
      {loading ? (
        <div className="loading">جاري تحميل الشكاوى...</div>
      ) : (
        <div className="complaints-grid">
          {complaints.map((complaint) => (
            <div
              key={complaint.id}
              className="complaint-card"
              onClick={() => handleComplaintClick(complaint)}
            >
              <div className="card-icon">
                <MessageSquare size={32} />
              </div>
              <div className="card-content">
                <h3 className="card-title">{complaint.title}</h3>
                <p className="card-subtitle">انقر للاطلاع على التفاصيل</p>
              </div>
              <div className="card-arrow">
                <ChevronLeft size={20} />
              </div>
            </div>
          ))}
        </div>
      )}
      {/* ToastContainer لوضع التنبيهات */}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
};

// تصدير المكون كتصدير افتراضي
export default ComplaintsPage;
