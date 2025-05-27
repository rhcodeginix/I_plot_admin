import { createBrowserRouter, Navigate } from "react-router-dom";
import { Layout } from "./layouts";
import {
  AddAgentUserForm,
  AddBankUserForm,
  AddSuppliers,
  AddUsers,
  AllBankLeads,
  AllLeads,
  Bankleads,
  BankLeadsDetails,
  BankleadsTabs,
  ConstructedPlot,
  ConstructedPlotDetail,
  Dashboard,
  EditHouseModel,
  Husleads,
  Husmodeller,
  Kombinasjoner,
  LeadsDetails,
  Login,
  MyLeads,
  MyLeadsDetail,
  Plot,
  PlotDetail,
  PropertyDetail,
  SeHouseModel,
  Suppliers,
  UserDetail,
  UserManagement,
  Users,
} from "./pages";
import { AuthLayout } from "./layouts/AuthLayout";

export const routes = createBrowserRouter([
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
      { path: "/dashboard", element: <Dashboard /> },
      { path: "/Leverandorer", element: <Suppliers /> },
      { path: "/legg-til-leverandor", element: <AddSuppliers /> },
      { path: "/edit-til-leverandor/*", element: <AddSuppliers /> },
      { path: "/Husmodeller", element: <Husmodeller /> },
      { path: "/se-husmodell/*", element: <SeHouseModel /> },
      { path: "/edit-husmodell/*", element: <EditHouseModel /> },
      { path: "/add-husmodell", element: <EditHouseModel /> },
      { path: "/plot", element: <Plot /> },
      { path: "/se-plot/*", element: <PlotDetail /> },
      { path: "/users", element: <Users /> },
      { path: "/se-user/*", element: <UserDetail /> },
      { path: "/property", element: <PropertyDetail /> },
      { path: "/Brukeradministrasjon", element: <UserManagement /> },
      { path: "/legg-user", element: <AddUsers /> },
      { path: "/edit-user/*", element: <AddUsers /> },
      { path: "/se-husleads", element: <Husleads /> },
      { path: "/se-kombinasjoner", element: <Kombinasjoner /> },
      { path: "/constructed-plot", element: <ConstructedPlot /> },
      { path: "/se-constructed-plot/*", element: <ConstructedPlotDetail /> },
      { path: "/se-bankleads", element: <Bankleads /> },
      { path: "/my-leads", element: <MyLeads /> },
      { path: "/my-leads-details/*", element: <MyLeadsDetail /> },
      { path: "/add-agent-leads", element: <BankleadsTabs /> },
      { path: "/edit-agent-leads/*", element: <BankleadsTabs /> },
      { path: "/agent-leads", element: <AllBankLeads /> },
      { path: "/active-agent-leads", element: <AllBankLeads /> },
      { path: "/agent-leads-detail/*", element: <BankLeadsDetails /> },
      { path: "/bank-leads", element: <AllLeads /> },
      { path: "/active-bank-leads", element: <AllLeads /> },
      { path: "/bank-leads-detail/*", element: <LeadsDetails /> },
      { path: "/add-bank-user", element: <AddBankUserForm /> },
      { path: "/edit-bank-user/*", element: <AddBankUserForm /> },
      { path: "/add-agent-user", element: <AddAgentUserForm /> },
      { path: "/edit-agent-user/*", element: <AddAgentUserForm /> },
    ],
  },
]);

// import React, { useEffect, useState } from "react";
// import {
//   createBrowserRouter,
//   RouterProvider,
//   Navigate,
// } from "react-router-dom";
// import { Layout } from "./layouts";
// import { AuthLayout } from "./layouts/AuthLayout";
// import {
//   AddSuppliers,
//   AddUsers,
//   AllBankLeads,
//   AllLeads,
//   Bankleads,
//   BankLeadsDetails,
//   BankleadsTabs,
//   ConstructedPlot,
//   ConstructedPlotDetail,
//   Dashboard,
//   EditHouseModel,
//   Husleads,
//   Husmodeller,
//   Kombinasjoner,
//   LeadsDetails,
//   Login,
//   MyLeads,
//   MyLeadsDetail,
//   Plot,
//   PlotDetail,
//   PropertyDetail,
//   SeHouseModel,
//   Suppliers,
//   UserDetail,
//   UserManagement,
//   Users,
// } from "./pages";
// import { fetchAdminDataByEmail } from "./lib/utils";

// const AppRouter = () => {
//   const [role, setRole] = useState<string | null>(null);

//   useEffect(() => {
//     const fetchData = async () => {
//       const data = await fetchAdminDataByEmail();
//       setRole(data?.role || null);
//     };

//     fetchData();
//   }, []);

//   return role;
// };

// const commonRoutes = [
//   { path: "/", element: <Navigate to="/login" replace /> },
//   {
//     path: "/",
//     element: <AuthLayout />,
//     children: [{ path: "login", element: <Login /> }],
//   },
// ];

// const bankRoutes = [
//   { path: "/bank-leads", element: <AllLeads /> },
//   { path: "/active-bank-leads", element: <AllLeads /> },
//   { path: "/bank-leads-detail/*", element: <LeadsDetails /> },
// ];

// const fullRoutes = [
//   { path: "/dashboard", element: <Dashboard /> },
//   { path: "/Leverandorer", element: <Suppliers /> },
//   { path: "/legg-til-leverandor", element: <AddSuppliers /> },
//   { path: "/edit-til-leverandor/*", element: <AddSuppliers /> },
//   { path: "/Husmodeller", element: <Husmodeller /> },
//   { path: "/se-husmodell/*", element: <SeHouseModel /> },
//   { path: "/edit-husmodell/*", element: <EditHouseModel /> },
//   { path: "/add-husmodell", element: <EditHouseModel /> },
//   { path: "/plot", element: <Plot /> },
//   { path: "/se-plot/*", element: <PlotDetail /> },
//   { path: "/users", element: <Users /> },
//   { path: "/se-user/*", element: <UserDetail /> },
//   { path: "/property", element: <PropertyDetail /> },
//   { path: "/Brukeradministrasjon", element: <UserManagement /> },
//   { path: "/legg-user", element: <AddUsers /> },
//   { path: "/edit-user/*", element: <AddUsers /> },
//   { path: "/se-husleads", element: <Husleads /> },
//   { path: "/se-kombinasjoner", element: <Kombinasjoner /> },
//   { path: "/constructed-plot", element: <ConstructedPlot /> },
//   { path: "/se-constructed-plot/*", element: <ConstructedPlotDetail /> },
//   { path: "/se-bankleads", element: <Bankleads /> },
//   { path: "/my-leads", element: <MyLeads /> },
//   { path: "/my-leads-details/*", element: <MyLeadsDetail /> },
//   { path: "/add-agent-leads", element: <BankleadsTabs /> },
//   { path: "/edit-agent-leads/*", element: <BankleadsTabs /> },
//   { path: "/agent-leads", element: <AllBankLeads /> },
//   { path: "/active-agent-leads", element: <AllBankLeads /> },
//   { path: "/agent-leads-detail/*", element: <BankLeadsDetails /> },
// ];

// export const routes = createBrowserRouter([
//   ...commonRoutes,
//   {
//     path: "/",
//     element: <Layout />,
//     children: "role" === "Bankansvarlig" ? bankRoutes : fullRoutes,
//   },
// ]);
