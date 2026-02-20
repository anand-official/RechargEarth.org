# RechargEarth.org

RechargEarth.org is a full-stack web platform designed to support structured tree-planting initiatives and promote environmental sustainability through digital engagement.

This project was delivered as a **freelance engagement**, with emphasis on production-grade architecture, clean UI/UX execution, and scalable backend infrastructure. The objective was not only to build a functional system, but to craft a refined and intuitive digital experience that encourages user participation.

---

## Overview

The platform enables individuals to pledge tree plantation initiatives aligned with personal milestones and community events. It combines a minimal, nature-inspired interface with a secure Firebase backend to ensure reliability, scalability, and maintainability.

The design philosophy prioritizes clarity, responsiveness, and user flow optimization. Every interface element is intentional — guiding users naturally while reinforcing the environmental mission of the platform.

---

## Key Features

### User Capabilities

* Secure authentication (Email & Google Sign-In)
* Dashboard for managing pledges
* Structured tree-planting packages
* Real-time data updates via Firestore
* Fully responsive UI

### Administrative Capabilities

* Role-based access control
* Package and data management
* Firebase rule enforcement
* Backend monitoring via Cloud Functions

---

## Architecture & Tech Stack

### Frontend

* HTML5
* Vanilla JavaScript
* Responsive CSS

### Backend

* Firebase Authentication
* Firebase Firestore
* Firebase Cloud Functions
* Firebase Hosting

### Tooling

* Node.js
* Firebase CLI

The system is structured for scalability, with separation between frontend assets, cloud functions, and configuration layers.

---

## Project Structure

```
RechargEarth.org/
│
├── functions/                     # Firebase Cloud Functions
├── src/
│   └── dataconnect-generated/      # Generated data bindings
│
├── index.html                     # Primary landing page
├── firebase.json                  # Firebase configuration
├── firestore.rules                # Security rules
├── firestore.indexes.json
├── package.json                   # Dependencies & scripts
│
├── ADMIN_SETUP.md
├── FIREBASE_SETUP.md
├── GOOGLE_SHEETS_SETUP.md
├── NEXT_STEPS_DEPLOYMENT_GUIDE.md
├── BACKEND_FIX.md
│
├── push-v2.sh
├── push-v3.sh
└── DEPLOY_RULES.sh
```

---

## Local Development

### 1. Clone the Repository

```bash
git clone https://github.com/anand-official/RechargEarth.org.git
cd RechargEarth.org
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Authenticate with Firebase

```bash
firebase login
```

### 4. Start Local Emulators

```bash
firebase emulators:start
```

---

## Deployment

Deployment is handled via Firebase Hosting and Cloud Functions:

```bash
firebase deploy
```

Alternatively, use the provided deployment scripts:

```bash
bash push-v2.sh
bash push-v3.sh
```

Refer to the documentation files included in the repository for environment configuration and production setup guidance.

---

## Design & Engineering Approach

The platform was built with the following principles:

* Maintainable code structure
* Secure data access via Firestore rules
* Clear separation between presentation and backend logic
* Performance-conscious implementation
* Clean, modern, and purpose-aligned visual design

The interface intentionally reflects clarity and environmental harmony, ensuring that users feel confident and engaged throughout their interaction with the platform.

---

## Contribution

If contributing:

1. Fork the repository
2. Create a feature branch
3. Commit with descriptive messages
4. Submit a Pull Request

All contributions should maintain code clarity and follow existing project structure.

---

## License

Specify license details here (e.g., MIT License).

---

## Project Attribution

This platform was developed and delivered as a freelance project, balancing technical depth with refined user experience design to support a sustainability-focused initiative.
