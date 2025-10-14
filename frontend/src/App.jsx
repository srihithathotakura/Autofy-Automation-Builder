import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./LandingPage";
import RequestDemo from "./RequestDemo";
import RequestTemplate from "./RequestTemplate";
import Login from "./Login";
import Register from "./Register";
import Dashboard from "./Dashboard";
import TeacherDashboard from "./TeacherDashboard";
import AdminDashboard from "./AdminDashboard";
import ExamScheduler from "./ExamScheduler";
import AssignmentSubmission from "./AssignmentSubmission";
import WorkflowWorkspace from "./WorkflowWorkspace";
import GoogleDrivePage from "./GoogleDrivePage";
import GoogleCalendarPage from "./GoogleCalendarPage";
import SlackPage from "./SlackPage";
import NotionPage from "./NotionPage";
import OutlookCalendarPage from "./OutlookCalendarPage";
import DropboxPage from "./DropboxPage";
import IntegrationSuccess from "./IntegrationSuccess";
import IntegrationError from "./IntegrationError";
import AuthSuccess from "./AuthSuccess";
import "./App.css";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/request-demo" element={<RequestDemo />} />
        <Route path="/request-template" element={<RequestTemplate />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/auth-success" element={<AuthSuccess />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/teacher-dashboard" element={<TeacherDashboard />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/exam-scheduler" element={<ExamScheduler />} />
        <Route path="/assignment-submission" element={<AssignmentSubmission />} />
        <Route path="/workspace" element={<WorkflowWorkspace />} />
        
        {/* Integration Pages */}
        <Route path="/integrations/google-drive" element={<GoogleDrivePage />} />
        <Route path="/integrations/google-calendar" element={<GoogleCalendarPage />} />
        <Route path="/integrations/slack" element={<SlackPage />} />
        <Route path="/integrations/notion" element={<NotionPage />} />
        <Route path="/integrations/microsoft-outlook" element={<OutlookCalendarPage />} />
        <Route path="/integrations/dropbox" element={<DropboxPage />} />
        
        {/* OAuth Callback Pages */}
        <Route path="/integrations/success" element={<IntegrationSuccess />} />
        <Route path="/integrations/error" element={<IntegrationError />} />
      </Routes>
    </Router>
  );
}
export default App;