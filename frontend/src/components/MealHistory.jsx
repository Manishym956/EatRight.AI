import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getMealHistory } from '../utils/api';
import './MealHistory.css';

function MealHistory() {
    const [meals, setMeals] = useState([]);
    const [loading, setLoading] = useState(true);
    const { token } = useAuth();

    useEffect(() => {
        if (token) loadHistory();
    }, [token]);

    const loadHistory = async () => {
        try {
            const data = await getMealHistory(token);
            setMeals(data);
        } catch (error) {
            console.error('Failed to load history:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="loading-spinner">Loading history...</div>;

    return (
        <div className="history-container">
            <h2>Meal History</h2>
            <div className="history-grid">
                {meals.map(meal => (
                    <div key={meal.meal_id} className="history-card glass">
                        <img src={meal.image_url} alt="Meal" className="history-image" />
                        <div className="history-details">
                            <span className={`verdict-tag ${meal.health_verdict.toLowerCase()}`}>
                                {meal.health_verdict}
                            </span>
                            <p className="meal-date">
                                {new Date(meal.created_at).toLocaleDateString()}
                            </p>
                            <div className="meal-calories">
                                <span>🔥 {meal.calories} kcal</span>
                            </div>
                            <div className="meal-macros">
                                <span>P: {meal.protein}g</span>
                                <span>C: {meal.carbs}g</span>
                                <span>F: {meal.fats}g</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            {meals.length === 0 && <p className="empty-history">No meals recorded yet.</p>}
        </div>
    );
}

export default MealHistory;
