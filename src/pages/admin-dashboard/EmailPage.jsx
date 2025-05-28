// EmailPage.jsx
import React, { useState } from "react";
import axios from "axios";
import { useForm } from "react-hook-form";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import styles from "./EmailPage.module.css";

// Reusable Stepper component
const Stepper = ({ currentStep, setStep }) => (
  <div className={styles.stepper}>
    {[1, 2].map((num) => (
      <React.Fragment key={num}>
        <button
          type="button"
          className={`${styles.circle} ${
            currentStep === num ? styles.active : ""
          } ${currentStep > num ? styles.completed : ""}`}
          onClick={() => currentStep >= num && setStep(num)}
          aria-current={currentStep === num}
        >
          <span>{num}</span>
        </button>
        {num < 2 && <div className={styles.line} />}
      </React.Fragment>
    ))}
  </div>
);

// Card to display user data
const UserCard = ({ data }) => (
  <div className={`${styles.card} ${styles.slideIn}`}>
    <img
      src={
        data.mainImageUrl ||
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
      }
      alt={data.fullName}
      className={styles.studentImg}
      loading="lazy"
    />
    <div className={styles.info}>
      <p>
        <strong>الاسم:</strong> {data.fullName}
      </p>
      <p>
        <strong>الإيميل الأساسي:</strong> {data.praimary_email}
      </p>
      <p>
        <strong>الإيميل الثانوي:</strong> {data.scoundary_email}
      </p>
      <p>
        <strong>التخصص:</strong> {data.universityMajor}
      </p>
      <p>
        <strong>الجامعة:</strong> {data.universityName}
      </p>
    </div>
  </div>
);

// Custom Toast component with project colors
const showCustomToast = (message, type = "success") => {
  const toastOptions = {
    position: "top-center",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    style: {
      background:
        type === "success"
          ? "linear-gradient(135deg, #27ae60, #2ecc71)"
          : "linear-gradient(135deg, #e74c3c, #c0392b)",
      color: "white",
      borderRadius: "15px",
      fontFamily: "Cairo, sans-serif",
      fontWeight: "500",
    },
  };

  if (type === "success") {
    toast.success(message, toastOptions);
  } else {
    toast.error(message, toastOptions);
  }
};

const EmailPage = () => {
  const [step, setStep] = useState(1);
  const [data, setData] = useState(null);
  const [saving, setSaving] = useState(false);
  const [searching, setSearching] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm();

  const {
    register: register2,
    handleSubmit: handleSubmit2,
    formState: { errors: errors2 },
    reset: reset2,
  } = useForm();

  // Watch for input changes to provide real-time validation feedback
  const emailValue = watch("email");
  const newEmailValue = watch("newEmail");

  // Email validation helper
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // 1) Search by email
  const onSearch = async ({ email }) => {
    if (!email || !isValidEmail(email)) {
      showCustomToast("يرجى إدخال بريد إلكتروني صحيح", "error");
      return;
    }

    setSearching(true);
    try {
      const res = await axios.get(
        `http://eallaenjazapi.runasp.net/api/Student_/ADMIN_GET_INFO_FROM_STUDENT_IN_WORK_CONVERT_EMAIL_BY_ADMIN${encodeURIComponent(
          email
        )}`
      );

      if (res.data) {
        setData(res.data);
        setStep(2);
        showCustomToast("تم العثور على البيانات بنجاح!", "success");
      } else {
        showCustomToast(
          "لم يتم العثور على بيانات لهذا البريد الإلكتروني",
          "error"
        );
      }
    } catch (error) {
      console.error("Search error:", error);
      showCustomToast("حدث خطأ أثناء البحث. يرجى المحاولة مرة أخرى", "error");
    } finally {
      setSearching(false);
    }
  };

  // 2) Save changes: upload image, update email, log conversion
  const onSave = async ({ newEmail, file }) => {
    // Validate new email if provided
    if (newEmail && !isValidEmail(newEmail)) {
      showCustomToast("يرجى إدخال بريد إلكتروني صحيح", "error");
      return;
    }

    // Check if at least one field is provided
    if (!newEmail && (!file || !file[0])) {
      showCustomToast("يرجى إدخال إيميل جديد أو اختيار صورة", "error");
      return;
    }

    setSaving(true);
    try {
      let guide_image = "";

      // Upload image if provided
      if (file && file[0]) {
        const formData = new FormData();
        formData.append("imageFile", file[0]);

        const uploadRes = await axios.post(
          "http://eallaenjazapi.runasp.net/api/Imege/UploadImage",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        guide_image = uploadRes.data;
      }

      // Update email if provided
      if (newEmail && newEmail !== data.praimary_email) {
        await axios.put(
          `http://eallaenjazapi.runasp.net/api/Person/Ubdate_Email_BY_Admin ${data.iD_Person}`,
          null,
          { params: { New_Email: newEmail } }
        );
      }

      // Log the conversion
      const payload = {
        id: 0,
        oldEmail: data.praimary_email,
        newEmail: newEmail || data.praimary_email,
        convertedAt: new Date().toISOString(),
        id_Person: data.iD_Person,
        guide_image,
      };

      await axios.post(
        "http://eallaenjazapi.runasp.net/api/Email_Conversion_Log_/ADD_Email_Conversion_Log",
        payload
      );

      showCustomToast("تم حفظ التعديلات بنجاح!", "success");

      // Update local data if email was changed
      if (newEmail) {
        setData((prev) => ({
          ...prev,
          praimary_email: newEmail,
        }));
      }

      // Reset the form
      reset2();
    } catch (error) {
      console.error("Save error:", error);
      showCustomToast("فشل في حفظ التعديلات. يرجى المحاولة مرة أخرى", "error");
    } finally {
      setSaving(false);
    }
  };

  // Go back to step 1
  const handleBackToSearch = () => {
    setStep(1);
    setData(null);
    reset();
    reset2();
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Header */}
        <div className={`${styles.header} ${styles.fadeIn}`}>
          <h2 className={styles.title}>إدارة البريد الإلكتروني</h2>
        </div>

        {/* Stepper */}
        <Stepper currentStep={step} setStep={setStep} />

        {/* Step 1: Search Form */}
        {step === 1 && (
          <form
            className={`${styles.form} ${styles.fadeIn}`}
            onSubmit={handleSubmit(onSearch)}
            noValidate
          >
            <div className={styles.formGroup}>
              <input
                type="email"
                {...register("email", {
                  required: "البريد الإلكتروني مطلوب",
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "يرجى إدخال بريد إلكتروني صحيح",
                  },
                })}
                className={`${styles.input} ${
                  errors.email ? styles.inputError : ""
                } ${
                  emailValue && isValidEmail(emailValue)
                    ? styles.inputValid
                    : ""
                }`}
                placeholder="أدخل البريد الإلكتروني للبحث"
                aria-invalid={errors.email ? "true" : "false"}
              />
              {errors.email && (
                <div className={styles.errorMessage}>
                  {errors.email.message}
                </div>
              )}
            </div>

            <button
              type="submit"
              className={styles.button}
              disabled={searching}
            >
              {searching ? (
                <>
                  <div className={styles.loading}></div>
                  جارٍ البحث...
                </>
              ) : (
                "بحث"
              )}
            </button>
          </form>
        )}

        {/* Step 2: User Info & Edit Form */}
        {step === 2 && data && (
          <div className={styles.step2Container}>
            <UserCard data={data} />

            <form
              className={`${styles.form} ${styles.slideIn}`}
              onSubmit={handleSubmit2(onSave)}
              noValidate
            >
              <div className={styles.formGroup}>
                <input
                  type="email"
                  {...register2("newEmail", {
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: "يرجى إدخال بريد إلكتروني صحيح",
                    },
                  })}
                  className={`${styles.input} ${
                    errors2.newEmail ? styles.inputError : ""
                  } ${
                    newEmailValue && isValidEmail(newEmailValue)
                      ? styles.inputValid
                      : ""
                  }`}
                  placeholder="أدخل البريد الإلكتروني الجديد (اختياري)"
                />
                {errors2.newEmail && (
                  <div className={styles.errorMessage}>
                    {errors2.newEmail.message}
                  </div>
                )}
              </div>

              <div className={styles.formGroup}>
                <div className={styles.fileInputContainer}>
                  <input
                    type="file"
                    {...register2("file")}
                    className={styles.fileInput}
                    id="file-upload"
                    accept="image/*"
                  />
                  <label
                    htmlFor="file-upload"
                    className={styles.fileInputLabel}
                  >
                    <p>اختر صورة جديدة (اجباري)</p>
                  </label>
                </div>
              </div>

              <div className={styles.buttonGroup}>
                <button
                  type="button"
                  className={`${styles.button} ${styles.buttonSecondary}`}
                  onClick={handleBackToSearch}
                  disabled={saving}
                >
                  رجوع للبحث
                </button>

                <button
                  type="submit"
                  className={styles.button}
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <div className={styles.loading}></div>
                      جارٍ الحفظ...
                    </>
                  ) : (
                    "حفظ التعديلات"
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Toast Container */}
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={true}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        className={styles.toastContainer}
      />
    </div>
  );
};

export default EmailPage;
