import { lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router";
//import Ecommerce from "./pages/Dashboard/Ecommerce";
import Stocks from "./pages/saved/Dashboard/Stocks";
import Crm from "./pages/saved/Dashboard/Crm";
import Marketing from "./pages/saved/Dashboard/Marketing";
import Analytics from "./pages/saved/Dashboard/Analytics";
import SignIn from "./pages/AuthPages/SignIn";
import NotFound from "./pages/saved/OtherPage/NotFound";
import UserProfiles from "./pages/saved/UserProfiles";
import Carousel from "./pages/saved/UiElements/Carousel";
import Maintenance from "./pages/saved/OtherPage/Maintenance";
import FiveZeroZero from "./pages/saved/OtherPage/FiveZeroZero";
import FiveZeroThree from "./pages/saved/OtherPage/FiveZeroThree";
import Videos from "./pages/saved/UiElements/Videos";
import Images from "./pages/saved/UiElements/Images";
import Alerts from "./pages/saved/UiElements/Alerts";
import Badges from "./pages/saved/UiElements/Badges";
import Pagination from "./pages/saved/UiElements/Pagination";
import Avatars from "./pages/saved/UiElements/Avatars";
import Buttons from "./pages/saved/UiElements/Buttons";
import ButtonsGroup from "./pages/saved/UiElements/ButtonsGroup";
import Notifications from "./pages/saved/UiElements/Notifications";
import LineChart from "./pages/saved/Charts/LineChart";
import BarChart from "./pages/saved/Charts/BarChart";
import PieChart from "./pages/saved/Charts/PieChart";
import RadarChart from "./pages/saved/Charts/RadarChart";
import RadialChart from "./pages/saved/Charts/RadialChart";
import Invoices from "./pages/saved/Invoices";
import ComingSoon from "./pages/saved/OtherPage/ComingSoon";
import FileManager from "./pages/saved/FileManager";
//import Calendar from "./pages/Calendar";
const Calendar = lazy(() => import("./pages/Calendar"));
import BasicTables from "./pages/saved/Tables/BasicTables";
import DataTables from "./pages/saved/Tables/DataTables";
import PricingTables from "./pages/saved/PricingTables";
import Faqs from "./pages/saved/Faqs";
import Chats from "./pages/saved/Chat/Chats";
import FormElements from "./pages/saved/Forms/FormElements";
import FormLayout from "./pages/saved/Forms/FormLayout";
import Blank from "./pages/saved/Blank";
//import EmailInbox from "./pages/Email/EmailInbox";
import EmailDetails from "./pages/saved/Email/EmailDetails";
import TaskKanban from "./pages/saved/Task/TaskKanban";
import BreadCrumb from "./pages/saved/UiElements/BreadCrumb";
import Cards from "./pages/saved/UiElements/Cards";
import Dropdowns from "./pages/saved/UiElements/Dropdowns";
import Links from "./pages/saved/UiElements/Links";
import Lists from "./pages/saved/UiElements/Lists";
import Popovers from "./pages/saved/UiElements/Popovers";
import Progressbar from "./pages/saved/UiElements/Progressbar";
import Ribbons from "./pages/saved/UiElements/Ribbons";
import Spinners from "./pages/saved/UiElements/Spinners";
import Tabs from "./pages/saved/UiElements/Tabs";
import Tooltips from "./pages/saved/UiElements/Tooltips";
import Modals from "./pages/saved/UiElements/Modals";
import ResetPassword from "./pages/AuthPages/ResetPassword";
import TwoStepVerification from "./pages/AuthPages/TwoStepVerification";
import Success from "./pages/saved/OtherPage/Success";
import AppLayout from "./layout/saved/AppLayout";
import AlternativeLayout from "./layout/AlternativeLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import TaskList from "./pages/saved/Task/TaskList";
import Saas from "./pages/saved/Dashboard/Saas";
import Logistics from "./pages/saved/Dashboard/Logistics";
import VideoGeneratorPage from "./pages/saved/Ai/Video/VideoGenerator";
import ProductList from "./pages/saved/Ecommerce/ProductList";
import AddProduct from "./pages/saved/Ecommerce/AddProduct";
import Billing from "./pages/saved/Ecommerce/Billing";
import SingleInvoice from "./pages/saved/Ecommerce/SingleInvoice";
import CreateInvoice from "./pages/saved/Ecommerce/CreateInvoice";
import Transactions from "./pages/saved/Ecommerce/Transactions";
import SingleTransaction from "./pages/saved/Ecommerce/SingleTransaction";
import TicketList from "./pages/saved/Support/TicketList";
import TicketReply from "./pages/saved/Support/TicketReply";
import Integrations from "./pages/saved/OtherPage/Integrations";
import ApiKeys from "./pages/saved/OtherPage/ApiKeys";
import SalesDashboard from "./pages/saved/Dashboard/Sales";
import AIDashboard from "./pages/saved/Dashboard/AIDashboard";
import LayoutSix from "./pages/saved/Layouts/LayoutSix";
import LayoutFive from "./pages/saved/Layouts/LayoutFive";
import LayoutFour from "./pages/saved/Layouts/LayoutFour";
import LayoutThree from "./pages/saved/Layouts/LayoutThree";
import LayoutTwo from "./pages/saved/Layouts/LayoutTwo";
import LayoutOne from "./pages/saved/Layouts/LayoutOne";
import FinanceDashboard from "./pages/saved/Dashboard/Finance";
import AiSettings from "./pages/saved/Ai/AiSettings";
import Maps from "./pages/saved/Maps/Maps";
import VectorMap from "./pages/saved/Maps/VectorMap";
import TextGeneratorPage from "./pages/saved/Ai/Text/TextGenerator";
import ImageGeneratorPage from "./pages/saved/Ai/Image/ImageGenerator";
import CodeGeneratorPage from "./pages/saved/Ai/Code/CodeGenerator";
import CrmLayout from "./layout/CrmLayout";
const Dashboard = lazy(() => import("./pages/CrmDashboard/Dashboard"));
const Tasks = lazy(() => import("./pages/Tasks"));
//import Inbox from "./pages/CrmInbox/Inbox";
const Leads = lazy(() => import("./pages/Leads"));
const Companies = lazy(() => import("./pages/Companies"));
const Contacts = lazy(() => import("./pages/Contacts"));
const Pipelines = lazy(() => import("./pages/Pipelines"));
const Notes = lazy(() => import("./pages/Notes"));
const Activities = lazy(() => import("./pages/Activities"));
const BrokerageAccounts = lazy(() => import("./pages/BrokerageAccounts"));
const Compliance = lazy(() => import("./pages/Compliance"));
import ProtectedRoute from "./components/auth/ProtectedRoute";
import PermissionRoute from "./components/auth/PermissionRoute";
import Unauthorized from "./pages/saved/OtherPage/Unauthorized";
const AccessControl = lazy(() => import("./pages/AccessControl"));
import PageLoadingSkeleton from "./components/common/PageLoadingSkeleton";

export default function App() {
  return (
    <>
      <Router>
        <ScrollToTop />
        <Suspense fallback={<PageLoadingSkeleton />}>
        <Routes>
          <Route path="/" element={<Navigate to="/signin" replace />} />
          <Route
            element={
              <ProtectedRoute requireCrmAccess>
                <CrmLayout />
              </ProtectedRoute>
            }
          >
            <Route
              path="/dashboard"
              element={
                <PermissionRoute permission="dashboard.read">
                  <Dashboard />
                </PermissionRoute>
              }
            />
            <Route
              path="/calendar"
              element={
                <PermissionRoute permission="calendar.read">
                  <Calendar />
                </PermissionRoute>
              }
            />
            <Route
              path="/contacts"
              element={
                <PermissionRoute permission="contacts.read">
                  <Contacts />
                </PermissionRoute>
              }
            />
            <Route
              path="/tasks"
              element={
                <PermissionRoute permission="tasks.read">
                  <Tasks />
                </PermissionRoute>
              }
            />
            <Route
              path="/notes"
              element={
                <PermissionRoute permission="notes.read">
                  <Notes />
                </PermissionRoute>
              }
            />
            {/*<Route path="/inbox" element={<Inbox />} />*/}
            <Route
              path="/leads"
              element={
                <PermissionRoute permission="leads.read">
                  <Leads />
                </PermissionRoute>
              }
            />
            <Route
              path="/companies"
              element={
                <PermissionRoute permission="companies.read">
                  <Companies />
                </PermissionRoute>
              }
            />
            <Route
              path="/pipelines"
              element={
                <PermissionRoute permission="leads.read">
                  <Pipelines />
                </PermissionRoute>
              }
            />
            <Route
              path="/activities"
              element={
                <PermissionRoute permission="activities.read">
                  <Activities />
                </PermissionRoute>
              }
            />
            <Route
              path="/access-control"
              element={
                <PermissionRoute permission="access.manage">
                  <AccessControl />
                </PermissionRoute>
              }
            />
            <Route
              path="/brokerage-accounts"
              element={
                <PermissionRoute permission="brokerageAccounts.read">
                  <BrokerageAccounts />
                </PermissionRoute>
              }
            />
            <Route
              path="/compliance"
              element={
                <PermissionRoute permission="compliance.read">
                  <Compliance />
                </PermissionRoute>
              }
            />
          </Route>

          {/* Dashboard Layout */}
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            {/*<Route index path="/" element={<Ecommerce />} />*/}
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/marketing" element={<Marketing />} />
            <Route path="/crm" element={<Crm />} />
            <Route path="/stocks" element={<Stocks />} />
            <Route path="/saas" element={<Saas />} />
            <Route path="/logistics" element={<Logistics />} />
            <Route path="/sales" element={<SalesDashboard />} />
            <Route path="/ai" element={<AIDashboard />} />
            <Route path="/finance" element={<FinanceDashboard />} />

            {/*<Route path="/calendar" element={<Calendar />} />*/}
            <Route path="/invoice" element={<Invoices />} />
            <Route path="/invoices" element={<Invoices />} />
            <Route path="/chat" element={<Chats />} />
            <Route path="/file-manager" element={<FileManager />} />

            {/* E-commerce */}
            <Route path="/products-list" element={<ProductList />} />
            <Route path="/add-product" element={<AddProduct />} />
            <Route path="/billing" element={<Billing />} />
            <Route path="/single-invoice" element={<SingleInvoice />} />
            <Route path="/create-invoice" element={<CreateInvoice />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/single-transaction" element={<SingleTransaction />} />

            {/* Support */}
            <Route path="/support-tickets" element={<TicketList />} />
            <Route path="/support-ticket-reply" element={<TicketReply />} />

            {/* Others Page */}
            <Route path="/profile" element={<UserProfiles />} />
            <Route path="/faq" element={<Faqs />} />
            <Route path="/pricing-tables" element={<PricingTables />} />
            <Route path="/integrations" element={<Integrations />} />
            <Route path="/api-keys" element={<ApiKeys />} />
            <Route path="/blank" element={<Blank />} />

            {/* Forms */}
            <Route path="/form-elements" element={<FormElements />} />
            <Route path="/form-layout" element={<FormLayout />} />

            {/* Applications */}
            <Route path="/task-list" element={<TaskList />} />
            <Route path="/task-kanban" element={<TaskKanban />} />

            {/* Email */}
            {/* <Route path="/inbox" element={<EmailInbox />} /> */}
            <Route path="/inbox-details" element={<EmailDetails />} />

            {/* Tables */}
            <Route path="/basic-tables" element={<BasicTables />} />
            <Route path="/data-tables" element={<DataTables />} />

            {/* Ui Elements */}
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/avatars" element={<Avatars />} />
            <Route path="/badge" element={<Badges />} />
            <Route path="/breadcrumb" element={<BreadCrumb />} />
            <Route path="/buttons" element={<Buttons />} />
            <Route path="/buttons-group" element={<ButtonsGroup />} />
            <Route path="/cards" element={<Cards />} />
            <Route path="/carousel" element={<Carousel />} />
            <Route path="/dropdowns" element={<Dropdowns />} />
            <Route path="/images" element={<Images />} />
            <Route path="/links" element={<Links />} />
            <Route path="/list" element={<Lists />} />
            <Route path="/modals" element={<Modals />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/pagination" element={<Pagination />} />
            <Route path="/popovers" element={<Popovers />} />
            <Route path="/progress-bar" element={<Progressbar />} />
            <Route path="/ribbons" element={<Ribbons />} />
            <Route path="/spinners" element={<Spinners />} />
            <Route path="/tabs" element={<Tabs />} />
            <Route path="/tooltips" element={<Tooltips />} />
            <Route path="/videos" element={<Videos />} />

            {/* Charts */}
            <Route path="/line-chart" element={<LineChart />} />
            <Route path="/bar-chart" element={<BarChart />} />
            <Route path="/pie-chart" element={<PieChart />} />
            <Route path="/radar-chart" element={<RadarChart />} />
            <Route path="/radial-chart" element={<RadialChart />} />

            {/* Maps */}
            <Route path="/maps" element={<Maps />} />
            <Route path="/vector-map" element={<VectorMap />} />
          </Route>

          {/* Alternative Layout - for special pages */}
          <Route
            element={
              <ProtectedRoute>
                <AlternativeLayout />
              </ProtectedRoute>
            }
          >
            {/* AI Generator */}
            <Route path="/text-generator" element={<TextGeneratorPage />} />
            <Route path="/image-generator" element={<ImageGeneratorPage />} />
            <Route path="/code-generator" element={<CodeGeneratorPage />} />
            <Route path="/video-generator" element={<VideoGeneratorPage />} />
            <Route path="/ai-settings" element={<AiSettings />} />
          </Route>

          {/* Auth Layout */}
          <Route path="/signin" element={<SignIn />} />
          {/* <Route path="/signup" element={<SignUp />} /> */}
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route
            path="/two-step-verification"
            element={<TwoStepVerification />}
          />

          {/* Layouts */}
          <Route
            path="/layout-one"
            element={
              <ProtectedRoute>
                <LayoutOne />
              </ProtectedRoute>
            }
          />
          <Route
            path="/layout-two"
            element={
              <ProtectedRoute>
                <LayoutTwo />
              </ProtectedRoute>
            }
          />
          <Route
            path="/layout-three"
            element={
              <ProtectedRoute>
                <LayoutThree />
              </ProtectedRoute>
            }
          />
          <Route
            path="/layout-four"
            element={
              <ProtectedRoute>
                <LayoutFour />
              </ProtectedRoute>
            }
          />
          <Route
            path="/layout-five"
            element={
              <ProtectedRoute>
                <LayoutFive />
              </ProtectedRoute>
            }
          />
          <Route
            path="/layout-six"
            element={
              <ProtectedRoute>
                <LayoutSix />
              </ProtectedRoute>
            }
          />

          {/* Fallback Route */}
          <Route path="*" element={<NotFound />} />
          <Route path="/maintenance" element={<Maintenance />} />
          <Route path="/success" element={<Success />} />
          <Route path="/five-zero-zero" element={<FiveZeroZero />} />
          <Route path="/five-zero-three" element={<FiveZeroThree />} />
          <Route path="/coming-soon" element={<ComingSoon />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
        </Routes>
        </Suspense>
      </Router>
    </>
  );
}
