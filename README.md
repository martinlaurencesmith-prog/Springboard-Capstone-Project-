# BindFlow

BindFlow is a full-stack bookbinding production and order management system built as a Springboard Capstone Project.

It allows staff and admins to manage production orders, quotes, deliveries, and payments, while clients can track the progress of their jobs.

## Features

### Authentication

- User registration and login
- JWT-based authentication
- Role-based access: `client`, `staff`, `admin`

### Client

- View assigned orders
- Track order status and progress

### Staff / Admin

- Create orders
- View and filter all orders
- Update order status
- Add/update quotes
- Record partial deliveries
- Record multiple payments with total summary
- Delete orders

### Business Rules

- Clients only track progress
- Staff/Admin manage production workflow
- Orders can be linked to registered clients by Business NIT
- Orders can still be created for unregistered clients

## Tech Stack

- **Frontend:** Next.js (App Router), React, TypeScript, Tailwind CSS
- **Backend:** Next.js API Routes
- **Database:** MongoDB + Mongoose
- **Auth:** JWT + bcryptjs
- **Validation:** Zod + React Hook Form
- **Notifications:** Sonner

## Project Structure

```text
app/
  api/                # Backend API routes
  client/             # Client dashboard
  staff/              # Staff/admin pages
  login/
  register/
  page.tsx            # Landing page
components/
lib/                  # db, auth, withAuth helpers
models/               # User, Order schemas
```
