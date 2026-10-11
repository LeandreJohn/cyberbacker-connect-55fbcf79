import type {
  ActivityItem,
  Announcement,
  Article,
  AttendanceEntry,
  AuditEntry,
  Candidate,
  ClientAccount,
  Contract,
  CurrentUser,
  Cyberbacker,
  FunnelStep,
  GrowthPoint,
  Invoice,
  KbCategory,
  KpiStat,
  Notification,
  PaymentMethod,
  PerformancePoint,
  PipelineCandidate,
  Renewal,
  RevenuePoint,
  Reward,
  RetentionPoint,
  SystemUser,
  TalentProfile,
  Ticket,
  TicketVolumePoint,
} from "./types";

export const currentUser: CurrentUser = {
  id: "u_001",
  name: "Jordan Avery",
  email: "jordan.avery@brightpath.co",
  role: "Client",
  company: "BrightPath Ventures",
  initials: "JA",
};

const leandreProfile = {
  nationality: "Filipino",
  languages: ["English", "Filipino"],
  education: { level: "Bachelor's degree", school: "De La Salle Araneta University", location: "Philippines", graduation: "2022", degree: "BS Computer Science" },
  preferredIndustry: "Technology & SaaS",
  preferredRoles: ["Software Backer", "Web Developer", "DevOps Backend Engineer"],
  availability: "Immediately available",
  engagement: "Full-time",
  experience: [
    { title: "Full Stack Web Developer", employer: "Technology Services Company", location: "Philippines", start: "2023", end: "Present", summary: "Builds and maintains responsive web applications, reusable interfaces, APIs, and cloud deployment workflows." },
    { title: "Web Developer", employer: "Digital Solutions Studio", location: "Philippines", start: "2021", end: "2023", summary: "Delivered business websites and internal tools while collaborating with design and operations teams." },
  ],
  coreSkills: [
    { category: "Software Development", name: "Frontend Development", proficiency: "Expert" as const },
    { category: "Software Development", name: "Backend Development", proficiency: "Proficient" as const },
    { category: "Software Development", name: "API Integration", proficiency: "Proficient" as const },
    { category: "Operations", name: "Technical Documentation", proficiency: "Expert" as const },
    { category: "Collaboration", name: "Cross-functional Communication", proficiency: "Proficient" as const },
    { category: "Quality", name: "Testing & Debugging", proficiency: "Expert" as const },
  ],
  tools: [
    { name: "React", proficiency: "Expert" as const }, { name: "TypeScript", proficiency: "Expert" as const },
    { name: "Node.js", proficiency: "Proficient" as const }, { name: "PostgreSQL", proficiency: "Proficient" as const },
    { name: "GitHub", proficiency: "Expert" as const }, { name: "Docker", proficiency: "Intermediate" as const },
  ],
  portfolio: ["Client Success Dashboard", "Recruitment Workflow Platform", "Business Operations Portal"],
  certifications: [{ title: "Full Stack Web Development", organization: "Professional Training Program", completed: "2023" }],
  workSetup: { primaryDevice: "Windows workstation", secondaryDevice: "Laptop", webcam: true, headset: true, primaryIsp: "Fiber connection", backupIsp: "Mobile hotspot", cpu: "Intel Core i7", ram: "16 GB", storage: "512 GB SSD" },
  valuesBreakdown: { Excellence: 94, Reliability: 96, Teamwork: 91, Initiative: 95 },
  disc: { Dominance: 72, Influence: 68, Steadiness: 81, Conscientiousness: 92 },
};

const standardWorkSetup = {
  primaryDevice: "Windows workstation",
  secondaryDevice: "Laptop",
  webcam: true,
  headset: true,
  primaryIsp: "Fiber connection",
  backupIsp: "Mobile hotspot",
  cpu: "Intel Core i5 or better",
  ram: "16 GB",
  storage: "512 GB SSD",
};

const candidateProfiles: Record<string, TalentProfile> = {
  c1: {
    nationality: "Filipino", languages: ["English", "Spanish", "Filipino"],
    education: { level: "Bachelor's degree", school: "University of the Philippines", location: "Manila, Philippines", graduation: "2017", degree: "BA Communication" },
    preferredIndustry: "Real Estate & Professional Services", preferredRoles: ["Senior Executive Assistant", "Chief of Staff Support", "Operations Assistant"], availability: "Immediately available", engagement: "Full-time",
    experience: [
      { title: "Senior Executive Assistant", employer: "Northstar Advisory Group", location: "Remote", start: "2022", end: "Present", summary: "Owns executive calendars, international travel, inbox triage, meeting preparation, and follow-through for a distributed leadership team." },
      { title: "Executive Operations Coordinator", employer: "Metro Realty Partners", location: "Manila, Philippines", start: "2018", end: "2022", summary: "Coordinated transaction deadlines, vendor relationships, client communications, and weekly leadership reporting." },
    ],
    coreSkills: [
      { category: "Executive Support", name: "Calendar Management", proficiency: "Expert" }, { category: "Executive Support", name: "Inbox Management", proficiency: "Expert" },
      { category: "Operations", name: "Travel Coordination", proficiency: "Expert" }, { category: "Operations", name: "Project Coordination", proficiency: "Proficient" },
      { category: "Communication", name: "Executive Correspondence", proficiency: "Expert" }, { category: "Communication", name: "Stakeholder Follow-up", proficiency: "Proficient" },
    ],
    tools: [{ name: "Google Workspace", proficiency: "Expert" }, { name: "Microsoft 365", proficiency: "Expert" }, { name: "HubSpot", proficiency: "Proficient" }, { name: "Monday.com", proficiency: "Proficient" }, { name: "Slack", proficiency: "Expert" }],
    portfolio: ["Executive Weekly Brief Template", "International Travel Planning System", "Leadership Meeting Workflow"],
    certifications: [{ title: "Executive Assistant Certification", organization: "Cyberbacker Academy", completed: "2024" }, { title: "Project Management Foundations", organization: "LinkedIn Learning", completed: "2023" }],
    workSetup: { ...standardWorkSetup, cpu: "Intel Core i7", primaryDevice: "Dual-monitor Windows workstation" },
    valuesBreakdown: { Excellence: 97, Reliability: 98, Initiative: 96, Teamwork: 94 }, disc: { Dominance: 69, Influence: 78, Steadiness: 86, Conscientiousness: 94 },
  },
  c2: {
    nationality: "Indian", languages: ["English", "Hindi", "Kannada"],
    education: { level: "Bachelor's degree", school: "Bangalore University", location: "Bengaluru, India", graduation: "2015", degree: "Bachelor of Commerce" },
    preferredIndustry: "Healthcare & Professional Services", preferredRoles: ["Full-Charge Bookkeeper", "Senior Accounting Assistant", "Payroll Specialist"], availability: "Available in 1 week", engagement: "Full-time",
    experience: [
      { title: "Full-Charge Bookkeeper", employer: "Aster Health Services", location: "Remote", start: "2020", end: "Present", summary: "Manages monthly close, payroll, bank reconciliations, accounts payable and receivable, and management reporting across multiple entities." },
      { title: "Senior Accounting Associate", employer: "Ledgerwise Consulting", location: "Bengaluru, India", start: "2016", end: "2020", summary: "Maintained ledgers for service businesses, prepared schedules, resolved variances, and supported year-end accountant requests." },
    ],
    coreSkills: [
      { category: "Bookkeeping", name: "Month-end Close", proficiency: "Expert" }, { category: "Bookkeeping", name: "Bank Reconciliation", proficiency: "Expert" },
      { category: "Accounting Operations", name: "Accounts Payable & Receivable", proficiency: "Expert" }, { category: "Accounting Operations", name: "Payroll Processing", proficiency: "Proficient" },
      { category: "Reporting", name: "Financial Statements", proficiency: "Expert" }, { category: "Reporting", name: "Variance Analysis", proficiency: "Proficient" },
    ],
    tools: [{ name: "QuickBooks Online", proficiency: "Expert" }, { name: "Xero", proficiency: "Expert" }, { name: "Bill.com", proficiency: "Proficient" }, { name: "Gusto", proficiency: "Proficient" }, { name: "Microsoft Excel", proficiency: "Expert" }],
    portfolio: ["Multi-entity Month-end Checklist", "Cash Flow Forecast Model", "Payroll Reconciliation Workbook"],
    certifications: [{ title: "QuickBooks Online ProAdvisor", organization: "Intuit", completed: "2024", expires: "2027" }, { title: "Xero Advisor Certification", organization: "Xero", completed: "2025" }],
    workSetup: { ...standardWorkSetup, primaryDevice: "Dual-monitor Windows workstation", backupIsp: "5G mobile connection" },
    valuesBreakdown: { Accuracy: 98, Reliability: 96, Ownership: 93, Teamwork: 89 }, disc: { Dominance: 58, Influence: 55, Steadiness: 88, Conscientiousness: 97 },
  },
  c3: {
    nationality: "Filipino", languages: ["English", "French", "Filipino"],
    education: { level: "Bachelor's degree", school: "University of San Carlos", location: "Cebu, Philippines", graduation: "2019", degree: "BA Advertising Arts" },
    preferredIndustry: "Retail, Hospitality & Lifestyle", preferredRoles: ["Social Media Strategist", "Content Marketing Manager", "Paid Social Specialist"], availability: "Available in 2 weeks", engagement: "Full-time",
    experience: [
      { title: "Social Media Strategist", employer: "Harbor Hospitality Collective", location: "Remote", start: "2022", end: "Present", summary: "Plans multi-brand content calendars, directs creative production, manages paid campaigns, and reports channel performance to stakeholders." },
      { title: "Content & Community Specialist", employer: "Mango Creative Studio", location: "Cebu, Philippines", start: "2020", end: "2022", summary: "Produced social content, community responses, influencer briefs, and monthly insight reports for retail clients." },
    ],
    coreSkills: [
      { category: "Content", name: "Content Strategy", proficiency: "Expert" }, { category: "Content", name: "Copywriting", proficiency: "Expert" },
      { category: "Campaigns", name: "Paid Social Campaigns", proficiency: "Proficient" }, { category: "Campaigns", name: "Influencer Coordination", proficiency: "Proficient" },
      { category: "Analytics", name: "Channel Reporting", proficiency: "Expert" }, { category: "Analytics", name: "Audience Insights", proficiency: "Proficient" },
    ],
    tools: [{ name: "Canva Pro", proficiency: "Expert" }, { name: "Meta Business Suite", proficiency: "Expert" }, { name: "Hootsuite", proficiency: "Proficient" }, { name: "Google Analytics 4", proficiency: "Proficient" }, { name: "CapCut", proficiency: "Expert" }],
    portfolio: ["Hospitality Brand Launch Campaign", "90-day Content Calendar", "Paid Social Performance Report"],
    certifications: [{ title: "Meta Certified Digital Marketing Associate", organization: "Meta", completed: "2024", expires: "2026" }, { title: "Content Marketing", organization: "HubSpot Academy", completed: "2025" }],
    workSetup: { ...standardWorkSetup, primaryDevice: "MacBook Pro", secondaryDevice: "Windows laptop", storage: "1 TB SSD" },
    valuesBreakdown: { Creativity: 96, Initiative: 91, Adaptability: 94, Teamwork: 90 }, disc: { Dominance: 64, Influence: 92, Steadiness: 73, Conscientiousness: 84 },
  },
  c4: {
    nationality: "South African", languages: ["English", "Afrikaans"],
    education: { level: "Bachelor's degree", school: "University of Cape Town", location: "Cape Town, South Africa", graduation: "2021", degree: "BCom Management Studies" },
    preferredIndustry: "SaaS & Fintech", preferredRoles: ["Customer Success Specialist", "Onboarding Specialist", "Client Experience Coordinator"], availability: "Immediately available", engagement: "Full-time",
    experience: [
      { title: "Customer Success Specialist", employer: "Cloudline Software", location: "Remote", start: "2023", end: "Present", summary: "Leads onboarding, adoption check-ins, QBR preparation, health-score reviews, and renewal coordination for a portfolio of SaaS customers." },
      { title: "Customer Support Associate", employer: "Finserve Connect", location: "Cape Town, South Africa", start: "2021", end: "2023", summary: "Resolved product and billing concerns across email and chat while maintaining knowledge-base content and customer feedback themes." },
    ],
    coreSkills: [
      { category: "Customer Success", name: "Client Onboarding", proficiency: "Expert" }, { category: "Customer Success", name: "Retention Management", proficiency: "Proficient" },
      { category: "Support", name: "Ticket Resolution", proficiency: "Expert" }, { category: "Support", name: "Escalation Management", proficiency: "Proficient" },
      { category: "Communication", name: "QBR Facilitation", proficiency: "Proficient" }, { category: "Communication", name: "Knowledge-base Writing", proficiency: "Expert" },
    ],
    tools: [{ name: "Zendesk", proficiency: "Expert" }, { name: "Intercom", proficiency: "Expert" }, { name: "Gainsight", proficiency: "Intermediate" }, { name: "HubSpot CRM", proficiency: "Proficient" }, { name: "Slack", proficiency: "Expert" }],
    portfolio: ["Client Onboarding Playbook", "Quarterly Business Review Deck", "Customer Health Score Framework"],
    certifications: [{ title: "Customer Success Management Fundamentals", organization: "SuccessCOACHING", completed: "2025" }, { title: "Zendesk Support Administrator", organization: "Zendesk", completed: "2024" }],
    workSetup: { ...standardWorkSetup, primaryDevice: "Windows desktop with dual monitors", primaryIsp: "100 Mbps fiber" },
    valuesBreakdown: { Empathy: 97, Reliability: 92, Communication: 95, Ownership: 88 }, disc: { Dominance: 61, Influence: 87, Steadiness: 92, Conscientiousness: 82 },
  },
  c5: {
    nationality: "Filipino", languages: ["English", "Filipino", "Cebuano"],
    education: { level: "Bachelor's degree", school: "Ateneo de Davao University", location: "Davao, Philippines", graduation: "2018", degree: "BS Business Management" },
    preferredIndustry: "E-commerce & Logistics", preferredRoles: ["Operations Coordinator", "Process Improvement Specialist", "Project Coordinator"], availability: "Immediately available", engagement: "Full-time",
    experience: [
      { title: "Operations Coordinator", employer: "ParcelPeak Commerce", location: "Remote", start: "2021", end: "Present", summary: "Coordinates order operations, vendor SLAs, process documentation, automations, and daily exception reporting for a growing online retailer." },
      { title: "Logistics Project Assistant", employer: "Southern Routes Distribution", location: "Davao, Philippines", start: "2018", end: "2021", summary: "Tracked shipments, standardized procedures, prepared KPI reports, and coordinated warehouse improvement projects." },
    ],
    coreSkills: [
      { category: "Operations", name: "SOP Development", proficiency: "Expert" }, { category: "Operations", name: "Workflow Coordination", proficiency: "Expert" },
      { category: "Automation", name: "No-code Automation", proficiency: "Proficient" }, { category: "Automation", name: "Process Mapping", proficiency: "Expert" },
      { category: "Reporting", name: "KPI Reporting", proficiency: "Proficient" }, { category: "Reporting", name: "Exception Management", proficiency: "Expert" },
    ],
    tools: [{ name: "Notion", proficiency: "Expert" }, { name: "Zapier", proficiency: "Expert" }, { name: "Monday.com", proficiency: "Proficient" }, { name: "Shopify", proficiency: "Proficient" }, { name: "Google Sheets", proficiency: "Expert" }],
    portfolio: ["Order Exception Dashboard", "Operations SOP Library", "Customer Update Automation"],
    certifications: [{ title: "Lean Six Sigma Yellow Belt", organization: "CSSC", completed: "2024" }, { title: "Zapier Automation Specialist", organization: "Zapier", completed: "2025" }],
    workSetup: { ...standardWorkSetup, secondaryDevice: "Chromebook", backupIsp: "Prepaid fiber backup" },
    valuesBreakdown: { Ownership: 96, Resourcefulness: 95, Reliability: 94, Teamwork: 90 }, disc: { Dominance: 78, Influence: 69, Steadiness: 84, Conscientiousness: 91 },
  },
  c6: {
    nationality: "Nigerian", languages: ["English", "Yoruba"],
    education: { level: "Bachelor's degree", school: "University of Lagos", location: "Lagos, Nigeria", graduation: "2020", degree: "BSc Marketing" },
    preferredIndustry: "Education, Nonprofit & SaaS", preferredRoles: ["Marketing Generalist", "Lifecycle Marketing Specialist", "Content Marketer"], availability: "Currently engaged", engagement: "Full-time",
    experience: [
      { title: "Marketing Generalist", employer: "LearnForward Africa", location: "Remote", start: "2022", end: "Present", summary: "Runs organic search, lifecycle email, campaign copy, landing-page updates, and monthly growth reporting for an education platform." },
      { title: "Digital Marketing Associate", employer: "Purpose Digital Agency", location: "Lagos, Nigeria", start: "2020", end: "2022", summary: "Supported nonprofit and startup clients through content production, email campaigns, SEO audits, and website publishing." },
    ],
    coreSkills: [
      { category: "Growth Marketing", name: "Search Engine Optimization", proficiency: "Proficient" }, { category: "Growth Marketing", name: "Campaign Planning", proficiency: "Proficient" },
      { category: "Content", name: "Conversion Copywriting", proficiency: "Expert" }, { category: "Content", name: "Editorial Planning", proficiency: "Expert" },
      { category: "Lifecycle", name: "Email Automation", proficiency: "Proficient" }, { category: "Lifecycle", name: "Audience Segmentation", proficiency: "Intermediate" },
    ],
    tools: [{ name: "HubSpot Marketing Hub", proficiency: "Proficient" }, { name: "Webflow", proficiency: "Proficient" }, { name: "Semrush", proficiency: "Intermediate" }, { name: "Mailchimp", proficiency: "Expert" }, { name: "Canva Pro", proficiency: "Expert" }],
    portfolio: ["Education Enrollment Email Series", "Nonprofit SEO Content Plan", "SaaS Landing Page Refresh"],
    certifications: [{ title: "HubSpot Email Marketing", organization: "HubSpot Academy", completed: "2025" }, { title: "Google Analytics Certification", organization: "Google", completed: "2024", expires: "2026" }],
    workSetup: { ...standardWorkSetup, primaryDevice: "MacBook Air", primaryIsp: "Fiber broadband", backupIsp: "4G router" },
    valuesBreakdown: { Creativity: 92, Adaptability: 91, Communication: 90, Ownership: 86 }, disc: { Dominance: 66, Influence: 91, Steadiness: 76, Conscientiousness: 80 },
  },
  c7: {
    nationality: "Filipino", languages: ["English", "Filipino", "Spanish"],
    education: { level: "Bachelor's degree", school: "Far Eastern University", location: "Manila, Philippines", graduation: "2016", degree: "BS Business Administration" },
    preferredIndustry: "Real Estate, Mortgage & Title", preferredRoles: ["Transaction Coordinator", "Real Estate Operations Specialist", "Listing Coordinator"], availability: "Immediately available", engagement: "Full-time",
    experience: [
      { title: "Senior Transaction Coordinator", employer: "Summit Homes Group", location: "Remote", start: "2019", end: "Present", summary: "Coordinates residential transactions from executed contract through closing, tracks contingencies, organizes documents, and updates all parties." },
      { title: "Listing Coordinator", employer: "Prime Key Realty", location: "Quezon City, Philippines", start: "2017", end: "2019", summary: "Prepared listing packets, managed MLS data, scheduled vendors, and maintained transaction records for a high-volume sales team." },
    ],
    coreSkills: [
      { category: "Transactions", name: "Contract-to-Close Coordination", proficiency: "Expert" }, { category: "Transactions", name: "Deadline Management", proficiency: "Expert" },
      { category: "Listings", name: "MLS Administration", proficiency: "Expert" }, { category: "Listings", name: "Vendor Scheduling", proficiency: "Proficient" },
      { category: "Client Service", name: "Stakeholder Updates", proficiency: "Expert" }, { category: "Client Service", name: "Document Organization", proficiency: "Expert" },
    ],
    tools: [{ name: "Dotloop", proficiency: "Expert" }, { name: "DocuSign", proficiency: "Expert" }, { name: "Follow Up Boss", proficiency: "Proficient" }, { name: "Skyslope", proficiency: "Proficient" }, { name: "Google Workspace", proficiency: "Expert" }],
    portfolio: ["Contract-to-Close Checklist", "Listing Launch Timeline", "Client Milestone Update Templates"],
    certifications: [{ title: "Real Estate Transaction Coordination", organization: "Transaction Coordinator Academy", completed: "2023" }, { title: "DocuSign Real Estate Specialist", organization: "DocuSign", completed: "2024" }],
    workSetup: { ...standardWorkSetup, primaryDevice: "Dual-monitor Windows desktop", backupIsp: "5G mobile hotspot" },
    valuesBreakdown: { Reliability: 98, Detail: 97, Communication: 95, Initiative: 92 }, disc: { Dominance: 71, Influence: 76, Steadiness: 89, Conscientiousness: 97 },
  },
  c8: {
    nationality: "South Korean", languages: ["English", "Korean"],
    education: { level: "Bachelor's degree", school: "Yonsei University", location: "Seoul, South Korea", graduation: "2018", degree: "BSc Statistics" },
    preferredIndustry: "Fintech, SaaS & Healthcare", preferredRoles: ["Data & Reporting Analyst", "Business Intelligence Analyst", "Operations Analyst"], availability: "Available in 2 weeks", engagement: "Full-time",
    experience: [
      { title: "Data & Reporting Analyst", employer: "NexaPay Technologies", location: "Remote", start: "2021", end: "Present", summary: "Builds leadership dashboards, maintains reporting datasets, automates recurring analysis, and translates business questions into measurable KPIs." },
      { title: "Junior Business Analyst", employer: "Hanul Health Systems", location: "Seoul, South Korea", start: "2018", end: "2021", summary: "Prepared operational reports, cleaned source data, investigated trends, and supported department planning with ad hoc analysis." },
    ],
    coreSkills: [
      { category: "Analytics", name: "Data Analysis", proficiency: "Expert" }, { category: "Analytics", name: "KPI Design", proficiency: "Expert" },
      { category: "Data", name: "SQL Querying", proficiency: "Expert" }, { category: "Data", name: "Data Quality Assurance", proficiency: "Proficient" },
      { category: "Reporting", name: "Dashboard Development", proficiency: "Expert" }, { category: "Reporting", name: "Executive Storytelling", proficiency: "Proficient" },
    ],
    tools: [{ name: "Looker Studio", proficiency: "Expert" }, { name: "Microsoft Excel", proficiency: "Expert" }, { name: "PostgreSQL", proficiency: "Proficient" }, { name: "Python", proficiency: "Proficient" }, { name: "Tableau", proficiency: "Proficient" }],
    portfolio: ["Executive Revenue Dashboard", "Customer Retention Cohort Analysis", "Automated Operations Scorecard"],
    certifications: [{ title: "Google Business Intelligence", organization: "Google", completed: "2024" }, { title: "Tableau Desktop Specialist", organization: "Tableau", completed: "2025" }],
    workSetup: { ...standardWorkSetup, primaryDevice: "MacBook Pro", secondaryDevice: "Windows desktop", cpu: "Apple M2 Pro", storage: "1 TB SSD" },
    valuesBreakdown: { Curiosity: 95, Accuracy: 96, Reliability: 92, Collaboration: 88 }, disc: { Dominance: 63, Influence: 58, Steadiness: 82, Conscientiousness: 98 },
  },
};

export const dashboardStats: KpiStat[] = [
  { id: "k1", label: "Active Cyberbackers", value: "6", change: 12.5, trend: "up", hint: "vs last month" },
  { id: "k2", label: "Hours This Week", value: "214", change: 8.1, trend: "up", hint: "of 240 capacity" },
  { id: "k3", label: "Avg. Performance", value: "94%", change: 2.4, trend: "up", hint: "team average" },
  { id: "k4", label: "Open Tickets", value: "3", change: -25, trend: "down", hint: "vs last week" },
];

export const activityFeed: ActivityItem[] = [
  { id: "a1", actor: "Maya Lin", initials: "ML", action: "submitted a weekly report for", target: "Inbox Management", time: "12m ago" },
  { id: "a2", actor: "Recruitment", initials: "RC", action: "matched a new candidate for", target: "Executive Assistant role", time: "1h ago" },
  { id: "a3", actor: "Diego Santos", initials: "DS", action: "clocked in for", target: "Tuesday shift", time: "3h ago" },
  { id: "a4", actor: "Finance", initials: "FN", action: "issued invoice", target: "#INV-2048", time: "5h ago" },
  { id: "a5", actor: "Priya Nair", initials: "PN", action: "completed onboarding for", target: "Social Media Management", time: "1d ago" },
];

function weekdaySchedule(start: string, end: string, hours: number) {
  return ["Mon", "Tue", "Wed", "Thu", "Fri"].map((day) => ({ day, start, end, hours }));
}

// Build ~12 days of attendance history with mostly-present patterns.
function attendanceHistory(
  seed: number,
  baseHours: number,
): { date: string; status: "present" | "late" | "absent" | "leave"; hours: number }[] {
  const out: { date: string; status: "present" | "late" | "absent" | "leave"; hours: number }[] = [];
  for (let i = 0; i < 12; i++) {
    const d = new Date(2026, 5, 12 - i);
    const day = d.getDay();
    if (day === 0 || day === 6) continue; // skip weekends
    const mix = (seed + i) % 9;
    let status: "present" | "late" | "absent" | "leave" = "present";
    let hours = baseHours;
    if (mix === 2) {
      status = "late";
      hours = baseHours;
    } else if (mix === 5) {
      status = "leave";
      hours = 0;
    } else if (mix === 7) {
      status = "absent";
      hours = 0;
    }
    out.push({ date: d.toISOString().slice(0, 10), status, hours });
  }
  return out;
}

export const cyberbackers: Cyberbacker[] = [
  {
    id: "cb1", name: "Maya Lin", initials: "ML", role: "Executive Assistant", status: "active",
    hoursThisWeek: 38, weeklyCapacity: 40, performance: 96, startedOn: "2024-08-12",
    email: "maya.lin@cyberbacker.com", timezone: "PHT (GMT+8)", skills: ["Calendar", "Inbox", "Travel"],
    attendanceRate: 98, productivity: 95, tasksCompleted: 312,
    certifications: [
      { name: "Google Workspace Pro", issuer: "Google", issuedOn: "2024-09-01", expiresOn: "2026-09-01" },
      { name: "Executive Assistant Certification", issuer: "Cyberbacker Academy", issuedOn: "2024-08-20" },
    ],
    schedule: weekdaySchedule("08:00", "16:30", 8),
    attendanceHistory: attendanceHistory(1, 8),
    reviews: [
      { period: "Q1 2026", reviewer: "Jordan Avery", score: 96, summary: "Exceptional calendar and inbox ownership; anticipates needs before they arise." },
      { period: "Q4 2025", reviewer: "Casey Wu", score: 94, summary: "Highly reliable, proactive communicator. Strong travel coordination." },
    ],
    trainings: [
      { title: "Advanced Calendar Management", status: "completed", completedOn: "2025-02-10", progress: 100 },
      { title: "AI Productivity Tools", status: "in_progress", progress: 60 },
      { title: "Client Communication Excellence", status: "assigned", progress: 0 },
    ],
  },
  {
    id: "cb2", name: "Diego Santos", initials: "DS", role: "Bookkeeper", status: "active",
    hoursThisWeek: 40, weeklyCapacity: 40, performance: 92, startedOn: "2024-05-03",
    email: "diego.santos@cyberbacker.com", timezone: "PHT (GMT+8)", skills: ["QuickBooks", "Payroll", "AR/AP"],
    attendanceRate: 95, productivity: 91, tasksCompleted: 268,
    certifications: [
      { name: "QuickBooks ProAdvisor", issuer: "Intuit", issuedOn: "2024-06-15", expiresOn: "2026-06-15" },
      { name: "Xero Advisor Certified", issuer: "Xero", issuedOn: "2025-01-12", expiresOn: "2026-01-12" },
    ],
    schedule: weekdaySchedule("09:00", "17:00", 8),
    attendanceHistory: attendanceHistory(2, 8),
    reviews: [
      { period: "Q1 2026", reviewer: "Finance Team", score: 92, summary: "Accurate month-end close, zero reconciliation errors this quarter." },
      { period: "Q4 2025", reviewer: "Jordan Avery", score: 90, summary: "Dependable and detail-oriented; payroll consistently on time." },
    ],
    trainings: [
      { title: "Advanced Payroll Compliance", status: "completed", completedOn: "2025-03-22", progress: 100 },
      { title: "Financial Reporting with AI", status: "in_progress", progress: 40 },
    ],
  },
  {
    id: "cb3", name: "Priya Nair", initials: "PN", role: "Social Media Manager", status: "active",
    hoursThisWeek: 32, weeklyCapacity: 40, performance: 89, startedOn: "2025-01-20",
    email: "priya.nair@cyberbacker.com", timezone: "IST (GMT+5:30)", skills: ["Content", "Canva", "Analytics"],
    attendanceRate: 93, productivity: 90, tasksCompleted: 197,
    certifications: [
      { name: "Meta Certified Marketing Pro", issuer: "Meta", issuedOn: "2025-02-18", expiresOn: "2026-02-18" },
      { name: "HubSpot Content Marketing", issuer: "HubSpot", issuedOn: "2025-03-05" },
    ],
    schedule: weekdaySchedule("13:00", "21:00", 7),
    attendanceHistory: attendanceHistory(3, 7),
    reviews: [
      { period: "Q1 2026", reviewer: "Jordan Avery", score: 89, summary: "Strong content cadence; engagement up 22% across channels." },
    ],
    trainings: [
      { title: "Paid Social Strategy", status: "completed", completedOn: "2025-04-30", progress: 100 },
      { title: "Short-form Video Editing", status: "in_progress", progress: 75 },
      { title: "Brand Voice Workshop", status: "assigned", progress: 0 },
    ],
  },
  {
    id: "cb4", name: "Tomas Reyes", initials: "TR", role: "Customer Support", status: "onboarding",
    hoursThisWeek: 14, weeklyCapacity: 40, performance: 78, startedOn: "2026-06-01",
    email: "tomas.reyes@cyberbacker.com", timezone: "PHT (GMT+8)", skills: ["Zendesk", "Chat", "Email"],
    attendanceRate: 88, productivity: 76, tasksCompleted: 41,
    certifications: [
      { name: "Zendesk Support Fundamentals", issuer: "Zendesk", issuedOn: "2026-06-05" },
    ],
    schedule: weekdaySchedule("08:30", "12:30", 4),
    attendanceHistory: attendanceHistory(4, 4),
    reviews: [
      { period: "Onboarding", reviewer: "Facilitator", score: 78, summary: "Ramping well; product knowledge improving each week." },
    ],
    trainings: [
      { title: "Support Onboarding Bootcamp", status: "in_progress", progress: 55 },
      { title: "Ticket Triage & SLAs", status: "assigned", progress: 0 },
    ],
  },
  {
    id: "cb5", name: "Hana Kim", initials: "HK", role: "Data Entry Specialist", status: "active",
    hoursThisWeek: 36, weeklyCapacity: 40, performance: 94, startedOn: "2024-11-08",
    email: "hana.kim@cyberbacker.com", timezone: "KST (GMT+9)", skills: ["Excel", "CRM", "Research"],
    attendanceRate: 97, productivity: 96, tasksCompleted: 421,
    certifications: [
      { name: "Microsoft Excel Expert", issuer: "Microsoft", issuedOn: "2024-12-01", expiresOn: "2026-12-01" },
      { name: "Salesforce CRM Basics", issuer: "Salesforce", issuedOn: "2025-05-10" },
    ],
    schedule: weekdaySchedule("09:00", "17:00", 8),
    attendanceHistory: attendanceHistory(5, 8),
    reviews: [
      { period: "Q1 2026", reviewer: "Jordan Avery", score: 94, summary: "Fastest, most accurate data throughput on the team." },
      { period: "Q4 2025", reviewer: "Casey Wu", score: 93, summary: "Meticulous and consistent; great research support." },
    ],
    trainings: [
      { title: "Data Validation & QA", status: "completed", completedOn: "2025-06-01", progress: 100 },
      { title: "Automation with Zapier", status: "in_progress", progress: 35 },
    ],
  },
  {
    id: "cb6", name: "Liam Walsh", initials: "LW", role: "Marketing Assistant", status: "paused",
    hoursThisWeek: 0, weeklyCapacity: 40, performance: 85, startedOn: "2025-03-15",
    email: "liam.walsh@cyberbacker.com", timezone: "GMT+0", skills: ["SEO", "Email", "Ads"],
    attendanceRate: 82, productivity: 84, tasksCompleted: 154,
    certifications: [
      { name: "Google Ads Search Certification", issuer: "Google", issuedOn: "2025-04-02", expiresOn: "2026-04-02" },
    ],
    schedule: weekdaySchedule("08:00", "16:00", 8),
    attendanceHistory: attendanceHistory(6, 8),
    reviews: [
      { period: "Q4 2025", reviewer: "Jordan Avery", score: 85, summary: "Solid execution on email and SEO; engagement paused pending reassignment." },
    ],
    trainings: [
      { title: "Technical SEO Foundations", status: "completed", completedOn: "2025-05-20", progress: 100 },
      { title: "Lifecycle Email Strategy", status: "assigned", progress: 0 },
    ],
  },
];

export const candidates: Candidate[] = [
  { id: "c1", name: "Sofia Mendoza", initials: "SM", title: "Senior Executive Assistant", availability: "available", rating: 4.9, hourlyRate: 14, yearsExperience: 7, location: "Manila, PH", skills: ["Calendar", "Project Mgmt", "Inbox", "Travel", "CRM"], matchScore: 97, industries: ["Real Estate", "Consulting", "SaaS", "Professional Services"], valuesScore: 96, bio: "Detail-obsessed EA who keeps founders out of the weeds. Built and ran the back-office for two seven-figure agencies and thrives on calendar Tetris and inbox zero.", tools: ["Google Workspace", "Slack", "HubSpot"], timezone: "Eastern", availabilityHours: ["Standard business hours", "Early hours"], workStyle: "Proactive", languages: ["English", "Spanish"], languageProficiency: { English: 5, Spanish: 4 }, certifications: ["Executive Assistant Certification"], education: "Bachelor's degree", functionalExpertise: ["Administrative & Executive Support", "Operations, Reporting & Compliance"], assessmentScore: 96, profile: candidateProfiles.c1 },
  { id: "c2", name: "Arjun Patel", initials: "AP", title: "Full-Charge Bookkeeper", availability: "available", rating: 4.8, hourlyRate: 16, yearsExperience: 9, location: "Bengaluru, IN", skills: ["Xero", "QuickBooks", "Payroll", "AR/AP", "Reconciliation"], matchScore: 94, industries: ["Healthcare", "E-commerce", "Professional Services"], valuesScore: 92, bio: "Numbers-first bookkeeper trusted with month-end close for distributed teams. Calm under audit pressure and fluent in both Xero and QuickBooks Online.", profile: candidateProfiles.c2 },
  { id: "c3", name: "Camille Roy", initials: "CR", title: "Social Media Strategist", availability: "interviewing", rating: 4.7, hourlyRate: 15, yearsExperience: 5, location: "Cebu, PH", skills: ["Content", "Paid Ads", "Analytics", "Canva", "Copywriting"], matchScore: 91, industries: ["Retail", "Hospitality", "Real Estate"], valuesScore: 89, bio: "Brand storyteller who turns scrappy budgets into scroll-stopping campaigns. Owns the full funnel from content calendar to paid amplification and reporting.", profile: candidateProfiles.c3 },
  { id: "c4", name: "Noah Becker", initials: "NB", title: "Customer Success Specialist", availability: "available", rating: 4.6, hourlyRate: 13, yearsExperience: 4, location: "Cape Town, ZA", skills: ["Zendesk", "Onboarding", "Retention", "QBRs", "Intercom"], matchScore: 88, industries: ["SaaS", "Fintech"], valuesScore: 90, bio: "Empathetic CS specialist who turns first-week jitters into renewals. Loves building onboarding playbooks and cutting churn through proactive check-ins.", tools: ["Zendesk", "Intercom", "Slack"], timezone: "Eastern", availabilityHours: ["Standard business hours", "Evening coverage"], workStyle: "Combination", languages: ["English"], languageProficiency: { English: 5 }, certifications: ["Customer Success Management"], education: "Bachelor's degree", functionalExpertise: ["Customer Service & Client Success"], assessmentScore: 90, profile: candidateProfiles.c4 },
  { id: "c5", name: "Live Tan", initials: "LT", title: "Operations Coordinator", availability: "available", rating: 4.8, hourlyRate: 15, yearsExperience: 6, location: "Davao, PH", skills: ["Ops", "SOPs", "Automation", "Zapier", "Notion"], matchScore: 90, industries: ["Logistics", "E-commerce", "Construction"], valuesScore: 93, bio: "Systems thinker who documents everything and automates the rest. Has scaled ops for fast-growing e-commerce brands without dropping a shipment.", profile: candidateProfiles.c5 },
  { id: "c6", name: "Grace Okafor", initials: "GO", title: "Marketing Generalist", availability: "hired", rating: 4.5, hourlyRate: 14, yearsExperience: 5, location: "Lagos, NG", skills: ["SEO", "Email", "Copy", "HubSpot", "Webflow"], matchScore: 85, industries: ["Education", "Nonprofit", "SaaS"], valuesScore: 87, bio: "Versatile marketer comfortable wearing every hat from SEO to lifecycle email. Ships fast, measures everything, and iterates on what converts.", profile: candidateProfiles.c6 },
  { id: "c7", name: "Mateo Alvarez", initials: "MA", title: "Real Estate Transaction Coordinator", availability: "available", rating: 4.9, hourlyRate: 15, yearsExperience: 8, location: "Quezon City, PH", skills: ["Contracts", "MLS", "Compliance", "DocuSign", "Scheduling"], matchScore: 95, industries: ["Real Estate", "Mortgage", "Title"], valuesScore: 94, bio: "TC who shepherds deals from contract to close without a single missed deadline. Knows broker compliance cold and keeps every party informed.", profile: candidateProfiles.c7 },
  { id: "c8", name: "Hana Park", initials: "HP", title: "Data & Reporting Analyst", availability: "interviewing", rating: 4.7, hourlyRate: 17, yearsExperience: 6, location: "Seoul, KR", skills: ["SQL", "Looker", "Excel", "Dashboards", "Python"], matchScore: 92, industries: ["Fintech", "SaaS", "Healthcare"], valuesScore: 91, bio: "Analyst who turns messy spreadsheets into dashboards leadership actually uses. Equally happy writing SQL or explaining the so-what to non-technical teams.", profile: candidateProfiles.c8 },
  { id: "c9", name: "Leandre John Sabado", initials: "LS", title: "Software Backer & Web Developer", availability: "available", rating: 4.8, hourlyRate: 17, yearsExperience: 5, location: "Valenzuela, PH", skills: ["React", "TypeScript", "Node.js", "PostgreSQL", "DevOps"], matchScore: 93, industries: ["Technology", "SaaS", "Professional Services"], valuesScore: 94, bio: "Product-minded software professional who turns complex business processes into reliable, easy-to-use web applications.", tools: ["React", "TypeScript", "Node.js", "GitHub", "Docker"], timezone: "PHT (GMT+8)", availabilityHours: ["Standard business hours", "Flexible overlap"], workStyle: "Proactive", languages: ["English", "Filipino"], languageProficiency: { English: 5, Filipino: 5 }, certifications: ["Full Stack Web Development"], education: "Bachelor's degree", functionalExpertise: ["Software Development", "Web Development", "DevOps"], assessmentScore: 94, profile: leandreProfile },
];

export const attendance: AttendanceEntry[] = [
  { id: "at1", cyberbacker: "Maya Lin", initials: "ML", date: "2026-06-12", clockIn: "08:02", clockOut: "16:05", hours: 8, status: "present" },
  { id: "at2", cyberbacker: "Diego Santos", initials: "DS", date: "2026-06-12", clockIn: "09:14", clockOut: "17:30", hours: 8, status: "late" },
  { id: "at3", cyberbacker: "Priya Nair", initials: "PN", date: "2026-06-12", clockIn: "08:00", clockOut: "14:00", hours: 6, status: "present" },
  { id: "at4", cyberbacker: "Hana Kim", initials: "HK", date: "2026-06-12", clockIn: "—", clockOut: "—", hours: 0, status: "leave" },
  { id: "at5", cyberbacker: "Tomas Reyes", initials: "TR", date: "2026-06-12", clockIn: "08:30", clockOut: "12:30", hours: 4, status: "present" },
  { id: "at6", cyberbacker: "Liam Walsh", initials: "LW", date: "2026-06-12", clockIn: "—", clockOut: "—", hours: 0, status: "absent" },
];

export const performanceTrend: PerformancePoint[] = [
  { label: "Jan", productivity: 82, satisfaction: 88, hours: 720 },
  { label: "Feb", productivity: 85, satisfaction: 89, hours: 760 },
  { label: "Mar", productivity: 87, satisfaction: 90, hours: 810 },
  { label: "Apr", productivity: 90, satisfaction: 91, hours: 845 },
  { label: "May", productivity: 92, satisfaction: 93, hours: 870 },
  { label: "Jun", productivity: 94, satisfaction: 95, hours: 905 },
];

export const tickets: Ticket[] = [
  {
    id: "t1",
    subject: "Cannot access timesheet export",
    requester: "Jordan Avery",
    requesterInitials: "JA",
    category: "Billing",
    status: "open",
    priority: "high",
    createdAt: "2026-06-12",
    updatedAt: "2026-06-13",
    assignedTo: "Support Team",
    slaHoursLeft: 4,
    tags: ["export", "timesheet"],
    description:
      "When I click 'Export CSV' on the timesheet page nothing downloads. I've tried Chrome and Safari with the same result. This is blocking our payroll run.",
    attachments: [
      { id: "a1", name: "export-error.png", sizeKb: 248, type: "image" },
    ],
    messages: [
      {
        id: "m1",
        author: "Jordan Avery",
        initials: "JA",
        role: "client",
        body: "When I click 'Export CSV' on the timesheet page nothing downloads. I've tried Chrome and Safari with the same result. This is blocking our payroll run.",
        time: "Jun 12, 9:14 AM",
        attachments: [{ id: "a1", name: "export-error.png", sizeKb: 248, type: "image" }],
      },
      {
        id: "m2",
        author: "Mia Chen",
        initials: "MC",
        role: "agent",
        body: "Hi Jordan, thanks for flagging this. I can reproduce the issue on accounts with more than 5,000 rows. Our engineers are looking into it now — I'll keep you posted within the hour.",
        time: "Jun 12, 9:42 AM",
      },
      {
        id: "m3",
        author: "Jordan Avery",
        initials: "JA",
        role: "client",
        body: "Thanks Mia — appreciate the quick response. We need this resolved before Friday's payroll.",
        time: "Jun 13, 8:05 AM",
      },
    ],
    events: [
      { id: "e1", type: "created", label: "Ticket created", actor: "Jordan Avery", time: "Jun 12, 9:14 AM" },
      { id: "e2", type: "assignment", label: "Assigned to Support Team", actor: "System", time: "Jun 12, 9:20 AM" },
      { id: "e3", type: "comment", label: "Agent replied", actor: "Mia Chen", time: "Jun 12, 9:42 AM" },
      { id: "e4", type: "priority", label: "Priority raised to High", actor: "Mia Chen", time: "Jun 12, 9:45 AM" },
    ],
  },
  {
    id: "t2",
    subject: "Request additional Cyberbacker hours",
    requester: "BrightPath Ventures",
    requesterInitials: "BV",
    category: "Account",
    status: "in_progress",
    priority: "medium",
    createdAt: "2026-06-11",
    updatedAt: "2026-06-13",
    assignedTo: "Facilitator",
    slaHoursLeft: 12,
    tags: ["upgrade", "hours"],
    description:
      "We'd like to add 20 hours/week to our current plan to cover a new product launch in July. Can you help us scope this?",
    attachments: [],
    messages: [
      {
        id: "m1",
        author: "Jordan Avery",
        initials: "JA",
        role: "client",
        body: "We'd like to add 20 hours/week to our current plan to cover a new product launch in July. Can you help us scope this?",
        time: "Jun 11, 2:30 PM",
      },
      {
        id: "m2",
        author: "Daniel Ortiz",
        initials: "DO",
        role: "agent",
        body: "Absolutely. I've drafted an addendum that adds 20 hrs/week effective July 1. I'll send the contract for signature shortly.",
        time: "Jun 12, 10:15 AM",
      },
      {
        id: "m3",
        author: "Daniel Ortiz",
        initials: "DO",
        role: "agent",
        body: "Addendum sent to your billing contact. Let me know if the proposed rate works.",
        time: "Jun 13, 11:00 AM",
        attachments: [{ id: "a2", name: "addendum-july.pdf", sizeKb: 96, type: "pdf" }],
      },
    ],
    events: [
      { id: "e1", type: "created", label: "Ticket created", actor: "Jordan Avery", time: "Jun 11, 2:30 PM" },
      { id: "e2", type: "assignment", label: "Assigned to Facilitator", actor: "System", time: "Jun 11, 2:35 PM" },
      { id: "e3", type: "status", label: "Status changed to In Progress", actor: "Daniel Ortiz", time: "Jun 12, 10:10 AM" },
      { id: "e4", type: "attachment", label: "Addendum attached", actor: "Daniel Ortiz", time: "Jun 13, 11:00 AM" },
    ],
  },
  {
    id: "t3",
    subject: "Onboarding docs for new hire",
    requester: "Jordan Avery",
    requesterInitials: "JA",
    category: "Onboarding",
    status: "pending_client",
    priority: "low",
    createdAt: "2026-06-10",
    updatedAt: "2026-06-12",
    assignedTo: "Support Team",
    slaHoursLeft: 22,
    tags: ["onboarding"],
    description:
      "Could you send the onboarding checklist and NDA template for our new Cyberbacker starting next week?",
    attachments: [],
    messages: [
      {
        id: "m1",
        author: "Jordan Avery",
        initials: "JA",
        role: "client",
        body: "Could you send the onboarding checklist and NDA template for our new Cyberbacker starting next week?",
        time: "Jun 10, 4:00 PM",
      },
      {
        id: "m2",
        author: "Mia Chen",
        initials: "MC",
        role: "agent",
        body: "Here are both documents. Once you've signed the NDA, reply here and we'll schedule the kickoff call.",
        time: "Jun 11, 9:30 AM",
        attachments: [
          { id: "a3", name: "onboarding-checklist.pdf", sizeKb: 142, type: "pdf" },
          { id: "a4", name: "nda-template.doc", sizeKb: 58, type: "doc" },
        ],
      },
    ],
    events: [
      { id: "e1", type: "created", label: "Ticket created", actor: "Jordan Avery", time: "Jun 10, 4:00 PM" },
      { id: "e2", type: "comment", label: "Agent replied with documents", actor: "Mia Chen", time: "Jun 11, 9:30 AM" },
      { id: "e3", type: "status", label: "Waiting on client", actor: "Mia Chen", time: "Jun 11, 9:31 AM" },
    ],
  },
  {
    id: "t4",
    subject: "Performance report discrepancy",
    requester: "Casey Wu",
    requesterInitials: "CW",
    category: "Reports",
    status: "open",
    priority: "urgent",
    createdAt: "2026-06-13",
    updatedAt: "2026-06-13",
    assignedTo: "Unassigned",
    slaHoursLeft: 1,
    tags: ["reports", "data"],
    description:
      "The June performance report shows 0 completed tasks for two of our Cyberbackers, but they've clearly been active. Numbers don't match the dashboard.",
    attachments: [
      { id: "a5", name: "report-june.xlsx", sizeKb: 412, type: "sheet" },
    ],
    messages: [
      {
        id: "m1",
        author: "Casey Wu",
        initials: "CW",
        role: "client",
        body: "The June performance report shows 0 completed tasks for two of our Cyberbackers, but they've clearly been active. Numbers don't match the dashboard.",
        time: "Jun 13, 8:50 AM",
        attachments: [{ id: "a5", name: "report-june.xlsx", sizeKb: 412, type: "sheet" }],
      },
    ],
    events: [
      { id: "e1", type: "created", label: "Ticket created", actor: "Casey Wu", time: "Jun 13, 8:50 AM" },
      { id: "e2", type: "priority", label: "Priority set to Urgent", actor: "System", time: "Jun 13, 8:50 AM" },
    ],
  },
  {
    id: "t5",
    subject: "Update payment method",
    requester: "Jordan Avery",
    requesterInitials: "JA",
    category: "Billing",
    status: "resolved",
    priority: "medium",
    createdAt: "2026-06-08",
    updatedAt: "2026-06-09",
    assignedTo: "Finance Team",
    slaHoursLeft: 0,
    tags: ["billing", "payment"],
    description: "Need to switch our default card to a new corporate Visa ending 4242.",
    attachments: [],
    messages: [
      {
        id: "m1",
        author: "Jordan Avery",
        initials: "JA",
        role: "client",
        body: "Need to switch our default card to a new corporate Visa ending 4242.",
        time: "Jun 8, 1:10 PM",
      },
      {
        id: "m2",
        author: "Priya Nair",
        initials: "PN",
        role: "agent",
        body: "Done! Your new Visa ending 4242 is now the default payment method. The next invoice will be charged to it.",
        time: "Jun 9, 10:00 AM",
      },
      {
        id: "m3",
        author: "Jordan Avery",
        initials: "JA",
        role: "client",
        body: "Perfect, thank you!",
        time: "Jun 9, 10:20 AM",
      },
    ],
    events: [
      { id: "e1", type: "created", label: "Ticket created", actor: "Jordan Avery", time: "Jun 8, 1:10 PM" },
      { id: "e2", type: "assignment", label: "Assigned to Finance Team", actor: "System", time: "Jun 8, 1:15 PM" },
      { id: "e3", type: "status", label: "Resolved", actor: "Priya Nair", time: "Jun 9, 10:00 AM" },
    ],
  },
  {
    id: "t6",
    subject: "Slack integration keeps disconnecting",
    requester: "BrightPath Ventures",
    requesterInitials: "BV",
    category: "Technical",
    status: "in_progress",
    priority: "high",
    createdAt: "2026-06-13",
    updatedAt: "2026-06-14",
    assignedTo: "Support Team",
    slaHoursLeft: 6,
    tags: ["integration", "slack"],
    description:
      "Our Slack integration disconnects every few hours and we have to re-authorize. Started after the last update.",
    attachments: [
      { id: "a6", name: "slack-logs.txt", sizeKb: 34, type: "file" },
    ],
    messages: [
      {
        id: "m1",
        author: "Jordan Avery",
        initials: "JA",
        role: "client",
        body: "Our Slack integration disconnects every few hours and we have to re-authorize. Started after the last update.",
        time: "Jun 13, 3:20 PM",
        attachments: [{ id: "a6", name: "slack-logs.txt", sizeKb: 34, type: "file" }],
      },
      {
        id: "m2",
        author: "Leo Martins",
        initials: "LM",
        role: "agent",
        body: "Thanks for the logs. Looks like an expired OAuth token. We're rolling out a fix today — I'll confirm once it's deployed.",
        time: "Jun 14, 9:05 AM",
      },
    ],
    events: [
      { id: "e1", type: "created", label: "Ticket created", actor: "Jordan Avery", time: "Jun 13, 3:20 PM" },
      { id: "e2", type: "assignment", label: "Assigned to Support Team", actor: "System", time: "Jun 13, 3:25 PM" },
      { id: "e3", type: "status", label: "Status changed to In Progress", actor: "Leo Martins", time: "Jun 14, 9:05 AM" },
    ],
  },
  {
    id: "t7",
    subject: "Welcome kit not received",
    requester: "Casey Wu",
    requesterInitials: "CW",
    category: "Onboarding",
    status: "closed",
    priority: "low",
    createdAt: "2026-05-28",
    updatedAt: "2026-06-02",
    assignedTo: "Support Team",
    slaHoursLeft: 0,
    tags: ["onboarding", "shipping"],
    description: "The physical welcome kit for our new hire hasn't arrived after two weeks.",
    attachments: [],
    messages: [
      {
        id: "m1",
        author: "Casey Wu",
        initials: "CW",
        role: "client",
        body: "The physical welcome kit for our new hire hasn't arrived after two weeks.",
        time: "May 28, 11:00 AM",
      },
      {
        id: "m2",
        author: "Mia Chen",
        initials: "MC",
        role: "agent",
        body: "Apologies for the delay — the carrier lost the package. A replacement has shipped with tracking #1Z998. It should arrive in 3 days.",
        time: "May 30, 2:00 PM",
      },
      {
        id: "m3",
        author: "Casey Wu",
        initials: "CW",
        role: "client",
        body: "Received it today, thanks for sorting it out.",
        time: "Jun 2, 9:00 AM",
      },
    ],
    events: [
      { id: "e1", type: "created", label: "Ticket created", actor: "Casey Wu", time: "May 28, 11:00 AM" },
      { id: "e2", type: "comment", label: "Replacement shipped", actor: "Mia Chen", time: "May 30, 2:00 PM" },
      { id: "e3", type: "status", label: "Resolved", actor: "Mia Chen", time: "Jun 1, 4:00 PM" },
      { id: "e4", type: "status", label: "Closed", actor: "System", time: "Jun 2, 9:30 AM" },
    ],
  },
];

export const kbCategories: KbCategory[] = [
  { id: "kc1", name: "Getting Started", description: "Onboarding and account setup", articleCount: 18, icon: "Rocket" },
  { id: "kc2", name: "Managing Cyberbackers", description: "Delegation, hours, and reviews", articleCount: 24, icon: "Users" },
  { id: "kc3", name: "Billing & Contracts", description: "Invoices, plans, and payments", articleCount: 12, icon: "CreditCard" },
  { id: "kc4", name: "Productivity Tools", description: "Integrations and best practices", articleCount: 31, icon: "Zap" },
];

export const articles: Article[] = [
  { id: "ar1", title: "How to delegate your first task", category: "Getting Started", excerpt: "A step-by-step guide to handing off work effectively to your Cyberbacker.", readMinutes: 5, views: 4210, updatedAt: "2026-05-28" },
  { id: "ar2", title: "Setting weekly priorities with your team", category: "Managing Cyberbackers", excerpt: "Run an effective weekly planning ritual that keeps everyone aligned.", readMinutes: 7, views: 3180, updatedAt: "2026-06-02" },
  { id: "ar3", title: "Understanding your monthly invoice", category: "Billing & Contracts", excerpt: "Breakdown of line items, hours, and add-ons on your statement.", readMinutes: 4, views: 2560, updatedAt: "2026-06-09" },
  { id: "ar4", title: "Top 10 automations for assistants", category: "Productivity Tools", excerpt: "Save hours every week with these no-code automation recipes.", readMinutes: 9, views: 5890, updatedAt: "2026-06-10" },
];

export const contracts: Contract[] = [
  { id: "ct1", title: "Master Services Agreement", party: "Cyberbacker LLC", status: "active", value: 0, startDate: "2024-08-01", endDate: "2026-08-01", signedOn: "2024-07-28" },
  { id: "ct2", title: "Executive Assistant — Full Time", party: "Maya Lin", status: "active", value: 2240, startDate: "2024-08-12", endDate: "2026-08-12", signedOn: "2024-08-10" },
  { id: "ct3", title: "Bookkeeper — Full Time", party: "Diego Santos", status: "active", value: 2560, startDate: "2024-05-03", endDate: "2026-05-03", signedOn: "2024-05-01" },
  { id: "ct4", title: "Customer Support — Part Time", party: "Tomas Reyes", status: "pending_signature", value: 1280, startDate: "2026-06-15", endDate: "2027-06-15" },
  { id: "ct5", title: "Marketing Assistant — Addendum", party: "Liam Walsh", status: "draft", value: 1600, startDate: "2026-07-01", endDate: "2027-07-01" },
];

export const invoices: Invoice[] = [
  { id: "iv1", number: "INV-2048", period: "Jun 2026", amount: 9680, status: "due", issuedOn: "2026-06-01", dueOn: "2026-06-15" },
  { id: "iv2", number: "INV-2031", period: "May 2026", amount: 9440, status: "paid", issuedOn: "2026-05-01", dueOn: "2026-05-15" },
  { id: "iv3", number: "INV-2018", period: "Apr 2026", amount: 9120, status: "paid", issuedOn: "2026-04-01", dueOn: "2026-04-15" },
  { id: "iv4", number: "INV-2002", period: "Mar 2026", amount: 8800, status: "paid", issuedOn: "2026-03-01", dueOn: "2026-03-15" },
  { id: "iv5", number: "INV-1987", period: "Feb 2026", amount: 8800, status: "overdue", issuedOn: "2026-02-01", dueOn: "2026-02-15" },
];

export const paymentMethods: PaymentMethod[] = [
  { id: "pm1", brand: "Visa", last4: "4242", expiry: "08/27", isDefault: true },
  { id: "pm2", brand: "Mastercard", last4: "5588", expiry: "11/26", isDefault: false },
];

export const rewards: Reward[] = [
  { id: "rw1", title: "2 Free Bonus Hours", description: "Add 2 complimentary hours to any Cyberbacker this month.", type: "credit", value: "+2 hrs", code: "BONUS2", expiresOn: "2026-06-30", status: "available" },
  { id: "rw2", title: "Referral Reward", description: "Refer a business and earn account credit when they sign.", type: "credit", value: "$250", code: "REFER250", expiresOn: "2026-12-31", status: "available" },
  { id: "rw3", title: "Annual Plan Discount", description: "Switch to annual billing and save 15%.", type: "coupon", value: "15% off", code: "ANNUAL15", expiresOn: "2026-08-01", status: "available" },
  { id: "rw4", title: "Priority Support Pass", description: "30 days of priority support response times.", type: "perk", value: "Priority", expiresOn: "2026-05-31", status: "redeemed" },
];

export const clientAccounts: ClientAccount[] = [
  { id: "cl1", company: "BrightPath Ventures", initials: "BV", contact: "Jordan Avery", plan: "Scale", cyberbackers: 6, mrr: 9680, status: "active", health: 92, since: "2024-08-01" },
  { id: "cl2", company: "Northwind Labs", initials: "NL", contact: "Casey Wu", plan: "Growth", cyberbackers: 4, mrr: 6240, status: "active", health: 81, since: "2024-11-15" },
  { id: "cl3", company: "Harbor & Co", initials: "HC", contact: "Dana Cole", plan: "Starter", cyberbackers: 2, mrr: 3120, status: "at_risk", health: 58, since: "2025-02-20" },
  { id: "cl4", company: "Vela Studio", initials: "VS", contact: "Sam Ortiz", plan: "Growth", cyberbackers: 3, mrr: 4680, status: "trial", health: 74, since: "2026-05-30" },
  { id: "cl5", company: "Kestrel Group", initials: "KG", contact: "Robin Hale", plan: "Scale", cyberbackers: 8, mrr: 12480, status: "active", health: 88, since: "2023-12-04" },
  { id: "cl6", company: "Apex Dental", initials: "AD", contact: "Pat Lee", plan: "Starter", cyberbackers: 1, mrr: 1560, status: "churned", health: 22, since: "2025-06-12" },
];

export const pipeline: PipelineCandidate[] = [
  { id: "p1", name: "Sofia Mendoza", initials: "SM", role: "Executive Assistant", stage: "offer", recruiter: "Alex Park", appliedOn: "2026-05-30", score: 97 },
  { id: "p2", name: "Arjun Patel", initials: "AP", role: "Bookkeeper", stage: "assessment", recruiter: "Alex Park", appliedOn: "2026-06-02", score: 94 },
  { id: "p3", name: "Camille Roy", initials: "CR", role: "Social Media", stage: "interview", recruiter: "Jamie Fox", appliedOn: "2026-06-04", score: 91 },
  { id: "p4", name: "Noah Becker", initials: "NB", role: "Customer Support", stage: "screening", recruiter: "Jamie Fox", appliedOn: "2026-06-07", score: 88 },
  { id: "p5", name: "Grace Okafor", initials: "GO", role: "Marketing", stage: "placed", recruiter: "Alex Park", appliedOn: "2026-05-12", score: 85 },
  { id: "p6", name: "Ravi Shah", initials: "RS", role: "Data Entry", stage: "applied", recruiter: "Jamie Fox", appliedOn: "2026-06-11", score: 79 },
  { id: "p7", name: "Elena Voss", initials: "EV", role: "Executive Assistant", stage: "applied", recruiter: "Alex Park", appliedOn: "2026-06-12", score: 82 },
  { id: "p8", name: "Mateo Cruz", initials: "MC", role: "Bookkeeper", stage: "interview", recruiter: "Jamie Fox", appliedOn: "2026-06-05", score: 86 },
];

export const revenueTrend: RevenuePoint[] = [
  { month: "Jan", revenue: 182000, payouts: 96000 },
  { month: "Feb", revenue: 191000, payouts: 99000 },
  { month: "Mar", revenue: 205000, payouts: 104000 },
  { month: "Apr", revenue: 218000, payouts: 109000 },
  { month: "May", revenue: 231000, payouts: 116000 },
  { month: "Jun", revenue: 247000, payouts: 121000 },
];

export const acquisitionFunnel: FunnelStep[] = [
  { step: "Visitors", value: 24800 },
  { step: "Leads", value: 6200 },
  { step: "Trials", value: 1840 },
  { step: "Demos", value: 720 },
  { step: "Customers", value: 312 },
];

export const systemUsers: SystemUser[] = [
  { id: "su1", name: "Jordan Avery", email: "jordan.avery@brightpath.co", role: "Client", status: "active", lastActive: "2m ago" },
  { id: "su2", name: "Alex Park", email: "alex.park@cyberbacker.com", role: "Recruiter", status: "active", lastActive: "18m ago" },
  { id: "su3", name: "Riley Stone", email: "riley.stone@cyberbacker.com", role: "Facilitator", status: "active", lastActive: "1h ago" },
  { id: "su4", name: "Sam Okada", email: "sam.okada@cyberbacker.com", role: "Support Agent", status: "active", lastActive: "3h ago" },
  { id: "su5", name: "Morgan Bell", email: "morgan.bell@cyberbacker.com", role: "Finance Team", status: "invited", lastActive: "—" },
  { id: "su6", name: "Taylor Quinn", email: "taylor.quinn@cyberbacker.com", role: "Administrator", status: "active", lastActive: "5h ago" },
  { id: "su7", name: "Drew Carter", email: "drew.carter@cyberbacker.com", role: "Executive", status: "suspended", lastActive: "8d ago" },
];

export const auditLog: AuditEntry[] = [
  { id: "al1", actor: "Taylor Quinn", action: "Updated role permissions", resource: "Role: Finance Team", time: "2026-06-13 09:42", ip: "10.0.4.18" },
  { id: "al2", actor: "Alex Park", action: "Created candidate", resource: "Candidate: Elena Voss", time: "2026-06-12 16:20", ip: "10.0.4.21" },
  { id: "al3", actor: "Morgan Bell", action: "Issued invoice", resource: "INV-2048", time: "2026-06-01 08:05", ip: "10.0.4.30" },
  { id: "al4", actor: "Jordan Avery", action: "Updated payment method", resource: "Visa •••• 4242", time: "2026-05-29 11:14", ip: "203.0.113.9" },
  { id: "al5", actor: "System", action: "Nightly backup completed", resource: "Database snapshot", time: "2026-06-13 02:00", ip: "internal" },
];

export const notifications: Notification[] = [
  { id: "n1", title: "New candidate matched", description: "Sofia Mendoza is a 97% match for your EA role.", time: "12m ago", type: "success", read: false },
  { id: "n2", title: "Invoice due soon", description: "INV-2048 ($9,680) is due Jun 15.", time: "2h ago", type: "warning", read: false },
  { id: "n3", title: "Ticket update", description: "Support replied to 'Cannot access timesheet export'.", time: "4h ago", type: "ticket", read: false },
  { id: "n4", title: "Weekly report ready", description: "Maya Lin submitted her weekly report.", time: "1d ago", type: "info", read: true },
  { id: "n5", title: "Onboarding complete", description: "Priya Nair finished onboarding.", time: "2d ago", type: "success", read: true },
];

export const renewals: Renewal[] = [
  { id: "rn1", name: "Executive Assistant — Maya Lin", plan: "Full Time", renewalDate: "2026-06-22", amount: 2240, daysUntil: 8, status: "due_soon" },
  { id: "rn2", name: "Scale Plan Subscription", plan: "Scale", renewalDate: "2026-07-01", amount: 9680, daysUntil: 17, status: "auto_renew" },
  { id: "rn3", name: "Bookkeeper — Diego Santos", plan: "Full Time", renewalDate: "2026-07-12", amount: 2560, daysUntil: 28, status: "upcoming" },
  { id: "rn4", name: "Priority Support Pass", plan: "Add-on", renewalDate: "2026-07-19", amount: 199, daysUntil: 35, status: "upcoming" },
];

export const announcements: Announcement[] = [
  { id: "an1", title: "New: AI-powered weekly summaries", body: "Your Cyberbackers' weekly reports now include an AI digest highlighting wins, blockers, and next steps.", date: "Jun 13, 2026", tag: "Product", author: "Cyberbacker Team" },
  { id: "an2", title: "Scheduled maintenance — Jun 16", body: "The platform will undergo maintenance on Sunday 2:00–3:00 AM PHT. Time tracking continues uninterrupted.", date: "Jun 11, 2026", tag: "Maintenance", author: "Operations" },
  { id: "an3", title: "Refer a business, earn $250", body: "Our referral program is now live. Share your code and earn account credit when a referral signs.", date: "Jun 09, 2026", tag: "Community", author: "Growth Team" },
  { id: "an4", title: "Updated data processing policy", body: "We've refreshed our DPA to align with the latest regional privacy standards. No action needed.", date: "Jun 05, 2026", tag: "Policy", author: "Compliance" },
];

export const growthTrend: GrowthPoint[] = [
  { month: "Jan", clients: 248, cyberbackers: 392 },
  { month: "Feb", clients: 261, cyberbackers: 408 },
  { month: "Mar", clients: 274, cyberbackers: 431 },
  { month: "Apr", clients: 289, cyberbackers: 452 },
  { month: "May", clients: 301, cyberbackers: 474 },
  { month: "Jun", clients: 312, cyberbackers: 496 },
];

export const ticketVolume: TicketVolumePoint[] = [
  { month: "Jan", opened: 184, resolved: 171 },
  { month: "Feb", opened: 203, resolved: 196 },
  { month: "Mar", opened: 221, resolved: 214 },
  { month: "Apr", opened: 198, resolved: 205 },
  { month: "May", opened: 232, resolved: 226 },
  { month: "Jun", opened: 217, resolved: 228 },
];

export const retentionTrend: RetentionPoint[] = [
  { month: "Jan", retention: 93.8, churn: 6.2 },
  { month: "Feb", retention: 94.1, churn: 5.9 },
  { month: "Mar", retention: 94.6, churn: 5.4 },
  { month: "Apr", retention: 95.0, churn: 5.0 },
  { month: "May", retention: 95.4, churn: 4.6 },
  { month: "Jun", retention: 95.8, churn: 4.2 },
];
