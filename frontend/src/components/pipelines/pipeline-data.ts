import type {
  PipelineLead,
  PipelineView,
} from "../../types/Pipelines";

export const initialPipelineViews: PipelineView[] = [
  {
    id: "deals",
    name: "Deals",
    stages: [
      {
        id: "new",
        name: "New",
        color: "info",
        order: 0,
      },
      {
        id: "contacted",
        name: "Contacted",
        color: "brand",
        order: 1,
      },
      {
        id: "qualified",
        name: "Qualified",
        color: "warning",
        order: 2,
      },
      {
        id: "converted",
        name: "Converted",
        color: "success",
        order: 3,
      },
    ],
  },
  {
    id: "kyc",
    name: "KYC",
    stages: [
      {
        id: "kyc-pending",
        name: "Pending",
        color: "default",
        order: 0,
      },
      {
        id: "kyc-review",
        name: "Under Review",
        color: "warning",
        order: 1,
      },
      {
        id: "kyc-approved",
        name: "Approved",
        color: "success",
        order: 2,
      },
      {
        id: "kyc-rejected",
        name: "Rejected",
        color: "error",
        order: 3,
      },
    ],
  },
];

export const initialPipelineLeads: PipelineLead[] = [
  {
    id: "lead-1",
    viewId: "deals",
    stageId: "new",

    name: "Abram Schleifer",
    avatar: "/images/user/user-20.jpg",
    role: "Finance Manager",

    email: "abram@techinnov.com",
    phone: "+63 917 555 0123",

    company: "Tech Innov Inc.",
    source: "Manual",

    owner: {
      name: "Sarah Lim",
      avatar: "/images/user/user-21.jpg",
    },

    assignedTo: {
      name: "John Reyes",
      avatar: "/images/user/user-22.jpg",
    },

    progress: 20,
    dateCreated: "25 Apr, 2027",
    lastActivity: "1h ago",
    address:
      "18F Corporate Center, Ortigas Center, Pasig City, Metro Manila",
  },
  {
    id: "lead-2",
    viewId: "deals",
    stageId: "qualified",

    name: "Charlotte Anderson",
    avatar: "/images/user/user-23.jpg",
    role: "Business Owner",

    email: "charlotte@andersonholdings.com",
    phone: "+63 917 555 0182",

    company: "Anderson Holdings",
    source: "Organic",

    owner: {
      name: "Mark Santos",
      avatar: "/images/user/user-24.jpg",
    },

    assignedTo: {
      name: "Mia Cruz",
      avatar: "/images/user/user-25.jpg",
    },

    progress: 72,
    dateCreated: "12 Mar, 2025",
    lastActivity: "1d ago",
    address: "Makati Avenue, Makati City, Metro Manila",
  },
  {
    id: "lead-3",
    viewId: "deals",
    stageId: "contacted",

    name: "Ethan Brown",
    avatar: "/images/user/user-26.jpg",
    role: "Investor",

    email: "ethan@email.com",
    phone: "+63 917 555 0111",

    company: "Individual",
    source: "Outbound",

    owner: {
      name: "Ana Dela Cruz",
      avatar: "/images/user/user-27.jpg",
    },

    assignedTo: {
      name: "Sarah Lim",
      avatar: "/images/user/user-21.jpg",
    },

    progress: 45,
    dateCreated: "01 Jan, 2024",
    lastActivity: "18 Jul, 2026",
    address: "Quezon City, Metro Manila",
  },
  {
    id: "lead-4",
    viewId: "kyc",
    stageId: "kyc-pending",

    name: "Sophia Martinez",
    avatar: "/images/user/user-28.jpg",
    role: "Company Director",

    email: "sophia@martinezholdings.com",
    phone: "+63 917 555 0198",

    company: "Martinez Holdings",
    source: "Referral",

    owner: {
      name: "Sarah Lim",
      avatar: "/images/user/user-21.jpg",
    },

    assignedTo: {
      name: "Mia Cruz",
      avatar: "/images/user/user-25.jpg",
    },

    progress: 30,
    dateCreated: "15 Jun, 2026",
    lastActivity: "Today",
    address: "Bonifacio Global City, Taguig City, Metro Manila",
  },
];
