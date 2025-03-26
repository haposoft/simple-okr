# Assign User to Department

## User Story
**As** a department manager, **I want** to assign users to my department and designate roles for them **so that** I can build the personnel structure and allocate appropriate permissions.

## Acceptance Criteria
1. Users with Admin or Manager rights can assign users to departments
2. The interface displays a list of existing users in the system
3. Users can be searched by name or email
4. When selecting a user, a form for department assignment is displayed with fields:
   - Department (dropdown to select department, managers only see departments they manage)
   - Role in department (MEMBER, LEADER, MANAGER)
   - Mark as primary department (checkbox)
5. If marked as primary department, the system automatically unmarks the user's current primary department (if any)
6. When clicking "Save", the system saves the user's department information
7. User receives a success notification when the assignment is complete
8. The user list in the department is immediately updated
9. Cannot assign a user to a department they already belong to

## Definition of Done
- The user-to-department assignment functionality works correctly
- API endpoint to save user-department relationship has been created
- Primary department mechanism works correctly
- Department roles are correctly stored and displayed
- All test cases for user assignment pass successfully
- User interface is intuitive and easy to use
- Functionality works correctly across different browsers and devices
- Permissions are strictly checked

## Priority
High

## Story Points
5

## Notes
- Need to ensure that only users with Admin or Manager rights can assign users to departments
- Managers should only be able to assign users to departments they manage
- Consider notifying users when they are assigned to a new department
- Consider adding bulk import functionality for assigning multiple users from CSV file 