# Vendor ROI Calculator

An interactive calculator for modeling event pipeline, closed deals, and ARR (Annual Recurring Revenue) per sponsorship tier.

## Features

- **Three Pricing Models**:
  - Per seat (endpoints)
  - Per MSP organization (flat rate)
  - Per technician (internal MSP staff)

- **Interactive Charts**:
  - Conversion funnel visualization (attendees → demos → deals)
  - Deal pipeline projection over 6 or 12 months

- **ARR Visualization**:
  - Detailed breakdown of trials, conversions, and revenue
  - Prominent ROI ratio display with visual emphasis

- **Event Modeling**:
  - Support for 1 or 2 events
  - Multiple sponsorship tiers (Gold, Platinum, Diamond)
  - Automatic demo rate adjustments based on tier upgrades

## File Structure

```
vendor-roi-calculator/
├── index.html      # Main HTML structure
├── styles.css      # All styling and visual design
├── calculator.js   # Business logic and calculations
└── README.md       # This file
```

## Usage

1. Open `index.html` in a web browser
2. Select your pricing model
3. Enter your pricing information
4. Set demo booking rate and close rate
5. Choose event sponsorship tiers
6. Click "Run the numbers"

## Key Assumptions

- **175 MSP attendees** per event
- **70% demo show rate** (scheduled demos that actually happen)
- **60% trial-to-paying conversion rate**
- **6-month deal pipeline** per event
- **7.5 percentage point demo rate bump** when upgrading sponsorship tiers in two-event model

## Default Values

- **Per seat model**: 500 seats per deal, 70% deployment rate
- **Per technician model**: 3 technicians per deal
- Demo booking rate: 25% (adjustable 15-30%)
- Close rate: 25% (adjustable 10-70%)

## Dependencies

- [Chart.js](https://www.chartjs.org/) v4.4.1 (loaded via CDN)

## Browser Compatibility

Works in all modern browsers that support:
- ES6 JavaScript
- CSS Grid
- CSS Custom Properties
- HTML5 Canvas (for charts)

## Customization

### Adjusting Constants

Edit the constants at the top of `calculator.js`:

```javascript
const ATTENDEES_PER_EVENT = 175;
const SHOW_RATE = 0.70;
const TRIAL_TO_PAYING_RATE = 0.60;
const AVG_TECHS_PER_DEAL = 3;
const AVG_SEATS_PER_DEAL = 500;
const SEAT_DEPLOY_RATE = 0.70;
```

### Changing Deal Pipeline Pattern

The pattern determines how deals close over 6 months:

```javascript
const EVENT_PATTERN = [4, 3, 2, 1, 1, 0];
// Month 1: 4 deals, Month 2: 3 deals, etc.
```

### Styling

All styles are in `styles.css`. Key classes:

- `.roi-wrap` - Main container
- `.roi-card` - Calculator card
- `.roi-arr-note` - Highlighted ROI ratio display
- `.roi-btn` - Button styles

## License

Internal use only.
