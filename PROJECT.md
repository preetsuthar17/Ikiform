# Ikiform

Ikiform is an open-source alternative to Typeform and Google Forms, designed to help you create beautiful forms effortlessly.

## Features

- **Open Source**: Fully open-source, allowing you to self-host and customize.
- **Beautiful Design**: Create visually appealing forms with ease.
- **Easy to Use**: Intuitive interface for both form creators and respondents.
- **Customizable**: Tailor forms to your specific needs with various question types and themes.
- **Analytics and Reporting**: Gain insights into form performance with built-in analytics and reporting features.
- **Integrations**: Connect with popular services and tools for enhanced functionality.
- **Responsive Design**: Forms that look great on any device, ensuring a seamless experience for users.
- **Community Driven**: Join a growing community of users and contributors to share ideas and improvements.

## Pages

- **Home**: Overview of Ikiform, its features, and benefits.
- **Dashboard**: User dashboard for managing forms, responses, and settings.
- **Create Form**: Interface for creating new forms with various question types.
- **Form Builder**: Drag-and-drop form builder for easy customization.
- **Responses**: View and manage form responses, with options for filtering and exporting data.
- **Analytics**: Insights into form performance, including response rates and demographics.
- **Settings**: Configure account settings, including profile information and notification preferences.
- **User Management**: Manage user accounts, roles, and permissions for collaborative form building.

## Stack

- Next.js
- Tailwind CSS
- Supabase
- Typescript
- ShadCN UI

## Workflow

- **Development**: Use Next.js for server-side rendering and routing, Tailwind CSS for styling, and ShadCN UI for pre-built components.
- **Database**: Utilize Supabase for database management, authentication, and real-time capabilities.
- **Deployment**: Deploy on platforms like Vercel or Netlify for easy hosting and continuous deployment.
- **Version Control**: Use Git for version control, with a focus on collaborative development and code reviews.

## Working

- Basically user will login, then they will be able to create forms, view responses, and manage their account settings.
- User will have access to a dashboard where they can see an overview of their forms and responses.
- User can create a new form by clicking on the "Create Form" button, which will take them to the form builder interface.
- User can customize their form using the drag-and-drop form builder, adding various question types and design elements.
- Once the form is created, user can view and manage responses in the "Responses" section, where they can filter and export data as needed.
- User can access analytics to gain insights into form performance, including response rates and demographics.
- User can configure their account settings in the "Settings" section, including profile information and notification preferences.
- Created forms can be shared via a unique link, allowing others to fill them out without needing an account.

I want to separate front-end and back-end code in the project structure. The front-end will be built using Next.js, Tailwind CSS, and ShadCN UI, while the back-end will utilize Supabase for database management and authentication.

Created forms will be stored in the Supabase database, and users will be able to access their forms and responses through the Next.js application. The application will also include user authentication, allowing users to log in and manage their forms securely.

## Project Structure

```project-root/
├── frontend/                # Front-end code
│   ├── components/          # Reusable UI components
│   ├── pages/               # Next.js pages
│   ├── styles/              # Tailwind CSS styles
│   ├── public/              # Static assets
│   ├── utils/               # Utility functions and hooks
│   ├── package.json          # Front-end dependencies
│   └── next.config.js       # Next.js configuration
├── backend/                 # Back-end code
│   ├── functions/           # Supabase functions (if any)
│   ├── migrations/          # Database migrations
│   ├── seeds/               # Database seed data
│   ├── supabase/            # Supabase configuration and client
│   ├── .env                  # Environment variables for back-end
│   └── package.json          # Back-end dependencies
├── README.md                # Project documentation
└── LICENSE                  # License file
```
