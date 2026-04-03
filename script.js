// Mock API Service for simulating backend operations
class MockAPIService {
    constructor() {
        this.baseDelay = 300; // Base delay for API calls (ms)
        this.transactions = JSON.parse(localStorage.getItem('fintrackTransactions')) || [];
    }

    // Simulate API delay
    async delay(ms = this.baseDelay) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // GET /api/transactions
    async getTransactions(filters = {}) {
        await this.delay();
        let filteredTransactions = [...this.transactions];

        // Apply filters
        if (filters.category && filters.category !== 'all') {
            filteredTransactions = filteredTransactions.filter(t => t.category === filters.category);
        }
        if (filters.type) {
            filteredTransactions = filteredTransactions.filter(t => t.type === filters.type);
        }
        if (filters.dateFrom) {
            filteredTransactions = filteredTransactions.filter(t => t.date >= filters.dateFrom);
        }
        if (filters.dateTo) {
            filteredTransactions = filteredTransactions.filter(t => t.date <= filters.dateTo);
        }
        if (filters.amountMin !== undefined) {
            filteredTransactions = filteredTransactions.filter(t => Math.abs(t.amount) >= filters.amountMin);
        }
        if (filters.amountMax !== undefined) {
            filteredTransactions = filteredTransactions.filter(t => Math.abs(t.amount) <= filters.amountMax);
        }

        return {
            success: true,
            data: filteredTransactions,
            total: filteredTransactions.length
        };
    }

    // POST /api/transactions
    async createTransaction(transaction) {
        await this.delay();
        const newTransaction = {
            ...transaction,
            id: Date.now().toString(),
            date: transaction.date || new Date().toISOString().split('T')[0]
        };

        this.transactions.push(newTransaction);
        this.saveToStorage();

        return {
            success: true,
            data: newTransaction,
            message: 'Transaction created successfully'
        };
    }

    // PUT /api/transactions/:id
    async updateTransaction(id, updates) {
        await this.delay();
        const index = this.transactions.findIndex(t => t.id === id || t.date + t.description === id);
        if (index === -1) {
            throw new Error('Transaction not found');
        }

        this.transactions[index] = { ...this.transactions[index], ...updates };
        this.saveToStorage();

        return {
            success: true,
            data: this.transactions[index],
            message: 'Transaction updated successfully'
        };
    }

    // DELETE /api/transactions/:id
    async deleteTransaction(id) {
        await this.delay();
        const index = this.transactions.findIndex(t => t.id === id || t.date + t.description === id);
        if (index === -1) {
            throw new Error('Transaction not found');
        }

        const deletedTransaction = this.transactions.splice(index, 1)[0];
        this.saveToStorage();

        return {
            success: true,
            data: deletedTransaction,
            message: 'Transaction deleted successfully'
        };
    }

    // GET /api/analytics/summary
    async getAnalyticsSummary() {
        await this.delay();
        const summary = {
            totalBalance: 0,
            monthlyIncome: 0,
            monthlyExpenses: 0,
            savings: 0,
            transactionCount: this.transactions.length,
            categories: {}
        };

        this.transactions.forEach(t => {
            if (t.type === 'income') {
                summary.totalBalance += t.amount;
                summary.monthlyIncome += t.amount;
            } else {
                summary.totalBalance += t.amount;
                summary.monthlyExpenses += Math.abs(t.amount);
            }

            // Category breakdown
            if (!summary.categories[t.category]) {
                summary.categories[t.category] = { income: 0, expense: 0, count: 0 };
            }
            summary.categories[t.category][t.type] += Math.abs(t.amount);
            summary.categories[t.category].count++;
        });

        summary.savings = summary.monthlyIncome - summary.monthlyExpenses;

        return {
            success: true,
            data: summary
        };
    }

    // GET /api/export
    async exportData(format = 'json', filters = {}) {
        await this.delay();
        const { data } = await this.getTransactions(filters);

        let exportData;
        let filename;
        let mimeType;

        switch (format.toLowerCase()) {
            case 'csv':
                exportData = this.convertToCSV(data);
                filename = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
                mimeType = 'text/csv';
                break;
            case 'json':
            default:
                exportData = JSON.stringify(data, null, 2);
                filename = `transactions_${new Date().toISOString().split('T')[0]}.json`;
                mimeType = 'application/json';
                break;
        }

        return {
            success: true,
            data: exportData,
            filename,
            mimeType
        };
    }

    convertToCSV(data) {
        if (!data.length) return '';

        const headers = ['Date', 'Description', 'Category', 'Amount', 'Type'];
        const csvRows = [headers.join(',')];

        data.forEach(row => {
            const values = [
                row.date,
                `"${row.description.replace(/"/g, '""')}"`,
                row.category,
                row.amount,
                row.type
            ];
            csvRows.push(values.join(','));
        });

        return csvRows.join('\n');
    }

    saveToStorage() {
        localStorage.setItem('fintrackTransactions', JSON.stringify(this.transactions));
    }

    // Initialize with default data if empty
    initializeDefaultData() {
        if (!this.transactions.length) {
            this.transactions = [
                // April 2026
                { date: '2026-04-01', description: 'Salary', category: 'income', amount: 20243, type: 'income' },
                { date: '2026-04-05', description: 'Room Rent', category: 'rent', amount: -3200, type: 'expense' },
                { date: '2026-04-07', description: 'Loan EMI', category: 'loan', amount: -9170, type: 'expense' },
                { date: '2026-04-02', description: 'Grocery Shopping', category: 'food', amount: -150, type: 'expense' },
                { date: '2026-04-03', description: 'Gas Station', category: 'transport', amount: -50, type: 'expense' },
                { date: '2026-04-04', description: 'Movie Tickets', category: 'entertainment', amount: -30, type: 'expense' },
                { date: '2026-04-06', description: 'Freelance Work', category: 'income', amount: 500, type: 'income' },
                { date: '2026-04-07', description: 'Restaurant', category: 'food', amount: -80, type: 'expense' },
                { date: '2026-04-08', description: 'Bus Pass', category: 'transport', amount: -40, type: 'expense' },
                { date: '2026-04-09', description: 'Concert', category: 'entertainment', amount: -60, type: 'expense' },
                { date: '2026-04-10', description: 'Water Bill', category: 'utilities', amount: -50, type: 'expense' },
                { date: '2026-04-12', description: 'Department Expenses', category: 'other', amount: -1000, type: 'expense' },
                { date: '2026-04-14', description: 'Travelling', category: 'transport', amount: -1000, type: 'expense' },
                // March 2026
                { date: '2026-03-01', description: 'Salary', category: 'income', amount: 20243, type: 'income' },
                { date: '2026-03-05', description: 'Room Rent', category: 'rent', amount: -3200, type: 'expense' },
                { date: '2026-03-07', description: 'Loan EMI', category: 'loan', amount: -9170, type: 'expense' },
                { date: '2026-03-10', description: 'Taxi Ride', category: 'transport', amount: -25, type: 'expense' },
                { date: '2026-03-15', description: 'Theater Show', category: 'entertainment', amount: -45, type: 'expense' },
                { date: '2026-03-20', description: 'Internet Bill', category: 'utilities', amount: -60, type: 'expense' },
                { date: '2026-03-25', description: 'Part-time Job', category: 'income', amount: 400, type: 'income' },
                { date: '2026-03-28', description: 'Coffee Shop', category: 'food', amount: -15, type: 'expense' },
                { date: '2026-03-22', description: 'Department Expenses', category: 'other', amount: -1000, type: 'expense' },
                { date: '2026-03-24', description: 'Travelling', category: 'transport', amount: -1000, type: 'expense' },
            ];
            this.saveToStorage();
        }
    }
}

// Initialize API service
const apiService = new MockAPIService();
apiService.initializeDefaultData();

// Load transactions from localStorage or use default mock data
let transactions = [...apiService.transactions];

// Save transactions to localStorage
async function saveTransactions() {
    // Sync with API service
    apiService.transactions = [...transactions];
    apiService.saveToStorage();
}

// Update table header based on role
function updateTableHeader() {
    const thead = document.querySelector('#transactions-table thead tr');
    const existingActionsHeader = thead.querySelector('th:last-child');
    
    // Remove existing actions header if it exists
    if (existingActionsHeader && existingActionsHeader.textContent === 'Actions') {
        existingActionsHeader.remove();
    }
    
    // Add actions header for admin
    if (appState.role === 'admin') {
        const actionHeader = document.createElement('th');
        actionHeader.textContent = 'Actions';
        actionHeader.style.textAlign = 'center';
        thead.appendChild(actionHeader);
    }
}

// Calculate summaries
async function calculateSummaries() {
    try {
        const response = await apiService.getAnalyticsSummary();
        if (response.success) {
            const summary = response.data;
            document.getElementById('total-balance').textContent = `$${summary.totalBalance.toFixed(2)}`;
            document.getElementById('monthly-income').textContent = `$${summary.monthlyIncome.toFixed(2)}`;
            document.getElementById('monthly-expenses').textContent = `$${summary.monthlyExpenses.toFixed(2)}`;
            document.getElementById('savings').textContent = `$${summary.savings.toFixed(2)}`;
        }
    } catch (error) {
        console.error('Error calculating summaries:', error);
        // Fallback to local calculation
        if (transactions.length === 0) {
            document.getElementById('total-balance').textContent = '$0.00';
            document.getElementById('monthly-income').textContent = '$0.00';
            document.getElementById('monthly-expenses').textContent = '$0.00';
            document.getElementById('savings').textContent = '$0.00';
            return;
        }

        let totalBalance = 0;
        let monthlyIncome = 0;
        let monthlyExpenses = 0;

        transactions.forEach(t => {
            if (t.type === 'income') {
                totalBalance += t.amount;
                monthlyIncome += t.amount;
            } else {
                totalBalance += t.amount;
                monthlyExpenses += Math.abs(t.amount);
            }
        });

        const savings = monthlyIncome - monthlyExpenses;

        document.getElementById('total-balance').textContent = `$${totalBalance.toFixed(2)}`;
        document.getElementById('monthly-income').textContent = `$${monthlyIncome.toFixed(2)}`;
        document.getElementById('monthly-expenses').textContent = `$${monthlyExpenses.toFixed(2)}`;
        document.getElementById('savings').textContent = `$${savings.toFixed(2)}`;
    }
}

// Populate transactions table
function populateTransactions(filterCategory = 'all', filterDate = '', filterPeriod = 'current-month', filteredData = null) {
    const tbody = document.getElementById('transactions-body');
    tbody.innerHTML = '';

    // Use filtered data if provided, otherwise use original transactions array
    let dataToUse = filteredData || transactions;

    if (dataToUse.length === 0) {
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = `
            <td colspan="5" style="text-align: center; padding: 2rem; color: #666;">
                No transactions found. Add some transactions to get started.
            </td>
        `;
        tbody.appendChild(emptyRow);
        return;
    }

    // Sort transactions by date (newest first)
    dataToUse = dataToUse.sort((a, b) => new Date(b.date) - new Date(a.date));

    dataToUse.forEach((t, index) => {
        const row = document.createElement('tr');
        const actionsHTML = appState.role === 'admin' ? `
            <td style="text-align: center;">
                <button class="edit-btn" data-index="${transactions.indexOf(t)}" style="padding: 0.5rem 0.75rem; margin-right: 0.5rem; background-color: #3498db; font-size: 0.85rem;">Edit</button>
                <button class="delete-btn" data-index="${transactions.indexOf(t)}" style="padding: 0.5rem 0.75rem; background-color: #e74c3c; font-size: 0.85rem;">Delete</button>
            </td>
        ` : '';
        
        row.innerHTML = `
            <td>${t.date}</td>
            <td>${t.description}</td>
            <td>${t.category.charAt(0).toUpperCase() + t.category.slice(1)}</td>
            <td style="color: ${t.type === 'income' ? 'green' : 'red'}">$${Math.abs(t.amount).toFixed(2)}</td>
            <td>${t.type.charAt(0).toUpperCase() + t.type.slice(1)}</td>
            ${actionsHTML}
        `;
        tbody.appendChild(row);
    });
    
    // Add event listeners for edit and delete buttons if admin
    if (appState.role === 'admin') {
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.dataset.index);
                editTransaction(index);
            });
        });
        
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.dataset.index);
                deleteTransaction(index);
            });
        });
    }
}

// Create spending chart
function createSpendingChart() {
    const ctx = document.getElementById('spending-chart').getContext('2d');
    const spendingByCategory = {};

    transactions.filter(t => t.type === 'expense').forEach(t => {
        spendingByCategory[t.category] = (spendingByCategory[t.category] || 0) + Math.abs(t.amount);
    });

    const categories = Object.keys(spendingByCategory);
    if (categories.length === 0) {
        // Show empty state
        ctx.font = '16px Arial';
        ctx.fillStyle = '#666';
        ctx.textAlign = 'center';
        ctx.fillText('No expense data available', ctx.canvas.width / 2, ctx.canvas.height / 2);
        return;
    }

    const data = {
        labels: categories,
        datasets: [{
            data: Object.values(spendingByCategory),
            backgroundColor: [
                '#FF6384',
                '#36A2EB',
                '#FFCE56',
                '#4BC0C0',
                '#9966FF'
            ]
        }]
    };

    new Chart(ctx, {
        type: 'pie',
        data: data,
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: 'Spending by Category'
                }
            }
        }
    });
}

// Create time-based chart
function createTimeChart() {
    const ctx = document.getElementById('time-chart').getContext('2d');
    
    if (transactions.length === 0) {
        ctx.font = '16px Arial';
        ctx.fillStyle = '#666';
        ctx.textAlign = 'center';
        ctx.fillText('No transaction data available', ctx.canvas.width / 2, ctx.canvas.height / 2);
        return;
    }
    
    // Calculate balance over time
    const balanceData = [];
    const labels = [];
    let runningBalance = 0;
    
    // Sort transactions by date
    const sortedTransactions = [...transactions].sort((a, b) => new Date(a.date) - new Date(b.date));
    
    sortedTransactions.forEach(t => {
        runningBalance += t.amount;
        balanceData.push(runningBalance);
        labels.push(t.date);
    });

    const data = {
        labels: labels,
        datasets: [{
            label: 'Account Balance Over Time',
            data: balanceData,
            borderColor: '#3498db',
            backgroundColor: 'rgba(52, 152, 219, 0.1)',
            fill: true,
            tension: 0.4
        }]
    };

    new Chart(ctx, {
        type: 'line',
        data: data,
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: 'Financial Balance Trends'
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Date'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Balance ($)'
                    },
                    beginAtZero: false
                }
            }
        }
    });
}

// Create categorical bar chart
function createCategoryChart() {
    const ctx = document.getElementById('category-chart').getContext('2d');
    const spendingByCategory = {};

    transactions.filter(t => t.type === 'expense').forEach(t => {
        spendingByCategory[t.category] = (spendingByCategory[t.category] || 0) + Math.abs(t.amount);
    });

    const categories = Object.keys(spendingByCategory);
    if (categories.length === 0) {
        ctx.font = '16px Arial';
        ctx.fillStyle = '#666';
        ctx.textAlign = 'center';
        ctx.fillText('No expense data available', ctx.canvas.width / 2, ctx.canvas.height / 2);
        return;
    }

    const data = {
        labels: categories,
        datasets: [{
            label: 'Spending Amount ($)',
            data: Object.values(spendingByCategory),
            backgroundColor: [
                '#FF6384',
                '#36A2EB',
                '#FFCE56',
                '#4BC0C0',
                '#9966FF',
                '#FF9F40'
            ],
            borderColor: [
                '#FF6384',
                '#36A2EB',
                '#FFCE56',
                '#4BC0C0',
                '#9966FF',
                '#FF9F40'
            ],
            borderWidth: 1
        }]
    };

    new Chart(ctx, {
        type: 'bar',
        data: data,
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: 'Spending Breakdown by Category'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Amount ($)'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Category'
                    }
                }
            }
        }
    });
}

// Calculate insights
async function calculateInsights() {
    try {
        const filteredTransactions = await getFilteredTransactions();
        if (filteredTransactions.length === 0) {
            document.getElementById('highest-category').textContent = 'No data';
            document.getElementById('highest-amount').textContent = '$0.00';
            document.getElementById('current-month-spending').textContent = '$0.00';
            document.getElementById('previous-month-spending').textContent = '$0.00';
            document.getElementById('spending-change').textContent = '0%';
            document.getElementById('avg-transaction').textContent = '$0.00';
            document.getElementById('savings-rate').textContent = '0%';
            return;
        }

        // Highest spending category
        const spendingByCategory = {};
        filteredTransactions.filter(t => t.type === 'expense').forEach(t => {
            spendingByCategory[t.category] = (spendingByCategory[t.category] || 0) + Math.abs(t.amount);
        });

        const categories = Object.keys(spendingByCategory);
        if (categories.length === 0) {
            document.getElementById('highest-category').textContent = 'No expenses';
            document.getElementById('highest-amount').textContent = '$0.00';
        } else {
            const highestCategory = categories.reduce((a, b) =>
                spendingByCategory[a] > spendingByCategory[b] ? a : b
            );

            document.getElementById('highest-category').textContent = highestCategory.charAt(0).toUpperCase() + highestCategory.slice(1);
            document.getElementById('highest-amount').textContent = `$${spendingByCategory[highestCategory].toFixed(2)}`;
        }

        // Monthly comparison
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        const currentMonthSpending = filteredTransactions
            .filter(t => t.type === 'expense' && new Date(t.date).getMonth() === currentMonth && new Date(t.date).getFullYear() === currentYear)
            .reduce((sum, t) => sum + Math.abs(t.amount), 0);

        const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear;

        const previousMonthSpending = filteredTransactions
            .filter(t => t.type === 'expense' && new Date(t.date).getMonth() === previousMonth && new Date(t.date).getFullYear() === previousYear)
            .reduce((sum, t) => sum + Math.abs(t.amount), 0);

        document.getElementById('current-month-spending').textContent = `$${currentMonthSpending.toFixed(2)}`;
        document.getElementById('previous-month-spending').textContent = `$${previousMonthSpending.toFixed(2)}`;

        const change = previousMonthSpending > 0 ? ((currentMonthSpending - previousMonthSpending) / previousMonthSpending * 100) : 0;
        const changeElement = document.getElementById('spending-change');
        changeElement.textContent = `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`;
        changeElement.style.color = change >= 0 ? '#e74c3c' : '#27ae60';

        // Average transaction
        const totalTransactions = filteredTransactions.length;
        const totalAmount = filteredTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);
        const avgTransaction = totalTransactions > 0 ? totalAmount / totalTransactions : 0;
        document.getElementById('avg-transaction').textContent = `$${avgTransaction.toFixed(2)}`;

        // Savings rate
        const totalIncome = filteredTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
        const totalExpenses = filteredTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + Math.abs(t.amount), 0);
        const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome * 100) : 0;
        document.getElementById('savings-rate').textContent = `${savingsRate.toFixed(1)}%`;
    } catch (error) {
        console.error('Error calculating insights:', error);
    }
}

// Download PDF Statement
async function downloadPDFStatement() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.text('Finance Dashboard - Transaction Statement', 20, 20);

    const selectedMonthFilter = document.getElementById('pdf-month-filter').value;

    // Calculate date range based on selected filter
    const now = new Date();
    let startDate = null;
    let endDate = null;
    let periodLabel = '';

    switch (selectedMonthFilter) {
        case 'current-month':
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            periodLabel = 'Current Month';
            break;
        case 'last-month':
            startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            endDate = new Date(now.getFullYear(), now.getMonth(), 0);
            periodLabel = 'Last Month';
            break;
        case 'last-3-months':
            startDate = new Date(now.getFullYear(), now.getMonth() - 2, 1);
            endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            periodLabel = 'Last 3 Months';
            break;
        case 'last-6-months':
            startDate = new Date(now.getFullYear(), now.getMonth() - 5, 1);
            endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            periodLabel = 'Last 6 Months';
            break;
        case 'year-to-date':
            startDate = new Date(now.getFullYear(), 0, 1);
            endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            periodLabel = 'Year to Date';
            break;
        case 'all':
        default:
            periodLabel = 'All Time';
            break;
    }

    // Get transactions for the selected period
    const filters = {};
    if (startDate && endDate) {
        filters.dateFrom = startDate.toISOString().split('T')[0];
        filters.dateTo = endDate.toISOString().split('T')[0];
    }

    try {
        const response = await apiService.getTransactions(filters);
        const transactions = response.success ? response.data : [];

        let y = 40;
        doc.setFontSize(12);
        doc.text(`Period: ${periodLabel}`, 20, y);
        doc.text(`Total Transactions: ${transactions.length}`, 20, y + 10);
        y += 30;

        if (transactions.length === 0) {
            doc.text('No transactions found for the selected period.', 20, y);
        } else {
            // Sort transactions by date (newest first)
            transactions.sort((a, b) => new Date(b.date) - new Date(a.date));

            transactions.forEach(transaction => {
                const line = `${transaction.date} | ${transaction.description} | ${transaction.category} | $${Math.abs(transaction.amount).toFixed(2)} | ${transaction.type}`;
                doc.text(line, 20, y);
                y += 10;
                if (y > 270) {
                    doc.addPage();
                    y = 20;
                }
            });
        }

        doc.save(`transaction_statement_${selectedMonthFilter}_${new Date().toISOString().split('T')[0]}.pdf`);
        showToast('✅ PDF downloaded successfully!', 'success');
    } catch (error) {
        console.error('Error generating PDF:', error);
        showToast('❌ Failed to generate PDF', 'error');
    }
}

// Event listeners
document.getElementById('period-filter').addEventListener('change', (e) => {
    appState.filters.period = e.target.value;
    applyFiltersAndRefresh();
});

document.getElementById('category-filter').addEventListener('change', (e) => {
    appState.filters.category = e.target.value;
    applyFiltersAndRefresh();
});

document.getElementById('type-filter').addEventListener('change', (e) => {
    appState.filters.type = e.target.value;
    applyFiltersAndRefresh();
});

document.getElementById('date-from').addEventListener('change', (e) => {
    appState.filters.dateFrom = e.target.value;
    applyFiltersAndRefresh();
});

document.getElementById('date-to').addEventListener('change', (e) => {
    appState.filters.dateTo = e.target.value;
    applyFiltersAndRefresh();
});

document.getElementById('amount-min').addEventListener('input', (e) => {
    appState.filters.amountMin = e.target.value ? parseFloat(e.target.value) : undefined;
    applyFiltersAndRefresh();
});

document.getElementById('amount-max').addEventListener('input', (e) => {
    appState.filters.amountMax = e.target.value ? parseFloat(e.target.value) : undefined;
    applyFiltersAndRefresh();
});

// Export event listeners
document.getElementById('download-pdf').addEventListener('click', () => {
    downloadPDFStatement();
});

document.getElementById('download-csv').addEventListener('click', async () => {
    await exportData('csv');
});

document.getElementById('download-json').addEventListener('click', async () => {
    await exportData('json');
});

// Download Statement dropdown
document.getElementById('download-statement-btn').addEventListener('click', () => {
    const menu = document.getElementById('statement-dropdown-menu');
    menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
});

document.getElementById('statement-pdf').addEventListener('click', () => {
    downloadPDFStatement();
    document.getElementById('statement-dropdown-menu').style.display = 'none';
});

document.getElementById('statement-csv').addEventListener('click', async () => {
    await exportData('csv');
    document.getElementById('statement-dropdown-menu').style.display = 'none';
});

document.getElementById('statement-json').addEventListener('click', async () => {
    await exportData('json');
    document.getElementById('statement-dropdown-menu').style.display = 'none';
});

// Close dropdown when clicking outside
document.addEventListener('click', (e) => {
    const statementDropdown = document.querySelector('.statement-dropdown');
    if (statementDropdown && !statementDropdown.contains(e.target)) {
        document.getElementById('statement-dropdown-menu').style.display = 'none';
    }
});

// Application state object
const appState = {
    transactions: [...transactions],
    filters: {
        category: 'all',
        type: 'all',
        dateFrom: '',
        dateTo: '',
        amountMin: undefined,
        amountMax: undefined,
        period: 'current-month'
    },
    role: 'user'
};

async function getFilteredTransactions() {
    const { category, type, dateFrom, dateTo, amountMin, amountMax, period } = appState.filters;
    const now = new Date();
    let startDate = null;
    let endDate = null;

    if (period === 'past-month') {
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        endDate = new Date(now.getFullYear(), now.getMonth(), 0);
    } else if (period === 'current-month') {
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    } else if (period === 'past-3-months') {
        startDate = new Date(now.getFullYear(), now.getMonth() - 2, 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    }
    // For 'all' period, startDate and endDate remain null, so no date filtering

    const filters = {
        category: category !== 'all' ? category : undefined,
        type: type !== 'all' ? type : undefined,
        dateFrom: dateFrom || (startDate ? startDate.toISOString().split('T')[0] : undefined),
        dateTo: dateTo || (endDate ? endDate.toISOString().split('T')[0] : undefined),
        amountMin,
        amountMax
    };

    try {
        const response = await apiService.getTransactions(filters);
        return response.success ? response.data : [];
    } catch (error) {
        console.error('Error fetching filtered transactions:', error);
        // Fallback to local filtering
        return transactions.filter(t => {
            const categoryMatch = category === 'all' || t.category === category;
            const typeMatch = type === 'all' || t.type === type;
            const dateFromMatch = !dateFrom || t.date >= dateFrom;
            const dateToMatch = !dateTo || t.date <= dateTo;
            const amountMinMatch = amountMin === undefined || Math.abs(t.amount) >= amountMin;
            const amountMaxMatch = amountMax === undefined || Math.abs(t.amount) <= amountMax;
            const periodMatch = !startDate || !endDate || (new Date(t.date) >= startDate && new Date(t.date) <= endDate);
            return categoryMatch && typeMatch && dateFromMatch && dateToMatch && amountMinMatch && amountMaxMatch && periodMatch;
        });
    }
}

async function applyFiltersAndRefresh() {
    try {
        const filtered = await getFilteredTransactions();
        populateTransactions(appState.filters.category, appState.filters.dateFrom, appState.filters.period, filtered);
        await calculateSummaries();
        await calculateInsights();
        createSpendingChart();
        createTimeChart();
        createCategoryChart();
        updateTableHeader();
    } catch (error) {
        console.error('Error applying filters:', error);
    }
}

// Export data function
async function exportData(format) {
    try {
        const filters = {
            category: appState.filters.category !== 'all' ? appState.filters.category : undefined,
            type: appState.filters.type !== 'all' ? appState.filters.type : undefined,
            dateFrom: appState.filters.dateFrom,
            dateTo: appState.filters.dateTo,
            amountMin: appState.filters.amountMin,
            amountMax: appState.filters.amountMax
        };

        const response = await apiService.exportData(format, filters);
        if (response.success) {
            downloadFile(response.data, response.filename, response.mimeType);
            showToast(`✅ ${format.toUpperCase()} exported successfully!`, 'success');
        } else {
            showToast('❌ Export failed', 'error');
        }
    } catch (error) {
        console.error('Export error:', error);
        showToast('❌ Export failed', 'error');
    }
}

// Download file utility
function downloadFile(data, filename, mimeType) {
    const blob = new Blob([data], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Toast notification system
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    // Trigger animation
    setTimeout(() => toast.classList.add('show'), 10);

    // Remove after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => document.body.removeChild(toast), 300);
    }, 3000);
}

// Edit transaction function
function editTransaction(index) {
    const transaction = transactions[index];
    const newDate = prompt('Edit Date (YYYY-MM-DD):', transaction.date);
    if (newDate === null) return;
    
    const newDescription = prompt('Edit Description:', transaction.description);
    if (newDescription === null) return;
    
    const newAmount = prompt('Edit Amount:', transaction.amount);
    if (newAmount === null) return;
    
    transactions[index].date = newDate;
    transactions[index].description = newDescription;
    transactions[index].amount = parseFloat(newAmount);
    
    saveTransactions();
    applyFiltersAndRefresh();
    alert('Transaction updated successfully!');
}

// Delete transaction function
function deleteTransaction(index) {
    if (confirm('Are you sure you want to delete this transaction?')) {
        transactions.splice(index, 1);
        saveTransactions();
        applyFiltersAndRefresh();
        alert('Transaction deleted successfully!');
    }
}

// Role change listener
const roleSelect = document.getElementById('user-role');
roleSelect.addEventListener('change', (e) => {
    appState.role = e.target.value;
    // Refresh transactions to show/hide edit/delete buttons based on role
    applyFiltersAndRefresh();
    updateTableHeader();
    // Show/hide filters for all roles
    const controls = document.querySelector('.filters');
    controls.style.display = 'flex';
});

// Profile dropdown toggle
document.getElementById('profile-icon').addEventListener('click', () => {
    const dropdown = document.getElementById('profile-dropdown');
    dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
});

// Close dropdown when clicking outside
document.addEventListener('click', (e) => {
    const profile = document.querySelector('.profile');
    const dropdown = document.getElementById('profile-dropdown');
    if (!profile.contains(e.target)) {
        dropdown.style.display = 'none';
    }
});

// Profile section save handlers
document.getElementById('save-profile').addEventListener('click', () => {
    const profileData = {
        fullName: document.getElementById('full-name').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value
    };
    localStorage.setItem('fintrackProfile', JSON.stringify(profileData));
    alert('Profile information saved successfully!');
});

document.getElementById('save-address').addEventListener('click', () => {
    const addressData = {
        street: document.getElementById('street').value,
        city: document.getElementById('city').value,
        state: document.getElementById('state').value,
        zip: document.getElementById('zip').value
    };
    localStorage.setItem('fintrackAddress', JSON.stringify(addressData));
    alert('Address information saved successfully!');
});

document.getElementById('save-settings').addEventListener('click', () => {
    const settingsData = {
        currency: document.getElementById('currency').value,
        twoFactor: document.getElementById('two-factor').checked
    };
    localStorage.setItem('fintrackSettings', JSON.stringify(settingsData));
    alert('Account settings saved successfully!');
});

document.getElementById('update-billing').addEventListener('click', () => {
    const billingData = {
        cardNumber: document.getElementById('card-number').value,
        expiry: document.getElementById('expiry').value,
        cvv: document.getElementById('cvv').value
    };
    localStorage.setItem('fintrackBilling', JSON.stringify(billingData));
    alert('Billing information updated successfully!');
});

document.getElementById('save-notifications').addEventListener('click', () => {
    const notificationsData = {
        emailNotifications: document.getElementById('email-notifications').checked,
        smsNotifications: document.getElementById('sms-notifications').checked,
        pushNotifications: document.getElementById('push-notifications').checked,
        weeklyReport: document.getElementById('weekly-report').checked
    };
    localStorage.setItem('fintrackNotifications', JSON.stringify(notificationsData));
    alert('Notification preferences saved successfully!');
});

// Handle logout
document.querySelector('a[href="#LOGOUT"]').addEventListener('click', (e) => {
    e.preventDefault();
    if (confirm('Are you sure you want to logout?')) {
        alert('Logged out successfully!');
        // In a real app, this would redirect to login page
    }
});

// Theme dropdown functionality
document.addEventListener('DOMContentLoaded', () => {
    const themeDropdownBtn = document.getElementById('theme-dropdown-btn');
    const themeDropdownMenu = document.getElementById('theme-dropdown-menu');
    const lightModeBtn = document.getElementById('light-mode-btn');
    const darkModeBtn = document.getElementById('dark-mode-btn');

    // Toggle dropdown menu
    themeDropdownBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        themeDropdownMenu.classList.toggle('show');
    });

    // Light mode button
    lightModeBtn.addEventListener('click', () => {
        setTheme('light');
        themeDropdownMenu.classList.remove('show');
    });

    // Dark mode button
    darkModeBtn.addEventListener('click', () => {
        setTheme('dark');
        themeDropdownMenu.classList.remove('show');
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!themeDropdownBtn.contains(e.target) && !themeDropdownMenu.contains(e.target)) {
            themeDropdownMenu.classList.remove('show');
        }
    });

    function setTheme(theme) {
        if (theme === 'dark') {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
        localStorage.setItem('fintrackTheme', theme);
    }
});

// Apply saved theme on page load
function applySavedTheme() {
    const savedTheme = localStorage.getItem('fintrackTheme');
    const settingsData = JSON.parse(localStorage.getItem('fintrackSettings'));
    const settingsTheme = settingsData ? settingsData.theme : null;
    const prefersDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = savedTheme || settingsTheme || (prefersDarkMode ? 'dark' : 'light');
    
    if (initialTheme === 'dark') {
        document.body.classList.add('dark-mode');
    } else {
        document.body.classList.remove('dark-mode');
    }
}

// Load saved profile data
async function loadSavedData() {
    // Apply saved theme on page load
    applySavedTheme();
    const profileData = JSON.parse(localStorage.getItem('fintrackProfile'));
    if (profileData) {
        document.getElementById('full-name').value = profileData.fullName || 'John Doe';
        document.getElementById('email').value = profileData.email || 'john.doe@example.com';
        document.getElementById('phone').value = profileData.phone || '+1 (555) 123-4567';
    }

    const addressData = JSON.parse(localStorage.getItem('fintrackAddress'));
    if (addressData) {
        document.getElementById('street').value = addressData.street || '123 Finance Street';
        document.getElementById('city').value = addressData.city || 'Money City';
        document.getElementById('state').value = addressData.state || 'CA';
        document.getElementById('zip').value = addressData.zip || '90210';
    }

    const settingsData = JSON.parse(localStorage.getItem('fintrackSettings'));
    if (settingsData) {
        document.getElementById('currency').value = settingsData.currency || 'USD';
        document.getElementById('two-factor').checked = settingsData.twoFactor !== false;
    }

    const billingData = JSON.parse(localStorage.getItem('fintrackBilling'));
    if (billingData) {
        document.getElementById('card-number').value = billingData.cardNumber || '**** **** **** 1234';
        document.getElementById('expiry').value = billingData.expiry || '12/26';
        document.getElementById('cvv').value = billingData.cvv || '***';
    }

    const notificationsData = JSON.parse(localStorage.getItem('fintrackNotifications'));
    if (notificationsData) {
        document.getElementById('email-notifications').checked = notificationsData.emailNotifications !== false;
        document.getElementById('sms-notifications').checked = notificationsData.smsNotifications || false;
        document.getElementById('push-notifications').checked = notificationsData.pushNotifications !== false;
        document.getElementById('weekly-report').checked = notificationsData.weeklyReport !== false;
    }
}

// Load saved data on page load
async function initializeApp() {
    await loadSavedData();
    await calculateSummaries();
    await applyFiltersAndRefresh();
    createSpendingChart();
    createTimeChart();
    createCategoryChart();
    await calculateInsights();
    saveTransactions();
    updateTableHeader();
}

initializeApp();