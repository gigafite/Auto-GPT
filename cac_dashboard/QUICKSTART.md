# Quick Start Guide

Get the CAC Dashboard up and running in 5 minutes.

## 1. Start the Backend

```bash
# Navigate to backend
cd cac_dashboard/backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the server
python main.py
```

Backend runs at: `http://localhost:8000`

## 2. Start the Frontend

Open a new terminal:

```bash
# Navigate to frontend
cd cac_dashboard/frontend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Start the app
npm start
```

Frontend opens at: `http://localhost:3000`

## 3. Use the Dashboard

### Add Your First Expense
1. Scroll to "Add Expense" section
2. Select category: "Advertising"
3. Amount: 5000
4. Date: Today
5. Click "Add Expense"

### Add Your First Deal
1. Scroll to "Add Deals" section
2. Number of deals: 10
3. Source: "Google Ads"
4. Date: Today
5. Click "Add Deals"

### View Your CAC
Your CAC will be calculated automatically: $5,000 ÷ 10 = $500 per customer

## 4. Next Steps

- Add more expenses across different categories
- Track deals from different sources
- Change time period (Weekly/Monthly/Quarterly/Yearly)
- Watch trends develop over time

## API Documentation

Visit `http://localhost:8000/docs` to explore the API interactively.

## Need Help?

See the full [README.md](README.md) for detailed documentation.
