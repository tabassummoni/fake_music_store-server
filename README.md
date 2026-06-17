```markdown
# 🖥️ Fake Music Store - Backend API (Task #5)

This is the server-side REST API for the Fake Music Store application. It handles advanced seed-based pseudo-random data generation with structural constraints to ensure total data integrity.

## 🛠️ Tech Stack
* **Runtime Environment:** Node.js
* **Backend Framework:** Express.js
* **Data Seed Engine:** `seedrandom`
* **Mock Data Utility:** `@faker-js/faker`
* **Cross-Origin Resource Sharing:** `cors`

## ✨ Core Algorithmic Features (Backend)
* **Hierarchical Seed Splitting:** Utilizes a core master seed to spawn isolated local random number generators (RNG) for metadata and reviews. 
* **Data Integrity Maintenance:** Guarantees that altering statistics (like the average likes slider) or pagination indexes never shifts or scrambles the pre-generated song titles or artist names.
* **Probabilistic Likes Logic:** Implements an algorithm capable of distributing average floating-point likes (e.g., 1.2) into clean integers proportionally across requested datasets.
* **Localization Support:** Dynamic object configuration that transitions mock text fields fluently between English (`en`) and German (`de`) locales.

## 🚀 How to Run Locally

1. Navigate to the server directory:
   Bash
   cd server

2. Install the necessary server packages:
Bash
npm install

3. Spin up the Node/Express server:
Bash
npm start

4. The local API server will activate and listen for incoming frontend requests at
http://localhost:5005.
