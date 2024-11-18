# final-webka

Final project, Web Technologies

# Overview
This is project for my final in Subject Web Technologies. It can be described as portfolio platform where users can register, log in, and manage their portfolios. It allows users to create, edit, and delete portfolio items. Admin users have full access to create, update, and delete items, while users can look through posts. The theme is connected with e-sport, photos of successful players being shown both for admiration from users and for a successful example, so players would be motivated to use this platform.

# Screenshots
Main pages are login page, registration and main pages, main page having all information seen with posts, while login and register pages are connected with database and allow users to go through authentication with some security measures

![image](https://github.com/user-attachments/assets/764faab8-d9cb-4e2a-b333-b68c61e02c1f)

![image](https://github.com/user-attachments/assets/525e1dc2-7367-4dac-809f-52838dae0998)

![image](https://github.com/user-attachments/assets/c34f970f-6963-45e2-8278-fa1ce808f99e)


# Report

Project was made by Zhaksygali Indira, BDA-2301, github projects AI were used as an additional help to fix bugs

**E-Sport Portfolio**

E-Sport Portfolio is a web application designed for creating and managing gaming portfolios. Users can register, log in, upload images of their achievements, and manage their projects. The app features two-factor authentication (2FA) for enhanced security. Administrators have access to a control panel where they can manage users and their content.

Key features include user registration and login, two-factor authentication (2FA), the ability to create, edit, and delete portfolio projects, image uploads, and email notifications with welcome messages and 2FA setup instructions. Administrators can manage users and their content through an admin panel.

The project structure includes essential files like `server.js`, which handles server operations, models for users and portfolios, and static files and pages. MongoDB is used for database interactions, and Multer handles image uploads. Passwords are securely hashed using bcryptjs, and Speakeasy is used for implementing two-factor authentication.

To set up the project, clone the repository, install dependencies with `npm install`, configure environment variables in the `.env` file, and start the application with `npm run dev`. The app will be available at http://localhost:3000.

There is 2 API added, News API and Exchange rate API for higher comfort and enlargement of possibilities.

In conclusion, E-Sport Portfolio provides a secure and user-friendly platform for creating and managing gaming portfolios, with two-factor authentication for account security and an admin panel for managing content.
