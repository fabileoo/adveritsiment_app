import React,{useEffect,useState} from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css"; // Подключаем стили

const Dashboard = () => {
    const navigate = useNavigate();
    const [ads,setAds]=useState([]);

    //download ads
    useEffect(()=>{
        fetch("http://127.0.0.1:8000/ads")
            .then((res)=>res.json())
            .then((data)=>setAds(data))
            .catch((err)=> console.error("Error download ads"));
    },[]); 


   return (
        <div className="dashboard-container">
           
            {/* Блок с объявлениями */}
            <div className="ads-section">
                <h2 className="dashboard-title">📢 Available Ads</h2>
                <div className="ads-grid">
                    {ads.map((ad) => (
                        <div key={ad.id} className="ad-card">
                            <img src={ad.image} alt={ad.title} className="ad-image" />
                            <h3 className="ad-title">{ad.title}</h3>
                            <p className="ad-description">{ad.description}</p>
                            <p className="ad-price">${ad.price}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
