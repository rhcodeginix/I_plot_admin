import { createBrowserRouter, Navigate } from "react-router-dom";
import { Layout } from "./layouts";
import {
  AddAgentUserForm,
  AddBankUserForm,
  AddLeadForm,
  AddSuppliers,
  AddUsers,
  AITable,
  AllBankLeads,
  AllLeads,
  Bankleads,
  BankLeadsDetails,
  BankleadsTabs,
  ConstructedPlot,
  ConstructedPlotDetail,
  Dashboard,
  EditHouseModel,
  Events,
  Husleads,
  Husmodeller,
  Kombinasjoner,
  LeadsDetails,
  LeadTable,
  Login,
  MyLeads,
  MyLeadsDetail,
  PDFTable,
  Plot,
  PlotDetail,
  PPTTable,
  ProjectTable,
  PropertyDetail,
  SeHouseModel,
  Suppliers,
  UserDetail,
  UserManagement,
  Users,
} from "./pages";
import { AuthLayout } from "./layouts/AuthLayout";
import { StartupHandler } from "./layouts/StartupHandler";
import { ProtectedRoute } from "./layouts/ProtectedRoute";

export const routes = createBrowserRouter([
  {
    path: "/",
    element: <StartupHandler />,
    children: [
      {
        path: "/",
        element: <Navigate to="/login" replace />,
      },
      {
        path: "/",
        element: <AuthLayout />,
        children: [{ path: "login", element: <Login /> }],
      },
      {
        path: "/",
        element: <Layout />,
        children: [
          {
            path: "/dashboard",
            element: (
              <ProtectedRoute allowedRoles={["Agent", "Admin", "super-admin"]}>
                <Dashboard />
              </ProtectedRoute>
            ),
          },
          {
            path: "/Leverandorer",
            element: (
              <ProtectedRoute allowedRoles={["Agent", "Admin", "super-admin"]}>
                <Suppliers />
              </ProtectedRoute>
            ),
          },
          {
            path: "/legg-til-leverandor",
            element: (
              <ProtectedRoute allowedRoles={["Agent", "Admin", "super-admin"]}>
                <AddSuppliers />
              </ProtectedRoute>
            ),
          },
          {
            path: "/edit-til-leverandor/*",
            element: (
              <ProtectedRoute allowedRoles={["Agent", "Admin", "super-admin"]}>
                <AddSuppliers />
              </ProtectedRoute>
            ),
          },
          {
            path: "/Husmodeller",
            element: (
              <ProtectedRoute allowedRoles={["Agent", "Admin", "super-admin"]}>
                <Husmodeller />
              </ProtectedRoute>
            ),
          },
          {
            path: "/se-husmodell/*",
            element: (
              <ProtectedRoute allowedRoles={["Agent", "Admin", "super-admin"]}>
                <SeHouseModel />
              </ProtectedRoute>
            ),
          },
          {
            path: "/edit-husmodell/*",
            element: (
              <ProtectedRoute allowedRoles={["Agent", "Admin", "super-admin"]}>
                <EditHouseModel />
              </ProtectedRoute>
            ),
          },
          {
            path: "/add-husmodell",
            element: (
              <ProtectedRoute allowedRoles={["Agent", "Admin", "super-admin"]}>
                <EditHouseModel />
              </ProtectedRoute>
            ),
          },
          {
            path: "/plot",
            element: (
              <ProtectedRoute allowedRoles={["Agent", "Admin", "super-admin"]}>
                <Plot />
              </ProtectedRoute>
            ),
          },
          {
            path: "/se-plot/*",
            element: (
              <ProtectedRoute allowedRoles={["Agent", "Admin", "super-admin"]}>
                <PlotDetail />
              </ProtectedRoute>
            ),
          },
          {
            path: "/users",
            element: (
              <ProtectedRoute allowedRoles={["Agent", "Admin", "super-admin"]}>
                <Users />
              </ProtectedRoute>
            ),
          },
          {
            path: "/se-user/*",
            element: (
              <ProtectedRoute allowedRoles={["Agent", "Admin", "super-admin"]}>
                <UserDetail />
              </ProtectedRoute>
            ),
          },
          {
            path: "/property",
            element: (
              <ProtectedRoute allowedRoles={["Agent", "Admin", "super-admin"]}>
                <PropertyDetail />
              </ProtectedRoute>
            ),
          },
          {
            path: "/Brukeradministrasjon",
            element: (
              <ProtectedRoute allowedRoles={["Agent", "Admin", "super-admin"]}>
                <UserManagement />
              </ProtectedRoute>
            ),
          },
          {
            path: "/legg-user",
            element: (
              <ProtectedRoute allowedRoles={["Agent", "Admin", "super-admin"]}>
                <AddUsers />
              </ProtectedRoute>
            ),
          },
          {
            path: "/edit-user/*",
            element: (
              <ProtectedRoute allowedRoles={["Agent", "Admin", "super-admin"]}>
                <AddUsers />
              </ProtectedRoute>
            ),
          },
          {
            path: "/se-husleads",
            element: (
              <ProtectedRoute allowedRoles={["Agent", "Admin", "super-admin"]}>
                <Husleads />
              </ProtectedRoute>
            ),
          },
          {
            path: "/se-kombinasjoner",
            element: (
              <ProtectedRoute allowedRoles={["Agent", "Admin", "super-admin"]}>
                <Kombinasjoner />
              </ProtectedRoute>
            ),
          },
          {
            path: "/constructed-plot",
            element: (
              <ProtectedRoute allowedRoles={["Agent", "Admin", "super-admin"]}>
                <ConstructedPlot />
              </ProtectedRoute>
            ),
          },
          {
            path: "/se-constructed-plot/*",
            element: (
              <ProtectedRoute allowedRoles={["Agent", "Admin", "super-admin"]}>
                <ConstructedPlotDetail />,
              </ProtectedRoute>
            ),
          },
          {
            path: "/se-bankleads",
            element: (
              <ProtectedRoute allowedRoles={["Agent", "Admin", "super-admin"]}>
                <Bankleads />
              </ProtectedRoute>
            ),
          },
          {
            path: "/my-leads",
            element: (
              <ProtectedRoute allowedRoles={["Agent", "Admin", "super-admin"]}>
                <MyLeads />
              </ProtectedRoute>
            ),
          },
          {
            path: "/my-leads-details/*",
            element: (
              <ProtectedRoute allowedRoles={["Agent", "Admin", "super-admin"]}>
                <MyLeadsDetail />
              </ProtectedRoute>
            ),
          },
          {
            path: "/add-agent-leads",
            element: (
              <ProtectedRoute allowedRoles={["Agent", "Admin", "super-admin"]}>
                <BankleadsTabs />
              </ProtectedRoute>
            ),
          },
          {
            path: "/edit-agent-leads/*",
            element: (
              <ProtectedRoute allowedRoles={["Agent", "Admin", "super-admin"]}>
                <BankleadsTabs />
              </ProtectedRoute>
            ),
          },
          {
            path: "/agent-leads",
            element: (
              <ProtectedRoute allowedRoles={["Agent", "Admin", "super-admin"]}>
                <AllBankLeads />
              </ProtectedRoute>
            ),
          },
          {
            path: "/active-agent-leads",
            element: (
              <ProtectedRoute allowedRoles={["Agent", "Admin", "super-admin"]}>
                <AllBankLeads />
              </ProtectedRoute>
            ),
          },
          {
            path: "/agent-leads-detail/*",
            element: (
              <ProtectedRoute allowedRoles={["Agent", "Admin", "super-admin"]}>
                <BankLeadsDetails />
              </ProtectedRoute>
            ),
          },
          {
            path: "/add-bank-user",
            element: (
              <ProtectedRoute allowedRoles={["Agent", "Admin", "super-admin"]}>
                <AddBankUserForm />
              </ProtectedRoute>
            ),
          },
          {
            path: "/edit-bank-user/*",
            element: (
              <ProtectedRoute allowedRoles={["Agent", "Admin", "super-admin"]}>
                <AddBankUserForm />
              </ProtectedRoute>
            ),
          },
          {
            path: "/add-agent-user",
            element: (
              <ProtectedRoute allowedRoles={["Agent", "Admin", "super-admin"]}>
                <AddAgentUserForm />
              </ProtectedRoute>
            ),
          },
          {
            path: "/edit-agent-user/*",
            element: (
              <ProtectedRoute allowedRoles={["Agent", "Admin", "super-admin"]}>
                <AddAgentUserForm />
              </ProtectedRoute>
            ),
          },
          {
            path: "/add-lead",
            element: (
              <ProtectedRoute allowedRoles={["Agent", "Admin", "super-admin"]}>
                <AddLeadForm />
              </ProtectedRoute>
            ),
          },
          {
            path: "/events",
            element: (
              <ProtectedRoute allowedRoles={["Agent", "Admin", "super-admin"]}>
                <Events />
              </ProtectedRoute>
            ),
          },
          {
            path: "/events/projects",
            element: (
              <ProtectedRoute allowedRoles={["Agent", "Admin", "super-admin"]}>
                <ProjectTable />
              </ProtectedRoute>
            ),
          },
          {
            path: "/events/leads",
            element: (
              <ProtectedRoute allowedRoles={["Agent", "Admin", "super-admin"]}>
                <LeadTable />
              </ProtectedRoute>
            ),
          },
          {
            path: "/events/ai",
            element: (
              <ProtectedRoute allowedRoles={["Agent", "Admin", "super-admin"]}>
                <AITable />
              </ProtectedRoute>
            ),
          },
          {
            path: "/events/pdf",
            element: (
              <ProtectedRoute allowedRoles={["Agent", "Admin", "super-admin"]}>
                <PDFTable />
              </ProtectedRoute>
            ),
          },
          {
            path: "/events/ppt",
            element: (
              <ProtectedRoute allowedRoles={["Agent", "Admin", "super-admin"]}>
                <PPTTable />
              </ProtectedRoute>
            ),
          },

          // -----

          {
            path: "/bank-leads",
            element: (
              <ProtectedRoute allowedRoles={["Agent", "Bankansvarlig"]}>
                <AllLeads />
              </ProtectedRoute>
            ),
          },
          {
            path: "/active-bank-leads",
            element: (
              <ProtectedRoute allowedRoles={["Agent", "Bankansvarlig"]}>
                <AllLeads />
              </ProtectedRoute>
            ),
          },
          {
            path: "/bank-leads-detail/*",
            element: (
              <ProtectedRoute allowedRoles={["Agent", "Bankansvarlig"]}>
                <LeadsDetails />
              </ProtectedRoute>
            ),
          },
        ],
      },
    ],
  },
]);
