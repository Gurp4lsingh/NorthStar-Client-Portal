import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// ES module __dirname replacement (for controllers folder)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataPath = path.join(__dirname, "..", "data", "clients.json");

const loadClients = () => {
  const raw = fs.readFileSync(dataPath, "utf-8");
  const parsed = JSON.parse(raw);
  return Array.isArray(parsed) ? parsed : [];
};

const saveClients = (clients) => {
  fs.writeFileSync(dataPath, `${JSON.stringify(clients, null, 2)}\n`, "utf-8");
};

const findClientById = (clients, id) =>
  clients.find((client) => String(client.id) === String(id));

const findClientIndexById = (clients, id) =>
  clients.findIndex((client) => String(client.id) === String(id));

const nextClientId = (clients) => {
  if (!clients.length) return 1;

  return (
    clients.reduce((maxId, client) => {
      const currentId = Number(client.id);
      return Number.isFinite(currentId) && currentId > maxId ? currentId : maxId;
    }, 0) + 1
  );
};

const normalizeRiskCategory = (riskCategory) => {
  const normalized = String(riskCategory || "").trim().toLowerCase();
  if (normalized === "high") return "High";
  if (normalized === "medium") return "Medium";
  if (normalized === "low") return "Low";
  return "";
};

const isValidIsoDate = (dateValue) => /^\d{4}-\d{2}-\d{2}$/.test(String(dateValue || "").trim());

const validateClientPayload = (payload, { isCreate = false } = {}) => {
  const fullName = String(payload.fullName || "").trim();
  const email = String(payload.email || "").trim();
  const riskCategory = normalizeRiskCategory(payload.riskCategory);
  const createdDate = String(payload.createdDate || "").trim() || new Date().toISOString().slice(0, 10);

  const errors = [];

  if (!fullName) {
    errors.push("Full name is required.");
  }

  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    errors.push("A valid email address is required.");
  }

  if (!riskCategory) {
    errors.push("Risk category must be Low, Medium, or High.");
  }

  if (!isValidIsoDate(createdDate)) {
    errors.push("Created date must be in YYYY-MM-DD format.");
  }

  return {
    errors,
    client: {
      fullName,
      email,
      riskCategory,
      createdDate
    },
    isCreate
  };
};

const renderNotFoundPage = (res, id) =>
  res.status(404).render("pages/home", {
    pageTitle: "Client Not Found",
    message: `No client record found for id: ${id}`,
    now: new Date().toLocaleString()
  });

// SSR: Home
export const renderHome = (req, res) => {
  res.render("pages/home", {
    pageTitle: "Home",
    message:
      "This portal demonstrates dynamic server-side rendering using EJS layouts and partials. JSON APIs are available for an AngularJS frontend that will be added later.",
    now: new Date().toLocaleString()
  });
};

// SSR: Clients list
export const renderClientsList = (req, res) => {
  const clients = loadClients();

  res.render("pages/clients", {
    pageTitle: "Clients",
    clients,
    totalClients: clients.length,
    now: new Date().toLocaleString()
  });
};

// SSR: Client details
export const renderClientDetails = (req, res) => {
  const clients = loadClients();
  const client = findClientById(clients, req.params.id);

  if (!client) {
    return renderNotFoundPage(res, req.params.id);
  }

  return res.render("pages/clientDetails", {
    pageTitle: "Client Profile",
    client,
    now: new Date().toLocaleString()
  });
};

// SSR: Create client form
export const renderClientCreateForm = (req, res) => {
  res.render("pages/clientCreate", {
    pageTitle: "Create Client",
    formData: {
      fullName: "",
      email: "",
      riskCategory: "Low",
      createdDate: new Date().toISOString().slice(0, 10)
    },
    errors: [],
    now: new Date().toLocaleString()
  });
};

// SSR: Create client submission
export const handleClientCreate = (req, res) => {
  const clients = loadClients();
  const { errors, client } = validateClientPayload(req.body, { isCreate: true });

  if (errors.length) {
    return res.status(400).render("pages/clientCreate", {
      pageTitle: "Create Client",
      formData: {
        fullName: req.body.fullName || "",
        email: req.body.email || "",
        riskCategory: req.body.riskCategory || "",
        createdDate: req.body.createdDate || ""
      },
      errors,
      now: new Date().toLocaleString()
    });
  }

  const newClient = {
    id: nextClientId(clients),
    ...client
  };

  clients.push(newClient);
  saveClients(clients);

  return res.redirect(`/clients/${newClient.id}`);
};

// SSR: Update form
export const renderClientUpdateForm = (req, res) => {
  const clients = loadClients();
  const client = findClientById(clients, req.params.id);

  if (!client) {
    return renderNotFoundPage(res, req.params.id);
  }

  return res.render("pages/clientEdit", {
    pageTitle: "Update Client",
    client,
    formData: client,
    errors: [],
    now: new Date().toLocaleString()
  });
};

// SSR: Update submission
export const handleClientUpdate = (req, res) => {
  const clients = loadClients();
  const clientIndex = findClientIndexById(clients, req.params.id);

  if (clientIndex === -1) {
    return renderNotFoundPage(res, req.params.id);
  }

  const existingClient = clients[clientIndex];
  const { errors, client } = validateClientPayload(req.body);

  if (errors.length) {
    return res.status(400).render("pages/clientEdit", {
      pageTitle: "Update Client",
      client: existingClient,
      formData: {
        fullName: req.body.fullName || "",
        email: req.body.email || "",
        riskCategory: req.body.riskCategory || "",
        createdDate: req.body.createdDate || ""
      },
      errors,
      now: new Date().toLocaleString()
    });
  }

  clients[clientIndex] = {
    ...existingClient,
    ...client
  };

  saveClients(clients);
  return res.redirect(`/clients/${existingClient.id}`);
};

// SSR: Delete confirmation
export const renderClientDeleteConfirm = (req, res) => {
  const clients = loadClients();
  const client = findClientById(clients, req.params.id);

  if (!client) {
    return renderNotFoundPage(res, req.params.id);
  }

  return res.render("pages/clientDelete", {
    pageTitle: "Delete Client",
    client,
    now: new Date().toLocaleString()
  });
};

// SSR: Delete submission
export const handleClientDelete = (req, res) => {
  const clients = loadClients();
  const clientIndex = findClientIndexById(clients, req.params.id);

  if (clientIndex === -1) {
    return renderNotFoundPage(res, req.params.id);
  }

  clients.splice(clientIndex, 1);
  saveClients(clients);

  return res.redirect("/clients");
};

// API: all clients
export const apiGetClients = (req, res) => {
  const clients = loadClients();
  return res.json({ total: clients.length, clients });
};

// API: client by id
export const apiGetClientById = (req, res) => {
  const clients = loadClients();
  const client = findClientById(clients, req.params.id);

  if (!client) {
    return res.status(404).json({ error: "Client Not Found", id: req.params.id });
  }

  return res.json({ client });
};

// API: create client
export const apiCreateClient = (req, res) => {
  const clients = loadClients();
  const { errors, client } = validateClientPayload(req.body, { isCreate: true });

  if (errors.length) {
    return res.status(400).json({ error: "Validation Error", details: errors });
  }

  const newClient = {
    id: nextClientId(clients),
    ...client
  };

  clients.push(newClient);
  saveClients(clients);

  return res.status(201).json({ message: "Client created", client: newClient });
};

// API: update client
export const apiUpdateClient = (req, res) => {
  const clients = loadClients();
  const clientIndex = findClientIndexById(clients, req.params.id);

  if (clientIndex === -1) {
    return res.status(404).json({ error: "Client Not Found", id: req.params.id });
  }

  const { errors, client } = validateClientPayload(req.body);

  if (errors.length) {
    return res.status(400).json({ error: "Validation Error", details: errors });
  }

  const updatedClient = {
    ...clients[clientIndex],
    ...client
  };

  clients[clientIndex] = updatedClient;
  saveClients(clients);

  return res.json({ message: "Client updated", client: updatedClient });
};

// API: delete client
export const apiDeleteClient = (req, res) => {
  const clients = loadClients();
  const clientIndex = findClientIndexById(clients, req.params.id);

  if (clientIndex === -1) {
    return res.status(404).json({ error: "Client Not Found", id: req.params.id });
  }

  const [deletedClient] = clients.splice(clientIndex, 1);
  saveClients(clients);

  return res.json({ message: "Client deleted", client: deletedClient });
};
