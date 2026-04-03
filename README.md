# Finance Dashboard

A clean and interactive finance dashboard built with plain HTML, CSS, and JavaScript. This project demonstrates frontend development skills by creating an intuitive interface for tracking financial activity.

## Features

### Dashboard Overview
- **Financial Summary Cards**: Display total balance, monthly income, monthly expenses, and savings
- **Real-time Calculations**: Automatically calculates summaries from transaction data

### Transactions Section
- **Comprehensive Transaction List**: View all income and expense transactions in a table format
- **Advanced Filtering**:
  - Filter by category (Food, Transport, Entertainment, Utilities, Income, etc.)
  - Filter by specific date
  - Filter by time period (All Time, Past Month, Current Month, Past 3 Months)
- **PDF Export**: Download transaction statements as PDF files

### Analytics Section
- **Spending Patterns Chart**: Interactive pie chart showing spending breakdown by category
- **Responsive Design**: Chart adapts to different screen sizes

### Navigation
- **Smooth Scrolling Navigation**: Click nav links to smoothly scroll to different sections
- **Responsive Navbar**: Clean navigation bar with logo and profile icon

## Technical Approach

### Frontend Technologies
- **HTML5**: Semantic structure with proper sectioning
- **CSS3**: Custom styling with modern design principles, including flexbox for layouts
- **Vanilla JavaScript**: No frameworks used - pure JS for DOM manipulation, data handling, and interactivity

### Libraries Used
- **Chart.js**: For creating the spending patterns pie chart
- **jsPDF**: For generating PDF statements from transaction data

### Code Structure
- **Modular Functions**: Separate functions for data calculation, table population, chart creation, and PDF generation
- **Event-Driven Updates**: Filters and inputs trigger real-time UI updates
- **Responsive Design**: Mobile-friendly layout that works on various screen sizes

### State Management
- **In-Memory Data**: Mock transaction data stored in JavaScript arrays
- **Dynamic Filtering**: State managed through filter selections, with immediate UI reflection
- **No External State Libraries**: Simple, effective state handling with vanilla JS

### Data Handling
- **Mock Data**: Realistic transaction data spanning multiple months
- **Date-Based Filtering**: Intelligent date range calculations for period filters
- **Category Classification**: Proper categorization of income vs expenses

## Setup Instructions

1. **Clone or Download**: Place the project files in a directory
2. **Open in Browser**: Simply open `index.html` in any modern web browser
3. **No Dependencies Required**: All libraries are loaded via CDN

### File Structure
```
finance-dashboard/
├── index.html      # Main HTML structure
├── style.css       # Styling and responsive design
├── script.js       # JavaScript logic and interactivity
└── README.md       # This documentation
```

## Browser Compatibility
- Modern browsers (Chrome, Firefox, Safari, Edge)
- Requires JavaScript enabled
- Responsive design works on desktop, tablet, and mobile

## Features in Detail

### Navigation
- Smooth scroll to sections when clicking nav links
- Visual feedback on hover

### Dashboard Cards
- Color-coded values (green for positive, red for expenses)
- Clean card design with shadows and rounded corners

### Transaction Table
- Sortable columns (date, description, category, amount, type)
- Color-coded amounts (green for income, red for expenses)
- Hover effects for better usability

### Filters
- Multiple filter combinations work together
- Real-time updates without page refresh
- Intuitive dropdown and date picker interfaces

### PDF Export
- Generates professional-looking statements
- Includes filter information in the PDF
- Automatic pagination for long transaction lists

### Chart
- Interactive pie chart with hover tooltips
- Color-coded categories
- Responsive sizing

## Design Philosophy

The dashboard follows a clean, minimal design approach:
- **Whitespace**: Generous use of white space for readability
- **Typography**: Clear hierarchy with appropriate font sizes
- **Colors**: Professional color scheme with blue accents
- **Consistency**: Uniform styling across all components
- **Accessibility**: Proper contrast ratios and semantic HTML

## Future Enhancements

While this is a frontend-only implementation, potential backend integrations could include:
- User authentication
- Real database storage
- API integrations for financial data
- Advanced analytics and reporting
- Budget tracking features
- Multi-currency support

This project demonstrates solid frontend development fundamentals while maintaining simplicity and usability.