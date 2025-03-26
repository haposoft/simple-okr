# View Statistics and Reports

## User Story
**As** a manager, **I want** to view statistics and reports on objective progress for each department **so that** I can evaluate performance and make appropriate decisions.

## Acceptance Criteria
1. Users can access the reports and statistics page from the main menu
2. The page displays an overview of statistical data:
   - Total number of objectives
   - Number of active objectives
   - Number of completed objectives
3. Display progress charts by department (bar chart or pie chart)
4. Display progress charts over time (line chart)
5. Allow filtering data by criteria:
   - Time range (month, quarter, year)
   - Specific department or all departments
6. Data is updated in real-time or at short regular intervals
7. Charts and statistics must be clear, visual, and easy to understand
8. Users can create new reports with customized parameters

## Definition of Done
- Reports and statistics page displays data accurately
- API endpoint to retrieve statistical data has been created
- Charts are created and display data correctly
- Filtering functionality works correctly
- User interface is intuitive and easy to use
- Statistics are updated at the correct time
- Functionality works correctly across different browsers and devices
- Page performance is good, not slowing down when processing large amounts of data

## Priority
Medium

## Story Points
8

## Notes
- Need to ensure performance when processing large amounts of data
- Consider adding functionality to export reports as PDF or Excel
- Consider access rights to data (users should only see data for departments they have permission for)
- Additional chart types and reports may be added in the future
- Consider adding periodic report notifications for managers 