NYSC CDS Attendance Portal

A comprehensive digital attendance management system for National Youth Service Corps (NYSC) Community Development Service (CDS) groups in Nigeria.
Live Demo

🌐 Live Application: https://nysc-corpers-cds-attendance-app.vercel.app/
Features
🎯 Core Features

    Digital Attendance Tracking: Mark and monitor CDS attendance digitally

    User Authentication: Secure login/signup for corps members

    Profile Management: Complete NYSC profile with all required details

    Attendance Calendar: Visual monthly calendar with attendance status

    CDS Dues Management: Track and pay CDS group dues

    Schedule Management: View upcoming CDS activities and meetings

    Reports Generation: Generate attendance and performance reports

    Multi-step Registration: User-friendly 3-step signup process with email verification

📱 User Features

    Dashboard Overview: Quick stats and recent activities

    Attendance History: Complete attendance record with visual indicators

    Profile Customization: Update personal and NYSC information

    Payment Integration: Manage CDS dues payments

    Calendar Integration: Sync CDS schedule with personal calendar

    Report Export: Download reports in PDF, Excel, and CSV formats

    Notification System: Email, SMS, and push notifications

    Responsive Design: Works on desktop, tablet, and mobile devices

Tech Stack
Frontend

    Next.js 14 - React framework with App Router

    React - UI library

    Tailwind CSS - Utility-first CSS framework

    GSAP - Animation library for smooth transitions

    Font Awesome - Icons

Key Dependencies

    next: ^14.0.0

    react: ^18.0.0

    react-dom: ^18.0.0

    gsap: ^3.12.0

    next/image: Built-in image optimization

    next/link: Client-side navigation

Installation
Prerequisites

    Node.js 18.0 or higher

    npm or yarn package manager

Setup Instructions

    Clone the repository

bash

git clone https://github.com/gloriousnetworker/nysc-corpers-cds-attendance-app.git
cd nysc-attendance-app

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

nysc-attendance-app/
├── app/
│   ├── login/              # Login page
│   ├── signup/            # Signup page (3-step process)
│   ├── corpers-dashboard/ # Main dashboard
│   └── page.jsx           # Landing page
├── components/
│   ├── dashboard/         # Dashboard components
│   │   ├── DashboardNavbar.jsx
│   │   ├── DashboardSidebar.jsx
│   │   ├── DashboardContent.jsx
│   │   └── sections/      # Dashboard sections
│   │       ├── OverviewSection.jsx
│   │       ├── AttendanceSection.jsx
│   │       ├── ProfileSection.jsx
│   │       ├── DuesSection.jsx
│   │       ├── ScheduleSection.jsx
│   │       ├── ReportsSection.jsx
│   │       ├── SettingsSection.jsx
│   │       └── HelpSection.jsx
│   ├── Navbar.jsx         # Main navigation
│   └── Footer.jsx         # Site footer
├── public/
│   ├── images/            # Static images
│   │   └── nysc-logo.png  # NYSC logo
│   └── videos/            # Video files
├── styles/               # Global styles
└── package.json

Usage Guide
For Corps Members

    Registration

        Visit the signup page

        Complete 3-step registration process:

            Step 1: Basic information (name, email, phone)

            Step 2: NYSC details (state code, serving state, CDS group)

            Step 3: Email verification

        Verify email with 6-digit code

    Login

        Use email/state code and password

        Demo login available for quick testing

    Dashboard Navigation

        Overview: View stats and quick actions

        Attendance: Mark and view attendance

        Profile: Update personal information

        CDS Dues: Manage payments

        Schedule: View upcoming activities

        Reports: Generate attendance reports

        Settings: Configure preferences

        Help: Access support resources

    Marking Attendance

        Navigate to Attendance section

        Click "Mark Today's Attendance"

        Attendance recorded instantly

For Administrators

(Note: Admin features to be implemented)

    Monitor attendance across CDS groups

    Generate group reports

    Manage user accounts

    Configure system settings

Features in Detail
🎨 Landing Page

    Engaging hero section with NYSC video

    Information about NYSC and CDS

    Call-to-action buttons for login/signup

    Responsive design with smooth animations

🔐 Authentication System

    Secure login with email/state code

    3-step signup with verification

    Password protection

    Session management with localStorage

📊 Dashboard Features

    Real-time Stats: Attendance rate, days present, total days

    Interactive Calendar: Visual attendance tracking

    Profile Management: Full CRUD operations for user data

    Payment System: Track and pay CDS dues

    Schedule View: Upcoming CDS activities

    Report Generation: Customizable reports in multiple formats

    Settings: Customizable preferences and privacy controls

📱 Mobile Responsive

    Fully responsive design

    Mobile-optimized navigation

    Touch-friendly interface

    Progressive Web App capabilities

API Endpoints

(Note: Current implementation uses localStorage for demo. Backend integration pending)
Planned Endpoints
text

POST   /api/auth/login          # User login
POST   /api/auth/signup         # User registration
POST   /api/auth/verify         # Email verification
GET    /api/user/profile        # Get user profile
PUT    /api/user/profile        # Update profile
POST   /api/attendance/mark     # Mark attendance
GET    /api/attendance          # Get attendance records
POST   /api/payments            # Process payment
GET    /api/reports             # Generate reports

Environment Variables

Create a .env.local file in the root directory:
env

NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3000/api
# Add more variables as needed for production

Deployment
Vercel Deployment

    Push code to GitHub repository

    Import project in Vercel dashboard

    Configure build settings:

        Build Command: npm run build

        Output Directory: .next

    Deploy

Other Platforms

The app can be deployed on any platform supporting Next.js:

    Netlify

    AWS Amplify

    Railway

    Heroku

Testing
Demo Credentials

For testing purposes, use:

    Email/State Code: Any value

    Password: Any value

    Demo Login: Click "Quick Demo Login" button

Test Scenarios

    User registration flow

    Attendance marking

    Profile updates

    Report generation

    Mobile responsiveness

Contributing

We welcome contributions! Please follow these steps:

    Fork the repository

    Create a feature branch (git checkout -b feature/AmazingFeature)

    Commit your changes (git commit -m 'Add some AmazingFeature')

    Push to the branch (git push origin feature/AmazingFeature)

    Open a Pull Request

Development Guidelines

    Follow React/Next.js best practices

    Use functional components with hooks

    Maintain consistent code style

    Add comments for complex logic

    Test thoroughly before submitting

Roadmap
Phase 1 (Completed)

    Landing page design

    User authentication

    Basic dashboard

    Attendance tracking

    Profile management

Phase 2 (In Progress)

    Backend API integration

    Database setup

    Admin dashboard

    Payment gateway integration

    Email/SMS notifications

Phase 3 (Planned)

    Mobile app development

    Advanced analytics

    CDS group management

    Certificate generation

    API documentation

Support

For support, email: support@nysc-attendance.ng or use the in-app help section.
License

This project is licensed under the MIT License - see the LICENSE file for details.
Acknowledgments

    National Youth Service Corps (NYSC)

    All contributing developers

    Open source community

    Nigerian corps members for inspiration

Contact

Project Link: https://github.com/gloriousnetworker/nysc-corpers-cds-attendance-app.git

Live Demo: https://nysc-corpers-cds-attendance-app.vercel.app/

Built with ❤️ for Nigerian Youth Service Corps Members