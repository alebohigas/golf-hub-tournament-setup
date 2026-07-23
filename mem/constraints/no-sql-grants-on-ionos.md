---
name: No SQL GRANT statements on IONOS
description: MySQL migrations for IONOS must not include GRANT/privilege statements.
type: constraint
---
Do not add `GRANT`, privilege, role, or permission-management SQL statements to migrations or server SQL for this IONOS MySQL deployment. The hosting/database user already has the needed privileges, and privilege SQL can fail or destabilize uploads. **Why:** The server runs MySQL on IONOS shared hosting, not Postgres/Cloud, and previous GRANT SQL caused serious production issues.
