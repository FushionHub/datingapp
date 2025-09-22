import React from 'react';
import { Link } from 'react-router-dom';

const tiers = [
  {
    name: 'Free User',
    price: '$0/mo',
    features: [
      'Browse profiles',
      'Match with users',
      'Basic chat',
    ],
    cta: 'You are here',
    disabled: true,
  },
  {
    name: 'VIP',
    price: '$9.99/mo',
    features: [
      'See who liked you',
      'Unlimited swipes',
      'Ad-free experience',
      'Read receipts in chat',
    ],
    cta: 'Upgrade to VIP',
    disabled: false,
  },
  {
    name: 'Pro',
    price: '$19.99/mo',
    features: [
      'All VIP features',
      'One free profile boost per month',
      'Advanced search filters',
      'Send virtual gifts',
    ],
    cta: 'Upgrade to Pro',
    disabled: false,
  },
];

const SubscriptionPage = () => {
  return (
    <div>
      <Link to="/">Back to Dashboard</Link>
      <div style={{ textAlign: 'center', margin: '20px' }}>
        <h1>Our Plans</h1>
        <p>Choose the plan that's right for you.</p>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
        {tiers.map((tier) => (
          <div key={tier.name} style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '20px', width: '250px' }}>
            <h2>{tier.name}</h2>
            <h3>{tier.price}</h3>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {tier.features.map((feature) => (
                <li key={feature} style={{ margin: '8px 0' }}>✓ {feature}</li>
              ))}
            </ul>
            <button disabled={tier.disabled} onClick={() => alert(`Redirecting to payment for ${tier.name}...`)}>
              {tier.cta}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SubscriptionPage;
