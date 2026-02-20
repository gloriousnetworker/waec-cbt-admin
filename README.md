WAEC CBT Admin Dashboard - School Administrator

A comprehensive school administration dashboard for managing students, tracking performance, and monitoring exams in the WAEC CBT simulation platform.

Live Demo: https://waec-cbt-admin.vercel.app/
Features
🎯 Core Features

    Student Management: Register, edit, and manage student accounts

    Performance Tracking: Monitor individual student progress and scores

    Exam Results: View and analyze exam results across all subjects

    Support Tickets: Communicate directly with super admin via ticketing system

    School Administration: Manage your school's presence in the system

📊 Administrative Features

    Student Registration: Add new students with auto-generated login credentials

    Bulk Registration: Register multiple students at once

    Class Management: Organize students by JSS/SS classes

    Subject Assignment: Assign subjects to students (Mathematics and English auto-assigned)

    Performance Analytics: Subject-wise performance breakdown

    Result Reports: Generate class and individual student reports

    Support System: Create and track support tickets to super admin

    Profile Settings: Manage school and admin profile information

📱 Dashboard Sections

    Home: Overview of school statistics and recent activities

    Students: Complete student management interface

    Performance: Detailed student performance analytics

    Results: Exam results viewer with filtering

    Support: Support ticket management system

    Settings: School and admin configuration

    Help: Resources and documentation

Tech Stack
Frontend

    Next.js 14 - React framework with App Router

    React - UI library

    Framer Motion - Animation library

    Tailwind CSS - Utility-first CSS framework

Key Dependencies

    next: ^14.0.0

    react: ^18.0.0

    framer-motion: ^10.0.0

    react-hot-toast: ^2.4.0

    next/image: Built-in image optimization

Installation
Prerequisites

    Node.js 18.0 or higher

    npm or yarn package manager

Setup Instructions

    Clone the repository
    bash

git clone https://github.com/yourusername/waec-cbt-admin.git
cd waec-cbt-admin

Install dependencies
bash

npm install
# or
yarn install

Run the development server
bash

npm run dev
# or
yarn dev

    Open your browser
    Navigate to http://localhost:3000

Project Structure
text

waec-cbt-admin/
├── app/
│   ├── layout.jsx           # Root layout with AuthProvider
│   ├── page.jsx             # Landing page with splash screen
│   ├── login/               # Admin login page
│   ├── dashboard/           # Admin dashboard
│   │   └── page.jsx         # Main dashboard with sections
│   └── student-registration/ # Student registration page
│       └── page.jsx         # Registration form
├── components/
│   ├── dashboard-components/
│   │   ├── Navbar.jsx       # Dashboard navigation
│   │   └── Sidebar.jsx      # Dashboard sidebar menu
│   ├── dashboard-content/
│   │   ├── Home.jsx         # Dashboard home/overview
│   │   ├── Students.jsx     # Student management
│   │   ├── Performance.jsx  # Performance analytics
│   │   ├── Results.jsx      # Exam results viewer
│   │   ├── Support.jsx      # Support ticket system
│   │   ├── Settings.jsx     # Admin settings
│   │   └── Help.jsx         # Help resources
│   ├── SupportChat.jsx      # Floating support chat
│   ├── SplashScreen.jsx     # App loading screen
│   └── ProtectedRoute.jsx   # Route protection HOC
├── context/
│   └── AuthContext.jsx      # Authentication context
├── public/
│   ├── icons/               # PWA icons
│   ├── logo.png             # School logo placeholder
│   └── manifest.json        # PWA manifest
├── styles/
│   ├── globals.css          # Global styles
│   └── styles.js            # Component styles
└── package.json

Usage Guide
For School Administrators
Getting Started

    Access the App

        Visit the live URL or open locally

        Splash screen appears with loading progress

    Login

        Use credentials provided by Mega Tech Solutions

        Demo credentials available for testing:

            Email: admin@kogistatecollege.edu.ng

            Password: admin123

Student Management

    Register a New Student

        Navigate to Students section

        Click "Add New Student"

        Fill in required fields:

            First Name, Last Name (required)

            Middle Name (optional)

            NIN (optional - can be used for login)

            Phone Number (optional)

            Date of Birth (optional)

            Class (JSS1-3 or SS1-3)

        Default password is set to 123456

        System auto-generates:

            Login ID: firstname.lastname (with numbers if duplicate)

            Email: firstname.lastname@kogistatecollege.edu.ng

        Student can also login using NIN

    Edit Student Information

        Click "Edit" on any student row

        Update necessary information

        Changes are saved automatically

    Delete Student

        Click "Delete" on any student row

        Confirm deletion in modal

        Student removed from system

Performance Tracking

    View Student Performance

        Navigate to Students section

        Click "View" on any student

        Performance dashboard shows:

            Subject-wise average scores

            Recent exam history

            Performance insights (strengths/weaknesses)

            Overall statistics

    Add Subjects to Student

        In Performance view, click "Add Subject"

        Enter subject name

        Subject added to student's profile

        Mathematics and English cannot be deleted

    Delete Subjects

        Hover over subject card

        Click "Delete" (except Mathematics/English)

        Confirm deletion

Exam Results

    View Results

        Navigate to Results section

        Filter by class or subject

        View all exam results with scores and grades

        Click "View Details" to see student performance

    Grade Calculation

        A: 75% and above

        B: 60% - 74%

        C: 50% - 59%

        D: 40% - 49%

        F: Below 40%

Support System

    Create Support Ticket

        Navigate to Support section

        Click "Create New Ticket"

        Fill in subject, category, priority, and description

        Ticket sent to Mega Tech Solutions super admin

    View Tickets

        All tickets displayed with status (open, in-progress, closed)

        Click any ticket to view conversation

        Reply to super admin messages

    Support Chat

        Floating chat button available

        Real-time communication with super admin

        View chat history and responses

Student Login Credentials

When registering students, the system generates:

    Login ID: firstname.lastname (e.g., john.doe)

    Email: firstname.lastname@kogistatecollege.edu.ng

    Password: 123456 (default, can be changed)

    Alternative Login: NIN + password (if NIN provided)

Duplicate prevention:

    If john.doe exists, system creates john.doe001, john.doe002, etc.

PWA Features

The app is a Progressive Web Application with:

    Installable: Add to home screen on mobile devices

    Offline Support: Access previously loaded content offline

    Fast Loading: Optimized for quick startup

    Responsive Design: Works on all screen sizes

To install:

    Mobile: Open in Chrome/Safari → Share menu → Add to Home Screen

    Desktop: Click install icon in address bar

Demo Credentials

For testing purposes:

    Email: admin@kogistatecollege.edu.ng

    Password: admin123

Alternative demo:

    Email: principal@kogistatecollege.edu.ng

    Password: admin123

Roadmap
Phase 1 (Completed)

    Student registration and management

    Performance tracking

    Exam results viewer

    Basic support system

Phase 2 (In Progress)

    Bulk student upload (CSV)

    Class-wide reports

    SMS notifications

    Parent/guardian portal

Phase 3 (Planned)

    Exam scheduling

    Automated result computation

    Integration with school management systems

    Mobile app version

Support

For technical support, use the in-app support ticket system or contact Mega Tech Solutions directly.

Built for Kogi State Ministry of Education in alliance with Mega Tech Solutions.

© 2026 Mega Tech Solutions. All rights reserved.