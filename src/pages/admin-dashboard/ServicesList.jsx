import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./ServicesList.css";

function ServicesList() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(
      "http://eallaenjazapi.runasp.net/api/Serves_Student/ADMIN_Function_GET_LIST_ID_SERVES_STUDENT_IN_PROGRASS_processing"
    )
      .then((res) => res.json())
      .then((data) => {
        // console.log("this response", data);
        setServices(data);
        setLoading(false);
      })
      .catch((error) => {
        // console.error("خطأ في جلب البيانات:", error);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>جارٍ تحميل الطلبات...</div>;

  return (
    <div className="services-list-container">
      <h2 className="section-title">الخدمات الواردة</h2>
      <div className="services-grid">
        {services.map((serviceId, index) => (
          <Link
            to={`/admin-dashboard/services/${serviceId}`}
            className="service-box"
            key={serviceId}
          >
            <div className="status-indicator"></div>
            <div className="service-icon">📄</div>
            <div className="service-title">طلب {index + 1}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default ServicesList;
