import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import './NutrientCharts.css';

// Macronutrient Pie Chart Component
export function MacronutrientChart({ protein, carbs, fats }) {
    const data = [
        { name: 'Protein', value: protein || 0, color: '#667eea' },
        { name: 'Carbs', value: carbs || 0, color: '#8b5cf6' },
        { name: 'Fats', value: fats || 0, color: '#ec4899' }
    ].filter(item => item.value > 0);

    if (data.length === 0 || data.every(item => item.value === 0)) {
        return (
            <div className="chart-placeholder">
                <p>No macronutrient data available</p>
            </div>
        );
    }

    const total = data.reduce((sum, item) => sum + item.value, 0);

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const percentage = ((payload[0].value / total) * 100).toFixed(1);
            return (
                <div className="custom-tooltip">
                    <p className="label">{payload[0].name}</p>
                    <p className="value">{payload[0].value}g ({percentage}%)</p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="chart-container">
            <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                </PieChart>
            </ResponsiveContainer>
            <div className="chart-legend">
                {data.map((item, index) => (
                    <div key={index} className="legend-item">
                        <span className="legend-color" style={{ backgroundColor: item.color }}></span>
                        <span className="legend-text">{item.name}: {item.value}g</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

// Micronutrient Pie Chart Component
export function MicronutrientChart({ micronutrients }) {
    if (!micronutrients || Object.keys(micronutrients).length === 0) {
        return (
            <div className="chart-placeholder">
                <p>No micronutrient data available</p>
            </div>
        );
    }

    // Convert micronutrients object to array for pie chart
    // Normalize values for visualization (convert to percentage of daily value estimates)
    const nutrientColors = {
        vitamin_a: '#f59e0b',
        vitamin_c: '#10b981',
        vitamin_d: '#f97316',
        calcium: '#06b6d4',
        iron: '#ef4444',
        fiber: '#8b5cf6',
        vitamin_b12: '#ec4899',
        vitamin_e: '#14b8a6',
        potassium: '#6366f1',
        magnesium: '#84cc16'
    };

    const data = Object.entries(micronutrients)
        .map(([key, value]) => ({
            name: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
            value: value.amount || 0,
            unit: value.unit || '',
            color: nutrientColors[key] || '#94a3b8'
        }))
        .filter(item => item.value > 0);

    if (data.length === 0) {
        return (
            <div className="chart-placeholder">
                <p>No micronutrient data available</p>
            </div>
        );
    }

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (
                <div className="custom-tooltip">
                    <p className="label">{payload[0].name}</p>
                    <p className="value">{payload[0].value}{payload[0].payload.unit}</p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="chart-container">
            <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}

// Micronutrient List Component
export function MicronutrientList({ micronutrients }) {
    if (!micronutrients || Object.keys(micronutrients).length === 0) {
        return (
            <div className="nutrient-list-empty">
                <p>No micronutrient data available</p>
            </div>
        );
    }

    const nutrientIcons = {
        vitamin_a: '🥕',
        vitamin_c: '🍊',
        vitamin_d: '☀️',
        calcium: '🥛',
        iron: '🥩',
        fiber: '🌾',
        vitamin_b12: '🥚',
        vitamin_e: '🥜',
        potassium: '🍌',
        magnesium: '🥬'
    };

    return (
        <div className="micronutrient-list">
            {Object.entries(micronutrients).map(([key, value], index) => (
                <div
                    key={key}
                    className="micronutrient-item"
                    style={{ animationDelay: `${index * 0.05}s` }}
                >
                    <span className="nutrient-icon">{nutrientIcons[key] || '💊'}</span>
                    <div className="nutrient-info">
                        <span className="nutrient-name">
                            {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </span>
                        <span className="nutrient-amount">
                            {value.amount} {value.unit}
                        </span>
                    </div>
                </div>
            ))}
        </div>
    );
}
