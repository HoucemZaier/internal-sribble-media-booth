import "./login.css";
import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// ========================================
// Form Fields
// ========================================

const loginFields = [
  {
    id: "firstName",
    label: "First Name",

    type: "text",
    placeholder: "Enter your first name",
  },
  {
    id: "lastName",
    label: "Last Name",
    type: "text",
    placeholder: "Enter your last name",
  },
  {
    id: "phone",
    label: "Phone Number",
    type: "tel",
    placeholder: "Enter your phone number",
  },
];

function Login() {
  const navigate = useNavigate();

  // ========================================
  // State to manage visitor session form
  // ========================================

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
  });

  // Success message

  const [successMessage, setSuccessMessage] = useState("");

  // Error message

  const [errorMessage, setErrorMessage] = useState("");

  // ========================================
  // Handle input changes
  // ========================================

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // ========================================
  // Handle form submission
  // ========================================

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent page refresh

    console.log("Visitor information:");
    console.log(formData);

    try {
      // Send visitor information to the backend

      const response = await axios.post(
        "http://localhost:3001/auth/session",
        formData,
      );

      localStorage.setItem("token", response.data.token); // Store the JWT token in localStorage of the browser

      localStorage.setItem("user", JSON.stringify(response.data.user)); // Store the user information in localStorage of the browser

      const visitor = JSON.parse(localStorage.getItem("user")); // Retrieve the user information from localStorage

      navigate("/camera");

      console.log("Visitor information stored in localStorage:", visitor); 

      console.log(visitor.firstName);
      console.log(visitor.lastName);
      console.log(visitor.phone);

      setErrorMessage("");

      setSuccessMessage(response.data.message);

      console.log(response.data);
    } 
    
    catch (error) {

      console.error(error);

      setSuccessMessage("");

      setErrorMessage(error.response.data.error);

    }
  };

  console.log("Visitor information:", formData);

  return (
    <main className="login-page">
      <section className="login-shell">
        {/* Left Panel */}

        <aside className="login-aside">
          <div className="brand-mark">🎥</div>

          <p className="eyebrow">Scribble Booth</p>

          <h1>Create Your Scribble Experience</h1>

          <p className="subtitle">
            Enter your information to start your personalized Scribble Booth
            experience.
          </p>
        </aside>

        {/* Right Panel */}

        <div className="login-card">
          <header className="login-card-header">
            <p className="login-eyebrow">Visitor Session</p>

            <h2>Start Your Experience</h2>

            <p className="login-description">
              Fill in your information to begin creating your personalized
              Scribble video.
            </p>
          </header>

          <form className="login-form" onSubmit={handleSubmit}>
            {loginFields.map((field) => (
              <div className="input-group" key={field.id}>
                <label htmlFor={field.id}>{field.label}</label>

                <input
                  id={field.id}
                  name={field.id}
                  type={field.type}
                  placeholder={field.placeholder}
                  value={formData[field.id]}
                  onChange={handleChange}
                />
              </div>
            ))}

            {/* Success Message */}

            {successMessage && (
              <p className="success-message">{successMessage}</p>
            )}

            {/* Error Message */}

            {errorMessage && <p className="error-message">{errorMessage}</p>}

            <button className="login-btn" type="submit">
              Start Experience
            </button>
          </form>

          <div className="register-link">
            Your personalized Scribble video will be generated after your
            session.
          </div>
        </div>
      </section>
    </main>
  );
}

export default Login;
