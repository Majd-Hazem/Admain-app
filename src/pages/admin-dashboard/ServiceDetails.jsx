import { useEffect, useState } from "react";
import axios from "axios";
import "./ServiceDetails.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import "react-toastify/dist/ReactToastify.css";
import {
  BookOpen,
  PenTool,
  Code,
  Calendar,
  Heart,
  Stethoscope,
  Home,
  ShoppingCart,
  Globe,
  Truck,
  Users,
  ChevronLeft,
} from "lucide-react";

const iconMap = {
  تعليمة: BookOpen,
  ابداعية: PenTool,
  تقنية: Code,
  فعاليات: Calendar,
  الرعاية: Heart,
  الصحية: Stethoscope,
  المنزلية: Home,
  التسويق: ShoppingCart,
  الترجمة: Globe,
  النقل: Truck,
  متنوعة: Users,
  مهنية: Users,
};

const ServiceDetails = () => {
  const { serviceId } = useParams();
  const navigate = useNavigate();

  const [personalInfo, setPersonalInfo] = useState(null);
  const [serviceInfo, setServiceInfo] = useState(null);
  const [images, setImages] = useState([]);
  const [mainServiceName, setMainServiceName] = useState("");
  const [subServiceName, setSubServiceName] = useState("");
  const [activeStep, setActiveStep] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // 1. جلب معلومات الخدمة
        const serviceRes = await axios.get(
          `http://eallaenjazapi.runasp.net/api/Serves_Student/GET_Serves_Student_By_Id/${serviceId}`
        );
        // console.log("📋 بيانات الخدمة:", serviceRes.data);
        setServiceInfo(serviceRes.data);

        const studentId = serviceRes.data.iD_Student;
        const serveS_ID = serviceRes.data.serveS_ID;
        const branch_Server_Id = serviceRes.data.branch_Server_Id;

        // 2. جلب معلومات الطالب
        try {
          const personalRes = await axios.get(
            `http://eallaenjazapi.runasp.net/api/Student_/GET_INFO_FROM_STUDENT_UNVIRSTY_PERSON_USED_SHOW_SERVES_BY_ID_STUDENT${studentId}`
          );
          // console.log("👤 بيانات الطالب:", personalRes.data);
          setPersonalInfo(personalRes.data);
        } catch (personalError) {
          // console.error("❌ خطأ في جلب بيانات الطالب:", personalError);
          setPersonalInfo({
            fullName: "غير متوفر",
            email: "غير متوفر",
            mainImageUrl: "",
            universityMajor: "غير متوفر",
            universityName: "غير متوفر",
          });
        }

        // 3. جلب اسم الخدمة الرئيسية
        try {
          const mainServiceRes = await axios.get(
            `http://eallaenjazapi.runasp.net/api/ Name_Serves/GET_SERVES ${serveS_ID}`
          );
          // console.log("🎯 الخدمة الرئيسية:", mainServiceRes.data);
          setMainServiceName(mainServiceRes.data?.name_Serves || "غير محدد");
        } catch (mainServiceError) {
          // console.error("❌ خطأ في جلب الخدمة الرئيسية:", mainServiceError);
          setMainServiceName("غير محدد");
        }

        // 4. جلب اسم الخدمة الفرعية
        try {
          const subServiceRes = await axios.get(
            `http://eallaenjazapi.runasp.net/api/Branch_Serves/GET_BRANCH_SERVES_BY_ID${branch_Server_Id}`
          );
          // console.log("🔸 الخدمة الفرعية:", subServiceRes.data);
          setSubServiceName(subServiceRes.data?.name || "غير محدد");
        } catch (subServiceError) {
          // console.error("❌ خطأ في جلب الخدمة الفرعية:", subServiceError);
          setSubServiceName("غير محدد");
        }

        // 5. جلب الصور - تم إصلاح الرابط لاستخدام serviceId الصحيح
        try {
          const imagesRes = await axios.get(
            `http://eallaenjazapi.runasp.net/api/Imege/GET_ALL_IMEGES_BY_ID_SERVES ${serviceId}`
          );
          // console.log("📷 الصور:", imagesRes.data);

          if (Array.isArray(imagesRes.data) && imagesRes.data.length > 0) {
            setImages(imagesRes.data);
          } else {
            // console.warn("⚠️ لم يتم العثور على صور للخدمة");
            setImages([]);
          }
        } catch (imagesError) {
          // console.error("❌ خطأ في جلب الصور:", imagesError);
          setImages([]);
        }
      } catch (error) {
        // console.error("❌ فشل في تحميل البيانات:", error);
        toast.error("حدث خطأ في تحميل البيانات");
      } finally {
        setLoading(false);
      }
    };

    if (serviceId) {
      fetchData();
    }
  }, [serviceId]);

  const handleAccept = () => {
    axios
      .put(
        `http://eallaenjazapi.runasp.net/api/Serves_Student/Accept_And_to_publish_Serves_Student${serviceId}`
      )
      .then(() => {
        toast.success("✅ تم نشر الخدمة");
        navigate("/admin-dashboard/services");
      })
      .catch(() => toast.error("حدث خطأ أثناء نشر الخدمة"));
  };

  const handleReject = () => {
    if (window.confirm("هل أنت متأكد من رفض الخدمة؟")) {
      axios
        .delete(
          `http://eallaenjazapi.runasp.net/api/Serves_Student/ADMIN_Delete_Serves_Student_By_Id_Serve_From_Admin ${serviceId}`
        )
        .then(() => {
          toast.success("❌ تم رفض الخدمة");
          navigate("/admin-dashboard/services");
        })
        .catch(() => toast.error("⚠️ حدث خطأ أثناء رفض الخدمة"));
    }
  };

  if (loading) {
    return (
      <div className="show-info-container">
        <div style={{ textAlign: "center", padding: "50px" }}>
          <div>جاري التحميل...</div>
        </div>
      </div>
    );
  }

  if (!serviceInfo) {
    return (
      <div className="show-info-container">
        <div style={{ textAlign: "center", padding: "50px", color: "red" }}>
          خطأ في تحميل بيانات الخدمة
        </div>
      </div>
    );
  }

  return (
    <div className="show-info-container">
      <div className="steps-navigation labeled">
        {[1, 2, 3].map((step) => (
          <div
            key={step}
            className="step-item"
            onClick={() => setActiveStep(step)}
          >
            <div className={`circle ${activeStep === step ? "active" : ""}`}>
              {step}
            </div>
            <span className="step-label">
              {step === 1
                ? "معلومات الخدمة"
                : step === 2
                ? "المعلومات الشخصية"
                : "إجراءات"}
            </span>
          </div>
        ))}
      </div>

      {activeStep === 1 && (
        <>
          <h2>معلومات الخدمة</h2>

          {/* عرض الصورة الرئيسية */}
          <div className="main-image-wrapper">
            {images.length > 0 && images[0]?.imeg_Url ? (
              <img
                src={images[0].imeg_Url}
                alt="الصورة الرئيسية"
                onError={(e) => {
                  // console.error("خطأ في تحميل الصورة:", images[0].imeg_Url);
                  e.target.style.display = "none";
                }}
              />
            ) : (
              <div
                style={{
                  padding: "40px",
                  backgroundColor: "#f5f5f5",
                  textAlign: "center",
                  border: "2px dashed #ddd",
                  borderRadius: "8px",
                }}
              >
                لا توجد صورة متاحة
              </div>
            )}
          </div>

          {/* عنوان الخدمة مع الأيقونة */}
          {(() => {
            const Icon = iconMap[mainServiceName?.trim()] || ChevronLeft;
            return (
              <div className="service-title-center with-icon">
                <Icon size={32} />
                <span>{serviceInfo?.service_Address || "عنوان غير محدد"}</span>
              </div>
            );
          })()}

          <div className="service-info-grid">
            <div className="info-item">
              <label>الخدمة الرئيسية:</label>
              <div className="info-value-box">
                {mainServiceName || "لا توجد بيانات"}
              </div>
            </div>
            <div className="info-item">
              <label>الخدمة الفرعية:</label>
              <div className="info-value-box">
                {subServiceName || "لا توجد بيانات"}
              </div>
            </div>
            <div className="info-item">
              <label>السعر:</label>
              <div className="info-value-box">
                {serviceInfo?.price ? `${serviceInfo.price} د.أ` : "غير محدد"}
              </div>
            </div>
            <div className="info-item">
              <label>رابط المعاينة:</label>
              <div className="info-value-box">
                {serviceInfo?.preview_link ? (
                  <a
                    href={serviceInfo.preview_link}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    عرض المعاينة
                  </a>
                ) : (
                  "غير متوفر"
                )}
              </div>
            </div>
            <div className="info-item">
              <label>طريقة التسليم:</label>
              <div className="info-value-box">
                {serviceInfo?.description_works || "غير محدد"}
              </div>
            </div>
            <div className="info-item">
              <label>مميزات الخدمة:</label>
              <div className="info-value-box">
                {serviceInfo?.service_Features || "غير محدد"}
              </div>
            </div>
            <div className="info-item full-width">
              <label>وصف الخدمة:</label>
              <div className="info-value-box">
                {serviceInfo?.service_Description || "غير محدد"}
              </div>
            </div>
          </div>

          {/* الصور الإضافية */}
          {images.length > 1 && (
            <>
              <h3 className="section-title">صور إضافية</h3>
              <div className="extra-images-grid">
                {images.slice(1, 4).map((img, index) => (
                  <img
                    key={index}
                    src={img.imeg_Url}
                    alt={`صورة ${index + 2}`}
                    onError={(e) => {
                      // console.error(
                      //   "خطأ في تحميل الصورة الإضافية:",
                      //   img.imeg_Url
                      // );
                      e.target.style.display = "none";
                    }}
                  />
                ))}
              </div>
            </>
          )}
        </>
      )}

      {activeStep === 2 && (
        <>
          <h2>المعلومات الشخصية</h2>
          <div className="personal-info-section">
            <div className="personal-image">
              {personalInfo?.mainImageUrl ? (
                <img
                  src={personalInfo.mainImageUrl}
                  alt="الصورة الشخصية"
                  onError={(e) => {
                    // console.error(
                    //   "خطأ في تحميل الصورة الشخصية:",
                    //   personalInfo.mainImageUrl
                    // );
                    e.target.src = "/default-avatar.png"; // صورة افتراضية
                  }}
                />
              ) : (
                <div
                  style={{
                    width: "150px",
                    height: "150px",
                    backgroundColor: "#f0f0f0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "50%",
                  }}
                >
                  لا توجد صورة
                </div>
              )}
            </div>
            <div className="personal-details">
              <div className="info-item">
                <label>الاسم الكامل:</label>
                <div className="info-value-box">
                  {personalInfo?.fullName || "غير متوفر"}
                </div>
              </div>
              <div className="info-item">
                <label>البريد الإلكتروني:</label>
                <div className="info-value-box">
                  {personalInfo?.email || "غير متوفر"}
                </div>
              </div>
              <div className="info-item">
                <label>التخصص الجامعي:</label>
                <div className="info-value-box">
                  {personalInfo?.universityMajor || "غير متوفر"}
                </div>
              </div>
              <div className="info-item">
                <label>اسم الجامعة:</label>
                <div className="info-value-box">
                  {personalInfo?.universityName || "غير متوفر"}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {activeStep === 3 && (
        <>
          <h2>إجراءات الخدمة</h2>
          <div className="action-buttons">
            <button className="accept-btn" onClick={handleAccept}>
              ✅ نشر الخدمة
            </button>
            <button className="reject-btn" onClick={handleReject}>
              ❌ رفض الخدمة
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ServiceDetails;
