# CAC Dashboard

A comprehensive Customer Acquisition Cost (CAC) tracking dashboard designed to help business owners monitor and optimize their acquisition engine efficiency.

## Overview

The CAC Dashboard helps you:
- Track all marketing and sales expenses (software, salaries, commissions, advertising, agency costs)
- Monitor deals/customers acquired over time
- Calculate fully loaded CAC automatically
- View trends across different time periods (weekly, monthly, quarterly, yearly)
- Compare performance period-over-period
- Visualize expense breakdown by category

## Features

### Core Metrics
- **Fully Loaded CAC**: Total expenses ÷ Number of deals acquired
- **Total Expenses**: Sum of all marketing and sales costs
- **Total Deals**: Number of customers/deals acquired
- **CAC Trend Analysis**: Historical performance tracking

### Expense Categories
- Software (SaaS tools, subscriptions)
- Salaries (marketing and sales team)
- Commissions (sales incentives)
- Advertising (paid ads, campaigns)
- Agency (external agency costs)
- Other (miscellaneous expenses)

### Time Periods
- **Weekly**: Track week-to-week performance
- **Monthly**: Month-over-month analysis
- **Quarterly**: Quarter-over-quarter trends
- **Yearly**: Year-over-year comparison

### Visualizations
- CAC trend line chart
- Expense breakdown pie chart
- Period-over-period comparison
- Historical data table

## Technology Stack

### Backend
- **FastAPI**: Modern, fast Python web framework
- **SQLAlchemy**: SQL toolkit and ORM
- **SQLite**: Lightweight database (can be upgraded to PostgreSQL)
- **Pydantic**: Data validation using Python type annotations

### Frontend
- **React**: UI library
- **Recharts**: Charting library for data visualization
- **Axios**: HTTP client for API communication
- **date-fns**: Date manipulation library

## Installation

### Prerequisites
- Python 3.8+
- Node.js 14+
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd cac_dashboard/backend
```

2. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Run the backend server:
```bash
python main.py
```

The API will be available at `http://localhost:8000`

API documentation (Swagger UI): `http://localhost:8000/docs`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd cac_dashboard/frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Start the development server:
```bash
npm start
```

The application will open at `http://localhost:3000`

## Usage

### Adding Expenses

1. Scroll to the "Add Expense" section
2. Select the expense category from the dropdown
3. Enter the amount (in dollars)
4. Select the date of the expense
5. Optionally add a description
6. Click "Add Expense"

### Adding Deals

1. Scroll to the "Add Deals" section
2. Enter the number of deals/customers acquired
3. Optionally specify the source (e.g., "Google Ads", "Referral")
4. Select the date
5. Click "Add Deals"

### Viewing Metrics

1. Use the period selector (Weekly/Monthly/Quarterly/Yearly) to change the time frame
2. View key metrics in the dashboard cards:
   - Current CAC
   - Total Expenses
   - Total Deals
   - Previous Period CAC
3. Check the percentage change to see if CAC is improving or declining

### Analyzing Trends

- **CAC Trend Chart**: Shows how CAC has changed over the last 12 periods
- **Expense Breakdown Chart**: Displays the proportion of expenses by category
- Green trend = CAC is decreasing (good)
- Red trend = CAC is increasing (needs attention)

## API Endpoints

### Expenses
- `POST /api/expenses` - Create new expense
- `GET /api/expenses` - List all expenses (with filters)
- `GET /api/expenses/{id}` - Get specific expense
- `PUT /api/expenses/{id}` - Update expense
- `DELETE /api/expenses/{id}` - Delete expense

### Deals
- `POST /api/deals` - Create new deal
- `GET /api/deals` - List all deals (with filters)
- `GET /api/deals/{id}` - Get specific deal
- `PUT /api/deals/{id}` - Update deal
- `DELETE /api/deals/{id}` - Delete deal

### Analytics
- `GET /api/analytics/cac/current` - Get current period CAC
- `GET /api/analytics/cac/dashboard` - Get dashboard summary
- `GET /api/analytics/cac/history` - Get historical CAC metrics
- `POST /api/analytics/cac/calculate` - Calculate and save CAC
- `GET /api/analytics/expenses/breakdown` - Get expense breakdown
- `GET /api/analytics/trends` - Get trend data

## Database Schema

### Expenses Table
- `id`: Primary key
- `category`: Expense category (software, salary, commission, advertising, agency, other)
- `amount`: Expense amount (float)
- `description`: Optional description (string)
- `date`: Date of expense (datetime)
- `created_at`: Record creation timestamp
- `updated_at`: Record update timestamp

### Deals Table
- `id`: Primary key
- `count`: Number of deals (integer)
- `source`: Optional source description (string)
- `date`: Date of deals (datetime)
- `created_at`: Record creation timestamp
- `updated_at`: Record update timestamp

### CAC Metrics Table
- `id`: Primary key
- `period_start`: Period start date (datetime)
- `period_end`: Period end date (datetime)
- `total_expenses`: Total expenses for period (float)
- `total_deals`: Total deals for period (integer)
- `cac`: Calculated CAC (float)
- `period_type`: Period type (weekly, monthly, quarterly, yearly)
- `created_at`: Record creation timestamp

## Best Practices

1. **Regular Updates**: Input expenses and deals weekly for accurate tracking
2. **Categorize Correctly**: Use the right category for each expense
3. **Include All Costs**: Don't forget indirect costs (tools, overhead, etc.)
4. **Monitor Trends**: Check the dashboard weekly to spot issues early
5. **Compare Periods**: Use period-over-period comparison to measure improvement

## Customization

### Upgrading to PostgreSQL

1. Update `backend/database.py`:
```python
SQLALCHEMY_DATABASE_URL = "postgresql://user:password@localhost/cac_dashboard"
```

2. Install PostgreSQL driver:
```bash
pip install psycopg2-binary
```

### Adding New Expense Categories

1. Update `backend/models.py` - Add to `ExpenseCategory` enum
2. Update `frontend/src/components/ExpenseForm.js` - Add to categories array
3. Update `frontend/src/components/ExpenseBreakdownChart.js` - Add color to COLORS object

## Troubleshooting

### Backend won't start
- Check Python version: `python --version` (should be 3.8+)
- Ensure all dependencies are installed: `pip install -r requirements.txt`
- Check port 8000 is not in use

### Frontend won't start
- Check Node version: `node --version` (should be 14+)
- Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Check port 3000 is not in use

### Can't connect to API
- Verify backend is running at `http://localhost:8000`
- Check `.env` file has correct `REACT_APP_API_URL`
- Check browser console for CORS errors

## Future Enhancements

- User authentication and multi-tenant support
- Export data to CSV/Excel
- Email alerts for CAC threshold breaches
- Integration with CRM systems (Salesforce, HubSpot)
- Integration with accounting software (QuickBooks, Xero)
- Cohort analysis
- Customer lifetime value (LTV) tracking
- LTV:CAC ratio calculation
- Predictive analytics using ML

## License

MIT License - Feel free to use and modify for your business needs.

## Support

For issues, questions, or feature requests, please open an issue in the repository.

---

**Built with ❤️ to help businesses optimize their acquisition costs**
