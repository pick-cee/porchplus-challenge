# Fitness+ Backend

## Overview

Fitness+ is a gym membership management system that offers various billing structures including annual memberships with upfront payments and monthly memberships with add-on services. This backend system handles member registration, membership management, invoicing, and automated reminders for upcoming payments.

### Features

<dl> 1. Member Management

-   Register new members
</dl>

<dl> 2. Membership Management

-   Create annual and monthly memberships
-   Convert existing memberships to monthly plans with add-on services
</dl>

<dl>3. Invoicing

-   Generate invoices for annual memberships
-   Generate invoices for monthly services
-   Handle first-month combined billing (annual fee + first month's service)
</dl>
<dl>4. Automated Reminders

-   Daily cron job to check for upcoming payments
-   Email reminders for annual membership renewals (7 days before due date)
-   Email reminders for monthly service charges (within the due month)
-   Differentiated reminders for new members' first month and existing members' subsequent months
</dl>
<dl>5. RESTful API

-   Well-documented endpoints for all CRUD operations
</dl>
<dl>6. Tech Stack

-   Framework: NestJS
-   Database: PostgreSQL
-   ORM: TypeORM
-   Task Scheduling: @nestjs/schedule
-   Email Service: Novu
</dl>

### Setup and Installation

1. Clone the repository: <br>
   <code>
   git clone https://github.com/pick-cee/porchplus-challenge
   <br>
   cd porchplus-challenge
   </code>.

2. Install dependencies:<br>
   <code>npm install</code>.

3. Set up environment variables: Create a .env file in the root directory with the following variables<br>

```
PORT=

POSTGRES_HOST=
POSTGRES_USERNAME=
POSTGRES_PASSWORD=
POSTGRES_DATABASE=

NOVU_API_KEY=
```

4. Start the server: <br>
   <code> npm run start:dev</code>

### Conclusion

This application performs an automated check every midnight to send reminders where necessary.

### Contact

Akinloluwa Olumuyide - <email>akinloluwaolumuyide@gmail.com</email>.
