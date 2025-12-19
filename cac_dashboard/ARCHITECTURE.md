# CAC Dashboard Architecture

## System Overview

The CAC Dashboard is a full-stack web application designed to track Customer Acquisition Cost metrics with real-time data visualization and historical trend analysis.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend                            │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              React Application (Port 3000)            │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────────────┐   │  │
│  │  │Dashboard │  │  Forms   │  │ Charts (Recharts)│   │  │
│  │  │Components│  │ (Expense,│  │ - CAC Trend      │   │  │
│  │  │          │  │  Deals)  │  │ - Expense Pie    │   │  │
│  │  └──────────┘  └──────────┘  └──────────────────┘   │  │
│  └───────────────────────────────────────────────────────┘  │
│                           ↓ HTTP/REST API                   │
│                      (Axios Client)                         │
└─────────────────────────────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────┐
│                        Backend                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │           FastAPI Application (Port 8000)             │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌────────────┐  │  │
│  │  │   Routes     │  │  Services    │  │   Models   │  │  │
│  │  │ - Expenses   │  │ - CAC Calc   │  │ - Expense  │  │  │
│  │  │ - Deals      │  │ - Analytics  │  │ - Deal     │  │  │
│  │  │ - Analytics  │  │ - Trends     │  │ - Metric   │  │  │
│  │  └──────────────┘  └──────────────┘  └────────────┘  │  │
│  └───────────────────────────────────────────────────────┘  │
│                           ↓ SQLAlchemy ORM                  │
└─────────────────────────────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────┐
│                       Database                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              SQLite (cac_dashboard.db)                │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────────────┐   │  │
│  │  │ expenses │  │  deals   │  │   cac_metrics    │   │  │
│  │  │          │  │          │  │                  │   │  │
│  │  └──────────┘  └──────────┘  └──────────────────┘   │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Technology Stack Details

### Frontend Layer

**Framework**: React 18.2.0
- Component-based UI architecture
- Functional components with hooks
- Unidirectional data flow

**Key Libraries**:
- **axios**: HTTP client for API communication
- **recharts**: Declarative charts for data visualization
- **date-fns**: Date manipulation and formatting

**Components**:
1. `App.js` - Main application container
2. `MetricCard.js` - Displays individual metrics with change indicators
3. `ExpenseForm.js` - Form for adding expenses
4. `DealForm.js` - Form for adding deals
5. `CACTrendChart.js` - Line chart for CAC trends
6. `ExpenseBreakdownChart.js` - Pie chart for expense categories

**State Management**: React useState and useEffect hooks
- No Redux (keeps it simple for this use case)
- Local component state
- API calls trigger re-renders

### Backend Layer

**Framework**: FastAPI
- Async request handling
- Automatic API documentation (Swagger/OpenAPI)
- Type validation with Pydantic
- CORS middleware for cross-origin requests

**Key Components**:

1. **main.py** - Application entry point
   - Route definitions
   - Middleware configuration
   - Dependency injection setup

2. **models.py** - SQLAlchemy ORM models
   - Expense model
   - Deal model
   - CACMetric model
   - ExpenseCategory enum

3. **schemas.py** - Pydantic validation schemas
   - Request/response models
   - Data validation rules
   - Type enforcement

4. **services.py** - Business logic layer
   - CAC calculations
   - Period boundary calculations
   - Trend analysis
   - Data aggregation

5. **database.py** - Database configuration
   - Session management
   - Connection pooling
   - Base model definition

### Database Layer

**Database**: SQLite (production: PostgreSQL recommended)

**Tables**:

1. **expenses**
   - Tracks all marketing/sales costs
   - Indexed by date for fast querying
   - Categorized for breakdown analysis

2. **deals**
   - Tracks customer acquisitions
   - Source tracking for attribution
   - Date-indexed for period calculations

3. **cac_metrics** (optional pre-calculated metrics)
   - Stores historical CAC calculations
   - Enables fast dashboard loading
   - Period-specific aggregations

## Data Flow

### Adding an Expense

```
User Input (Frontend)
    ↓
ExpenseForm validation
    ↓
POST /api/expenses (Axios)
    ↓
FastAPI route handler
    ↓
Pydantic schema validation
    ↓
SQLAlchemy model creation
    ↓
Database INSERT
    ↓
Response (201 Created)
    ↓
Frontend state update
    ↓
Dashboard refresh
```

### Calculating CAC

```
Period Selection (Frontend)
    ↓
GET /api/analytics/cac/dashboard?period_type=monthly
    ↓
FastAPI route handler
    ↓
CACService.calculate_period_metrics()
    ↓
├─ Get period bounds (start/end dates)
    ↓
├─ Query expenses in period (SUM amount)
    ↓
├─ Query deals in period (SUM count)
    ↓
└─ Calculate CAC = total_expenses / total_deals
    ↓
Return JSON response
    ↓
Frontend renders metrics
```

## API Design

### RESTful Endpoints

**Resource-based URLs**:
- `/api/expenses` - Expense resource
- `/api/deals` - Deal resource
- `/api/analytics/*` - Analytics endpoints (read-only)

**HTTP Methods**:
- GET - Retrieve data
- POST - Create new records
- PUT - Update existing records
- DELETE - Remove records

**Response Codes**:
- 200 - Success
- 201 - Created
- 204 - No Content (delete)
- 400 - Bad Request
- 404 - Not Found
- 500 - Server Error

### Query Parameters

Consistent filtering across endpoints:
- `start_date` - Filter by date range start
- `end_date` - Filter by date range end
- `category` - Filter by expense category
- `period_type` - Specify time period (weekly, monthly, etc.)
- `skip` - Pagination offset
- `limit` - Pagination limit

## Business Logic

### CAC Calculation

```python
def calculate_cac(total_expenses: float, total_deals: int) -> float:
    """
    Fully Loaded CAC = Total Marketing & Sales Expenses / Number of Customers Acquired
    """
    if total_deals == 0:
        return None  # Avoid division by zero
    return total_expenses / total_deals
```

### Period Boundaries

**Weekly**: Monday 00:00:00 to next Monday 00:00:00
**Monthly**: First day of month 00:00:00 to first day of next month 00:00:00
**Quarterly**: First day of quarter to first day of next quarter
**Yearly**: January 1 00:00:00 to January 1 next year 00:00:00

### Trend Analysis

- Fetches last N periods of data
- Calculates CAC for each period
- Returns chronological array for charting
- Handles missing data gracefully (no division by zero)

## Security Considerations

### Current Implementation
- CORS enabled for development (allow all origins)
- No authentication (single-user assumption)
- No input sanitization beyond Pydantic validation

### Production Recommendations
1. **Authentication**: Add JWT or session-based auth
2. **CORS**: Restrict to specific origins
3. **Rate Limiting**: Prevent API abuse
4. **Input Validation**: Additional sanitization
5. **HTTPS**: SSL/TLS encryption
6. **Database**: Move to PostgreSQL with connection pooling
7. **Secrets**: Use environment variables for sensitive config

## Scalability Considerations

### Current Limitations
- SQLite: Not suitable for high concurrency
- No caching layer
- No background job processing
- Single-threaded SQLite writes

### Scaling Path

**Phase 1**: Small Business (< 10K records/month)
- Current architecture sufficient
- SQLite works fine

**Phase 2**: Medium Business (< 100K records/month)
- Migrate to PostgreSQL
- Add Redis for caching
- Use Celery for background jobs (e.g., metric pre-calculation)

**Phase 3**: Enterprise (> 100K records/month)
- Read replicas for PostgreSQL
- CDN for frontend assets
- Kubernetes for container orchestration
- Message queue (RabbitMQ/Kafka) for event processing

## Deployment Options

### Option 1: Simple VPS
```
- Single server (DigitalOcean, Linode)
- nginx reverse proxy
- systemd for process management
- Let's Encrypt for SSL
```

### Option 2: Docker Compose
```
- Frontend container (nginx + React build)
- Backend container (uvicorn + FastAPI)
- Database container (PostgreSQL)
- Reverse proxy (Traefik/nginx)
```

### Option 3: Cloud Platform
```
- Frontend: Vercel/Netlify
- Backend: AWS Lambda/Google Cloud Run
- Database: AWS RDS/Google Cloud SQL
- CDN: CloudFront/Cloudflare
```

## Monitoring and Observability

### Recommended Tools

**Application Monitoring**:
- Sentry for error tracking
- New Relic/DataDog for APM

**Database Monitoring**:
- PostgreSQL slow query log
- pg_stat_statements extension

**Frontend Monitoring**:
- Google Analytics for usage
- Lighthouse for performance

**Logging**:
- Structured logging (JSON format)
- Centralized log aggregation (ELK stack)

## Testing Strategy

### Unit Tests
- Backend services (CAC calculation logic)
- Frontend components (React Testing Library)

### Integration Tests
- API endpoints (TestClient)
- Database operations (SQLAlchemy)

### E2E Tests
- User flows (Cypress/Playwright)
- Critical paths (add expense → view CAC)

## Future Enhancements

1. **Multi-tenancy**: Support multiple organizations
2. **User Roles**: Admin, Manager, Viewer permissions
3. **Export**: CSV/Excel export functionality
4. **Integrations**: CRM, accounting software APIs
5. **Alerts**: Email/Slack notifications for CAC thresholds
6. **Forecasting**: ML-based CAC predictions
7. **Cohort Analysis**: Track CAC by customer cohort
8. **LTV Tracking**: Add Customer Lifetime Value metrics
9. **Attribution**: Multi-touch attribution modeling
10. **Mobile App**: React Native mobile version

## Performance Benchmarks

**Target Metrics**:
- API response time: < 200ms (p95)
- Page load time: < 2s
- Time to interactive: < 3s
- Database queries: < 50ms

**Optimization Techniques**:
- Database indexing on date columns
- Query result caching (Redis)
- Frontend code splitting
- Image optimization
- Gzip compression

---

This architecture balances simplicity for quick deployment with extensibility for future growth.
