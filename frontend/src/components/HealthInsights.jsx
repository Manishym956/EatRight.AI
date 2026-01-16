import './HealthInsights.css';

// Benefits Component (Green)
export function BenefitsChecklist({ benefits }) {
    if (!benefits || benefits.length === 0) {
        return null;
    }

    return (
        <div className="health-insights benefits">
            <h3 className="insights-title">
                <span className="icon">✓</span>
                Health Benefits
            </h3>
            <ul className="insights-list">
                {benefits.map((benefit, index) => (
                    <li
                        key={index}
                        className="insight-item benefit-item"
                        style={{ animationDelay: `${index * 0.1}s` }}
                    >
                        <span className="check-icon">✓</span>
                        <span className="insight-text">{benefit}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}

// Cautions Component (Red)
export function CautionsChecklist({ cautions }) {
    if (!cautions || cautions.length === 0) {
        return null;
    }

    return (
        <div className="health-insights cautions">
            <h3 className="insights-title">
                <span className="icon">⚠</span>
                Health Cautions
            </h3>
            <ul className="insights-list">
                {cautions.map((caution, index) => (
                    <li
                        key={index}
                        className="insight-item caution-item"
                        style={{ animationDelay: `${index * 0.1}s` }}
                    >
                        <span className="warning-icon">!</span>
                        <span className="insight-text">{caution}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}
