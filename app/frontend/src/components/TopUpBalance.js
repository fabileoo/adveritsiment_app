import React, { useState } from "react";
import axios from "axios";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import "./TopUpBalance.css";

const TopUpBalance = () => {
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState("");
  
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!amount || isNaN(amount) || amount <= 0) {
      setError("Введите корректную сумму");
      return;
    }
    
    setProcessing(true);
    setError("");
    setSuccess("");

    try {
      // Вызываем эндпоинт пополнения на сервере
      const response = await axios.post("http://127.0.0.1:8000/users/deposit", {
        amount: parseFloat(amount)
      });
      
      const { client_secret } = response.data;
      
      // Получаем элемент карты из Stripe Elements
      const cardElement = elements.getElement(CardElement);
      
      // Подтверждаем платеж, используя client_secret
      const confirmResult = await stripe.confirmCardPayment(client_secret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            // При желании можно добавить данные пользователя
          },
        },
      });
      
      if (confirmResult.error) {
        setError(confirmResult.error.message);
      } else {
        if (confirmResult.paymentIntent.status === "succeeded") {
          setSuccess("Платеж успешно проведен! Ваш баланс обновлен.");
          setAmount("");
          // Здесь можно обновить баланс в localStorage или контексте
        }
      }
    } catch (err) {
      setError("Ошибка при проведении платежа: " + err.message);
    }
    
    setProcessing(false);
  };

  return (
    <div className="topup-container">
      <div className="topup-box">
        <h2>Пополнение баланса</h2>
        <form onSubmit={handleSubmit}>
          <label htmlFor="amount">Сумма (USD):</label>
          <input 
            type="number" 
            id="amount" 
            value={amount} 
            onChange={(e) => setAmount(e.target.value)} 
            placeholder="Введите сумму" 
          />
          
          <label>Данные карты:</label>
          <div className="card-element">
            <CardElement 
              options={{
                style: {
                  base: {
                    color: "#fff",
                    fontSize: "16px",
                    "::placeholder": {
                      color: "#aab7c4",
                    },
                  },
                  invalid: {
                    color: "#ff0000",
                  },
                },
              }} 
            />
          </div>
          
          <button type="submit" disabled={processing || !stripe}>
            {processing ? "Обработка..." : "Пополнить"}
          </button>
        </form>
        {error && <p className="error-message">{error}</p>}
        {success && <p className="success-message">{success}</p>}
      </div>
    </div>
  );
};

export default TopUpBalance;
