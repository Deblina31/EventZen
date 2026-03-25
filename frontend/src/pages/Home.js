// src/pages/Home.js
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <>
      <style>
        {`
        body {
          margin: 0;
          font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
          background: linear-gradient(135deg, #eef2f7, #e3e9f0);
        }

        .home-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100vh;
          text-align: center;
          padding: 20px;
        }

        .home-box {
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(10px);
          padding: 40px;
          border-radius: 16px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
          max-width: 500px;
          width: 100%;
          transition: 0.3s ease;
        }

        .home-box:hover {
          transform: translateY(-5px);
          box-shadow: 0 15px 40px rgba(0, 0, 0, 0.15);
        }

        .home-title {
          font-size: 32px;
          color: #2c3e50;
          margin-bottom: 10px;
        }

        .home-desc {
          font-size: 16px;
          color: #555;
          margin-bottom: 30px;
          line-height: 1.5;
        }

        .btn-group {
          display: flex;
          justify-content: center;
          gap: 15px;
        }

        .btn-primary {
          padding: 12px 22px;
          border-radius: 8px;
          border: none;
          background: linear-gradient(135deg, #007bff, #0056b3);
          color: white;
          cursor: pointer;
          font-size: 15px;
          transition: 0.3s;
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 15px rgba(0, 123, 255, 0.3);
        }

        .btn-outline {
          padding: 12px 22px;
          border-radius: 8px;
          border: 1px solid #007bff;
          background: white;
          color: #007bff;
          cursor: pointer;
          font-size: 15px;
          transition: 0.3s;
        }

        .btn-outline:hover {
          background: #007bff;
          color: white;
          transform: translateY(-2px);
          box-shadow: 0 6px 15px rgba(0, 123, 255, 0.3);
        }
        `}
      </style>

      <div className="home-container">
        <div className="home-box">
          <h1 className="home-title">Welcome to EventZen</h1>

          <p className="home-desc">
            Manage events, venues, and users with ease. Please register or Login to continue.
          </p>

          <div className="btn-group">
            <Link to="/login">
              <button className="btn-primary">Login</button>
            </Link>

            <Link to="/about">
              <button className="btn-outline">About</button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;