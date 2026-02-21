# NorthStar Client Portal (Backend)

## Project Overview
NorthStar Client Portal is an Express.js + EJS server-rendered application for managing North Star Advisory clients.
It provides:
- Server-side rendered pages using EJS layouts and partials
- Full Client CRUD operations (Create, Retrieve, Update, Delete)
- JSON API endpoints for future frontend integration
- File-based dataset persistence using `data/clients.json`

## Project Structure
```text
backend/
  app.js
  package.json
  package-lock.json
  controllers/
    clientController.js
  routes/
    clientRoutes.js
  data/
    clients.json
  public/
    css/
      styles.css
    images/
      .gitkeep
  views/
    layouts/
      main.ejs
    partials/
      header.ejs
      navigation.ejs
      footer.ejs
    pages/
      home.ejs
      clients.ejs
      clientDetails.ejs
      clientCreate.ejs
      clientEdit.ejs
      clientDelete.ejs
      notFound.ejs
```

## Dependencies
Declared in `package.json`:
- `express`
- `ejs`
- `express-ejs-layouts`

## Installation Instructions
1. Open terminal.
2. Navigate to backend folder:
   ```powershell
   cd "c:\Users\singh\Downloads\NorthStar Client Portal\NorthStar Client Portal\backend"
   ```
3. Install dependencies:
   ```powershell
   npm install
   ```

## Application Startup Instructions
1. Start the server:
   ```powershell
   npm start
   ```
2. Open in browser:
   - `http://localhost:3000`

If port `3000` is already in use, run on another port:
```powershell
$env:PORT=3001
npm start
```
Then open `http://localhost:3001`.

## Implemented Routes

### SSR Routes
- `GET /` - Home page
- `GET /clients` - List all clients
- `GET /clients/new` - Create client form
- `POST /clients` - Create client
- `GET /clients/:id` - Client details
- `GET /clients/:id/edit` - Update form
- `POST /clients/:id/edit` - Update client
- `GET /clients/:id/delete` - Delete confirmation
- `POST /clients/:id/delete` - Delete client

### API Routes
- `GET /api/clients` - Get all clients
- `GET /api/clients/:id` - Get one client by id
- `POST /api/clients` - Create client
- `PUT /api/clients/:id` - Update client
- `DELETE /api/clients/:id` - Delete client

## Operational Dataset
- Dataset file: `data/clients.json`
- Used for dynamic rendering in SSR pages and for API responses
- Updated automatically for create, update, and delete operations
