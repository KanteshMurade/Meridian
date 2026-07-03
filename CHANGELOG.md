# Changelog

All notable changes to **Meridian.ai – AI Powered Code Review & Bug Suggestion System** are documented in this file.

The project follows a continuous improvement approach where features, bug fixes, and enhancements are tracked throughout development.

---

## [1.0.0] - Initial Repository Release

### Project Overview

Meridian.ai is an AI-powered code review platform that analyzes source code and provides bug detection, security analysis, code quality assessment, and refactoring suggestions using Large Language Models.

### Note

The project was initially developed locally. After the core implementation was completed, the codebase was uploaded to GitHub and version control was used for subsequent bug fixes, improvements, and maintenance activities.

### Added

* React frontend application.
* Node.js & Express backend.
* MongoDB database integration.
* Python FastAPI AI microservice.
* Environment configuration and project setup.

### Implemented Features

* User Authentication System.
* GitHub OAuth Login.
* JWT-based Authentication.
* Code Submission Interface.
* Multi-language Code Analysis.
* AI-powered Code Review Engine.
* Bug Detection and Reporting.
* Severity Classification.
* Refactoring Suggestions.
* Suggested Code Fixes.
* Review Dashboard.
* Review History Management.
* Team Sharing Functionality.
* Side-by-Side Code Comparison (Diff Viewer).

### AI Integration

* Groq API Integration.
* Llama 3.3 70B Versatile Model Integration.
* Structured JSON Response Handling.
* AI-generated Summaries and Recommendations.

---

## [1.0.1] - Stability Improvements

### Fixed

* Authentication-related issues.
* Backend API communication issues.
* Review result rendering inconsistencies.
* AI response parsing failures.

### Improved

* Error handling across frontend and backend.
* Loading states during code analysis.
* Response validation mechanisms.
* Application stability and reliability.

---

## [1.0.2] - User Interface Enhancements

### Improved

* Dashboard responsiveness.
* Review result presentation.
* Issue categorization display.
* Navigation experience.

### Fixed

* Layout inconsistencies.
* Review page rendering issues.
* Component alignment problems.

---

## [1.0.3] - Diff Viewer Enhancements

### Added

* Improved original vs suggested code comparison.
* Better code readability in review results.

### Fixed

* Text overflow issues.
* Code wrapping issues.
* Diff viewer alignment issues.
* Suggested code display formatting problems.

---

## [1.0.4] - AI Review Accuracy Improvements

### Added

* Deterministic scoring system for more consistent review scores.
* Fixed penalty-based score calculation for high, medium, and low severity issues.
* Category-based scoring penalties for security, bug, accessibility, performance, UI/UX, and code quality issues.
* Baseline AI context files for improving review reliability.
* OWASP-based security rules.
* Accessibility review rules.
* General security review rules.
* GIGW-related guideline support.
* Prompt-injection protection instructions for AI review requests.
* AI response normalization for severity and category values.

### Improved

* Review score consistency for repeated analysis of the same code.
* AI response validation before saving review results.
* Handling of missing or incomplete AI response fields.
* Security issue detection accuracy.
* Accessibility issue detection support.
* Reduction of hallucinated AI suggestions using predefined rule files.
* Backend review processing logic.
* AI service stability and reliability.

### Fixed

* Score fluctuation issue where the same code received very different scores across multiple reviews.
* Missing severity/category fallback issues.
* Inconsistent AI-generated score handling.
* AI response parsing edge cases.

---

## [1.0.5] - Profile Dashboard Update

### Added

* Profile Dashboard page.
* User profile overview section.
* Avatar/profile image display.
* Username and email display.
* About/bio section.
* Account type display.
* GitHub sync status.
* GitHub username display.
* Member-since date display.
* Edit Profile option.
* New Review button for quick navigation.
* User review statistics section.
* Total reviews summary card.
* Average score summary card.
* Best score summary card.
* Top programming language summary card.
* Review quality insights.
* Issue severity overview.
* Review performance summary.
* Additional dashboard analytics for score trends, review performance, and language usage.

### Improved

* User dashboard experience.
* Navigation between profile, review, and history pages.
* Visibility of user review activity.
* Review analytics presentation.
* Authenticated user interface.
* Profile edit functionality.
* Dashboard analytics accuracy and presentation.

---

## [1.0.6] - GitHub and Review Workflow Enhancements

### Added

* GitHub repository loading support.
* GitHub folder and file browsing support.
* GitHub file decoding and loading into the code editor.
* GitHub source tracking using source type.
* File path validation for GitHub-loaded code.
* File-size validation before loading GitHub files.
* Code title input for reviews.
* Code paste support.
* Code upload support.
* Upload and clear controls.
* Automatic language detection badge.
* Line count and character count display.
* Review and Diff tabs.
* Refactored code display from AI response.

### Improved

* GitHub code review workflow.
* Code submission experience.
* Review page usability.
* Review result organization.
* Source tracking for pasted, uploaded, and GitHub-loaded code.
* GitHub OAuth session handling.
* GitHub account switching and authentication flow.

### Fixed

* GitHub OAuth session persistence issue during local development.
* GitHub file loading reliability issues.
* Code editor reset/clear handling.
* Minor review page workflow issues.

---

## [1.0.7] - Review History and Sharing Enhancements

### Added

* Search support in Review History.
* Score-based review filtering.
* Review cards for saved reviews.
* Selected review detail view.
* Delete review option.
* Share review option.
* Shareable review token support.
* Public sharing flag support.
* Public shared review page.
* Token-based public review access.
* Review ownership handling.
* MongoDB-backed review persistence improvements.

### Improved

* Review history management.
* Saved review navigation.
* Review detail presentation.
* Review sharing workflow.
* Public review sharing flow.
* User-specific review storage and access.
* Review history functionality and performance.

### Fixed

* Review history rendering issues.
* Review delete handling issues.
* Review data display inconsistencies.
* Public shared review access issues.
* Public review sharing verification issues.

---

## [1.0.8] - Final Validation and Security Enhancements

### Added

* Complete logout flow with proper session destruction.
* Cookie invalidation support during logout.
* Stronger server-side file validation for uploaded code files.
* Improved validation for review requests.
* Improved validation for uploaded files.
* Improved validation for GitHub-loaded files.
* Enhanced error handling across frontend, backend, and AI service.
* Final verification for public review sharing.
* Improved profile edit functionality.
* Additional dashboard analytics.

### Improved

* Application security.
* Authentication and logout reliability.
* File upload safety.
* Backend validation mechanisms.
* Frontend error display.
* Backend error response consistency.
* Public sharing reliability.
* Profile management experience.
* Dashboard analytics and user insights.
* Overall application stability before final evaluation.

### Fixed

* Logout flow issues.
* Session cleanup issues.
* Cookie invalidation issues.
* Server-side file validation gaps.
* Validation and error handling issues.
* Public review sharing flow issues.
* Profile editing issues.
* Dashboard analytics limitations.
* Minor frontend rendering issues.

---

## [Current Development]

### Completed Modules

* Requirement Analysis
* System Design
* Architecture Planning
* React Frontend
* Express Backend
* MongoDB Integration
* Authentication Module
* GitHub OAuth Integration
* GitHub OAuth Session Handling
* JWT Authentication
* Protected Routes
* Complete Logout Flow
* Session Destruction
* Cookie Invalidation
* Code Submission Module
* Code Upload Module
* Server-side File Validation
* GitHub Code Loading Module
* Python AI Microservice
* Groq API Integration
* Llama 3.3 Integration
* AI Review Engine
* Bug Detection System
* Security Analysis
* Accessibility Analysis
* Code Quality Analysis
* Performance Analysis
* Severity Analysis
* Refactoring Suggestions
* Suggested Code Fixes
* Deterministic Scoring System
* AI Baseline Rule Files
* Prompt Injection Protection
* Diff Viewer
* Review Dashboard
* Profile Dashboard
* Profile Editing
* Dashboard Analytics
* Review History Storage
* Review Search and Filtering
* Review History Management
* Review Sharing Support
* Public Shared Review Page
* Public Review Sharing Verification
* MongoDB Review Persistence
* Validation and Error Handling Improvements
* Frontend Rendering Fixes

### Known Issues

* No major known issues currently remain after the latest fixes.
* Final testing is still required to confirm stable behavior across all modules before final evaluation.

### Planned Before Final Evaluation

* Perform comprehensive testing across all modules.
* Conduct final QA testing.
* Test authentication, logout, GitHub OAuth, review submission, profile dashboard, review history, and public sharing flows together.
* Verify frontend responsiveness across common screen sizes.
* Review environment configuration before deployment.
* Complete final documentation updates.
* Prepare final project demonstration.

---

## Technology Stack

### Frontend

* React.js
* Vite
* JavaScript
* HTML5
* CSS3
* React Router
* Axios

### Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT Authentication
* Passport.js
* GitHub OAuth

### AI Microservice

* Python
* FastAPI
* Groq API
* Llama 3.3 70B Versatile
* Baseline Rule Files
* Structured AI Prompting

### Development Tools

* Git
* GitHub
* Postman
* VS Code
* MongoDB Compass

---

## Project Status (Mid Evaluation)

| Module                      | Completion |
| --------------------------- | ---------- |
| Requirement Analysis        | 100%       |
| System Design               | 100%       |
| Frontend Development        | 98%        |
| Backend Development         | 98%        |
| Authentication              | 100%       |
| Logout Flow                 | 100%       |
| GitHub OAuth                | 98%        |
| AI Integration              | 100%       |
| Code Analysis Engine        | 98%        |
| Deterministic Scoring       | 100%       |
| AI Rule Context Integration | 95%        |
| Review Dashboard            | 95%        |
| Profile Dashboard           | 98%        |
| Profile Editing             | 95%        |
| Review History              | 98%        |
| Review Sharing              | 98%        |
| Server-side Validation      | 98%        |
| Testing & Optimization      | 90%        |

**Overall Project Completion: ~97%**
