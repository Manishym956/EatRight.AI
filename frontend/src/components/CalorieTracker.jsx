import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getMealStats } from '../utils/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import './CalorieTracker.css';

function CalorieTracker() {
    const [stats, setStats] = useState([]);
    const [loading, setLoading] = useState(true);
    const { token } = useAuth();

    useEffect(() => {
        if (token) loadStats();
    }, [token]);

    const loadStats = async () => {
        try {
            const data = await getMealStats(token);
            // Reverse to show oldest to newest
            setStats(data.reverse());
        } catch (error) {
            console.error('Failed to load stats:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="loading-spinner">Loading stats...</div>;

    return (
        <div className="tracker-container">
            <h2>Calorie Tracker</h2>
            <div className="chart-card glass">
                <h3>Last 7 Days</h3>
                <div className="chart-wrapper">
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={stats}>
                            <XAxis dataKey="_id" stroke="#888888" />
                            <YAxis stroke="#888888" />
                            <Tooltip
                                contentStyle={{ background: '#1a1a1a', border: '1px solid #333' }}
                                labelStyle={{ color: '#fff' }}
                            />
                            <Bar dataKey="total_calories" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}

export default CalorieTracker;
