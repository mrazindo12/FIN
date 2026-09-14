import { PrismaClient, Role, SkillAxis, ApplicationStatus, SlaStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

/**
 * PHASE 5 EVALUATION SEEDING SCRIPT
 *
 * SAFETY GUARANTEE:
 * All host company contact Email addresses are strictly set to an evaluator-safe domain address
 * ('evaluator-safe@fortuneintern.com'). Real corporate domain emails (MTN, PwC, Stanchart, etc.)
 * are NEVER seeded to guarantee no evaluation testing sends live emails to real corporate inboxes.
 */

const SAFE_EVALUATOR_EMAIL = "evaluator-safe@fortuneintern.com";

const SEED_COMPANIES = [
  {
    name: "Standard Chartered Bank Ghana",
    address: "Standard Chartered Building, High Street, Accra, Ghana",
    contactEmail: SAFE_EVALUATOR_EMAIL,
    isCustom: false,
    isActive: true,
  },
  {
    name: "MTN Ghana (Scancom PLC)",
    address: "MTN House, Independence Avenue, Ridge, Accra, Ghana",
    contactEmail: SAFE_EVALUATOR_EMAIL,
    isCustom: false,
    isActive: true,
  },
  {
    name: "Enterprise Group PLC",
    address: "Advantage Place, Mayor Road, Ridge West, Accra, Ghana",
    contactEmail: SAFE_EVALUATOR_EMAIL,
    isCustom: false,
    isActive: true,
  },
  {
    name: "Hubtel Ghana",
    address: "Kokomlemle, Accra, Ghana",
    contactEmail: SAFE_EVALUATOR_EMAIL,
    isCustom: false,
    isActive: true,
  },
  {
    name: "Tullow Oil Ghana Limited",
    address: "35 Senchi Street, Airport Residential Area, Accra, Ghana",
    contactEmail: SAFE_EVALUATOR_EMAIL,
    isCustom: false,
    isActive: true,
  },
  {
    name: "CalBank PLC",
    address: "23 Independence Avenue, Ridge, Accra, Ghana",
    contactEmail: null, // Intentionally left null to test missing contactEmail guard in admin UI
    isCustom: false,
    isActive: true,
  },
  {
    name: "PricewaterhouseCoopers (PwC) Ghana",
    address: "PwC Tower, A4 Rangoon Lane, Cantonments City, Accra, Ghana",
    contactEmail: SAFE_EVALUATOR_EMAIL,
    isCustom: false,
    isActive: true,
  },
];

const SEED_COURSES = [
  {
    title: "Course 1: Professional Workplace Communication & Pitching",
    description: "Master corporate email etiquette, executive presentation skills, and active listening for professional environments.",
    order: 1,
    modules: [
      { title: "Module 1.1: Executive Email Etiquette & Professional Correspondence", content: "Learn standard business communication protocols, subject line optimization, and formal tone structure.", skillAxis: SkillAxis.COMMUNICATION, order: 1 },
      { title: "Module 1.2: Structuring 60-Second Elevator Pitches", content: "Master conciseness and value delivery when introducing yourself to corporate recruiters and senior leaders.", skillAxis: SkillAxis.COMMUNICATION, order: 2 },
      { title: "Module 1.3: Active Listening & Stakeholder Communication", content: "Learn active listening techniques, clarification strategies, and empathetic audience engagement.", skillAxis: SkillAxis.COMMUNICATION, order: 3 },
      { title: "Module 1.4: Managing Difficult Professional Conversations", content: "Strategies for resolving misunderstandings, de-escalating tension, and maintaining professional decorum.", skillAxis: SkillAxis.COMMUNICATION, order: 4 },
      { title: "Module 1.5: Cross-Departmental Reporting & Presentations", content: "Design effective slide decks and deliver clear verbal summaries to non-technical stakeholders.", skillAxis: SkillAxis.COMMUNICATION, order: 5 },
    ],
  },
  {
    title: "Course 2: Modern Software & Digital Engineering Foundations",
    description: "Core technical workflows covering Git version control, API integration, and cloud-native architecture.",
    order: 2,
    modules: [
      { title: "Module 2.1: Version Control & Git Collaboration Workflows", content: "Branching strategies, pull requests, code reviews, and resolving git merge conflicts in team repositories.", skillAxis: SkillAxis.TECHNICAL_SKILLS, order: 1 },
      { title: "Module 2.2: RESTful API Integration & Webhooks", content: "Understanding HTTP verbs, JSON payloads, authorization headers, and processing webhooks reliably.", skillAxis: SkillAxis.TECHNICAL_SKILLS, order: 2 },
      { title: "Module 2.3: Database Modeling & Relational Integrity", content: "SQL query optimization, primary/foreign keys, indexing strategies, and ORM abstractions.", skillAxis: SkillAxis.TECHNICAL_SKILLS, order: 3 },
      { title: "Module 2.4: Production Debugging & Incident Response", content: "Diagnosing runtime errors, reading server logs, inspecting stack traces, and writing defensive code.", skillAxis: SkillAxis.TECHNICAL_SKILLS, order: 4 },
    ],
  },
  {
    title: "Course 3: Analytical Problem Solving & Critical Thinking",
    description: "Root cause analysis methodologies, quantitative reasoning, and structured problem solving under pressure.",
    order: 3,
    modules: [
      { title: "Module 3.1: The 5 Whys & Root Cause Identification", content: "Systematic inquiry techniques to identify underlying system and business failures.", skillAxis: SkillAxis.PROBLEM_SOLVING, order: 1 },
      { title: "Module 3.2: Quantitative Data Interpretation for Decisions", content: "Analyzing numerical trends, ratios, and dataset anomalies to drive evidence-based business choices.", skillAxis: SkillAxis.PROBLEM_SOLVING, order: 2 },
      { title: "Module 3.3: Decision Matrix Frameworks & Trade-off Analysis", content: "Evaluating competing options using weighted scoring matrices and cost-benefit trade-offs.", skillAxis: SkillAxis.PROBLEM_SOLVING, order: 3 },
      { title: "Module 3.4: Crisis Management & Immediate Triage", content: "Prioritizing urgent tasks during system outages or operational emergencies.", skillAxis: SkillAxis.PROBLEM_SOLVING, order: 4 },
      { title: "Module 3.5: Hypothesis Testing & Prototyping", content: "Formulating testable hypotheses and validating quick prototypes before full-scale investment.", skillAxis: SkillAxis.PROBLEM_SOLVING, order: 5 },
    ],
  },
  {
    title: "Course 4: Agile Teamwork & Cross-Functional Collaboration",
    description: "Succeeding in agile sprint cycles, cross-functional project teams, and remote collaboration tools.",
    order: 4,
    modules: [
      { title: "Module 4.1: Agile Scrum Ceremonies & Standups", content: "Daily standup participation, sprint planning, backlog refinement, and retrospective feedback loops.", skillAxis: SkillAxis.TEAMWORK, order: 1 },
      { title: "Module 4.2: Asynchronous Remote Team Collaboration", content: "Effective communication across timezones using Slack, Notion, Jira, and shared documentation.", skillAxis: SkillAxis.TEAMWORK, order: 2 },
      { title: "Module 4.3: Peer Code Reviews & Constructive Feedback", content: "Delivering empathetic, objective feedback during code reviews and design critiques.", skillAxis: SkillAxis.TEAMWORK, order: 3 },
      { title: "Module 4.4: Conflict Resolution in Group Projects", content: "Navigating team disagreements constructively while keeping project goals on schedule.", skillAxis: SkillAxis.TEAMWORK, order: 4 },
    ],
  },
  {
    title: "Course 5: Leadership, Initiative & Organizational Adaptability",
    description: "Driving project ownership, adapting to shifting business priorities, and strategic initiative.",
    order: 5,
    modules: [
      { title: "Module 5.1: Ownership Mindset & Proactive Problem Hunting", content: "Taking end-to-end accountability for features without waiting for explicit step-by-step direction.", skillAxis: SkillAxis.LEADERSHIP, order: 1 },
      { title: "Module 5.2: Adapting to Pivots & Shifting Project Requirements", content: "Maintaining productivity and positive morale when specifications change mid-sprint.", skillAxis: SkillAxis.ADAPTABILITY, order: 2 },
      { title: "Module 5.3: Mentorship & Knowledge Transfer", content: "Documenting onboarding guides and mentoring junior teammates to elevate overall team capability.", skillAxis: SkillAxis.LEADERSHIP, order: 3 },
      { title: "Module 5.4: Stress Resilience & Time Prioritization", content: "Managing workload spikes, preventing burnout, and executing high-priority deliverables under tight deadlines.", skillAxis: SkillAxis.ADAPTABILITY, order: 4 },
      { title: "Module 5.5: Continuous Self-Directed Career Development", content: "Building a personal learning roadmap, seeking feedback, and mastering emerging industry tools.", skillAxis: SkillAxis.ADAPTABILITY, order: 5 },
    ],
  },
];

async function main() {
  console.log("=== FIN PHASE 5 EVALUATION PACKAGING & SEEDING ===");

  // 1. Seed / Rotate Staff Account
  const staffEmail = "admin@fortuneintern.com";
  const rotatedStaffPassword = await bcrypt.hash("StaffDemo2026!", 10);

  const staffUser = await prisma.user.upsert({
    where: { email: staffEmail },
    create: {
      email: staffEmail,
      passwordHash: rotatedStaffPassword,
      fullName: "FIN Admissions & Review Staff",
      role: Role.STAFF,
      phone: "+233 30 000 0000",
    },
    update: {
      passwordHash: rotatedStaffPassword,
      role: Role.STAFF,
    },
  });
  console.log(`+ Verified STAFF user: ${staffUser.email} (Password: StaffDemo2026!)`);

  // 2. Seed Host Companies with SAFE Evaluator Emails
  console.log("\n--- Seeding Host Companies (Safety-Enforced) ---");
  const seededCompaniesMap: Record<string, string> = {};

  for (const compData of SEED_COMPANIES) {
    let company = await prisma.company.findFirst({
      where: { name: compData.name },
    });

    if (!company) {
      company = await prisma.company.create({ data: compData });
      console.log(`+ Created host company: ${compData.name} (${compData.contactEmail || "No Email"})`);
    } else {
      company = await prisma.company.update({
        where: { id: company.id },
        data: { contactEmail: compData.contactEmail, address: compData.address },
      });
      console.log(`✓ Updated host company: ${compData.name} (${compData.contactEmail || "No Email"})`);
    }
    seededCompaniesMap[compData.name] = company.id;
  }

  // 3. Seed Courses & Modules
  console.log("\n--- Seeding Academy Curriculum (23 Modules) ---");
  const courseRecords: any[] = [];

  for (const courseData of SEED_COURSES) {
    const { modules, ...cData } = courseData;

    let course = await prisma.course.findFirst({
      where: { title: cData.title },
    });

    if (!course) {
      course = await prisma.course.create({ data: cData });
      console.log(`+ Created Course: ${course.title}`);
    } else {
      console.log(`✓ Existing Course: ${course.title}`);
    }

    const createdModules: any[] = [];
    for (const modData of modules) {
      let existingMod = await prisma.module.findFirst({
        where: {
          courseId: course.id,
          title: modData.title,
        },
      });

      if (!existingMod) {
        existingMod = await prisma.module.create({
          data: {
            ...modData,
            courseId: course.id,
          },
        });
      }
      createdModules.push(existingMod);
    }
    courseRecords.push({ course, modules: createdModules });
  }

  // 4. Seed Demo Student Account & Profile
  console.log("\n--- Seeding Demo Student Account & Profile ---");
  const studentEmail = "student@fortuneintern.com";
  const demoStudentPassword = await bcrypt.hash("StudentDemo2026!", 10);

  const studentUser = await prisma.user.upsert({
    where: { email: studentEmail },
    create: {
      email: studentEmail,
      passwordHash: demoStudentPassword,
      fullName: "Kwame Mensah",
      role: Role.STUDENT,
      phone: "+233 24 123 4567",
    },
    update: {
      passwordHash: demoStudentPassword,
      fullName: "Kwame Mensah",
    },
  });

  // Seed Student Profile
  await prisma.studentProfile.upsert({
    where: { userId: studentUser.id },
    create: {
      userId: studentUser.id,
      institution: "University of Ghana",
      programOfStudy: "BSc Computer Science",
      yearOfStudy: "Year 3 (Penultimate)",
      indexNumber: "10982345",
    },
    update: {
      institution: "University of Ghana",
      programOfStudy: "BSc Computer Science",
      yearOfStudy: "Year 3 (Penultimate)",
      indexNumber: "10982345",
    },
  });

  console.log(`+ Verified STUDENT user: ${studentUser.email} (Password: StudentDemo2026!)`);

  // 5. Seed Applications Across All 5 Stages for Demo Student
  console.log("\n--- Seeding Applications Across All 5 Stages ---");

  const appStagesConfig = [
    {
      companyName: "Standard Chartered Bank Ghana",
      status: ApplicationStatus.PENDING_PAYMENT,
      slaStatus: SlaStatus.ON_TRACK,
      letterSentAt: null,
      companyNotifiedAt: null,
    },
    {
      companyName: "MTN Ghana (Scancom PLC)",
      status: ApplicationStatus.APPLIED,
      slaStatus: SlaStatus.ON_TRACK,
      slaDeadlineAt: new Date(Date.now() + 72 * 60 * 60 * 1000), // 72h SLA
      letterSentAt: null,
      companyNotifiedAt: null,
    },
    {
      companyName: "Enterprise Group PLC",
      status: ApplicationStatus.REVIEW,
      slaStatus: SlaStatus.ON_TRACK,
      reviewedAt: new Date(),
      reviewedById: staffUser.id,
      letterSentAt: null,
      companyNotifiedAt: null,
    },
    {
      companyName: "Hubtel Ghana",
      status: ApplicationStatus.INTERVIEW,
      slaStatus: SlaStatus.ON_TRACK,
      reviewedAt: new Date(),
      reviewedById: staffUser.id,
      letterSentAt: null,
      companyNotifiedAt: null,
    },
    {
      companyName: "Tullow Oil Ghana Limited",
      status: ApplicationStatus.OFFER,
      slaStatus: SlaStatus.ON_TRACK,
      reviewedAt: new Date(),
      reviewedById: staffUser.id,
      // Intentionally keep letterSentAt and companyNotifiedAt NULL so evaluators can test click actions
      letterSentAt: null,
      companyNotifiedAt: null,
    },
  ];

  for (const appConfig of appStagesConfig) {
    const compId = seededCompaniesMap[appConfig.companyName];

    let app = await prisma.application.findFirst({
      where: {
        userId: studentUser.id,
        companyNameSnapshot: appConfig.companyName,
      },
    });

    if (!app) {
      await prisma.application.create({
        data: {
          userId: studentUser.id,
          companyId: compId || null,
          companyNameSnapshot: appConfig.companyName,
          companyAddressSnapshot: "Accra, Ghana",
          firstName: "Kwame",
          lastName: "Mensah",
          gender: "Male",
          phone: "+233 24 123 4567",
          email: studentUser.email,
          institution: "University of Ghana",
          programOfStudy: "BSc Computer Science",
          yearOfStudy: "Year 3 (Penultimate)",
          indexNumber: "10982345",
          coverLetter: "I am eager to contribute my software engineering skills to your organization.",
          status: appConfig.status,
          slaStatus: appConfig.slaStatus,
          slaDeadlineAt: appConfig.slaDeadlineAt || null,
          reviewedAt: appConfig.reviewedAt || null,
          reviewedById: appConfig.reviewedById || null,
          letterSentAt: appConfig.letterSentAt,
          companyNotifiedAt: appConfig.companyNotifiedAt,
        },
      });
      console.log(`+ Created Demo Application [${appConfig.status}] for ${appConfig.companyName}`);
    } else {
      await prisma.application.update({
        where: { id: app.id },
        data: {
          status: appConfig.status,
          letterSentAt: appConfig.letterSentAt,
          companyNotifiedAt: appConfig.companyNotifiedAt,
        },
      });
      console.log(`✓ Updated Demo Application [${appConfig.status}] for ${appConfig.companyName}`);
    }
  }

  // 6. Seed Academy Completions & Certificate for Demo Student
  console.log("\n--- Seeding Partial Academy Completions & Certificate ---");

  // Course 1 (All 5 modules completed)
  const course1 = courseRecords[0];
  if (course1) {
    for (const mod of course1.modules) {
      await prisma.moduleCompletion.upsert({
        where: {
          userId_moduleId: {
            userId: studentUser.id,
            moduleId: mod.id,
          },
        },
        create: {
          userId: studentUser.id,
          moduleId: mod.id,
        },
        update: {},
      });
    }

    // Seed Certificate for Course 1
    const certCode = "FIN-DEMO2026";
    await prisma.certificate.upsert({
      where: {
        userId_courseId: {
          userId: studentUser.id,
          courseId: course1.course.id,
        },
      },
      create: {
        userId: studentUser.id,
        courseId: course1.course.id,
        certificateCode: certCode,
      },
      update: {
        certificateCode: certCode,
      },
    });
    console.log(`+ Verified Earned Certificate: ${certCode} for ${course1.course.title}`);
  }

  // Course 2 (2 modules completed out of 4)
  const course2 = courseRecords[1];
  if (course2 && course2.modules.length >= 2) {
    for (let i = 0; i < 2; i++) {
      await prisma.moduleCompletion.upsert({
        where: {
          userId_moduleId: {
            userId: studentUser.id,
            moduleId: course2.modules[i].id,
          },
        },
        create: {
          userId: studentUser.id,
          moduleId: course2.modules[i].id,
        },
        update: {},
      });
    }
  }

  // Course 3 (1 module completed out of 5)
  const course3 = courseRecords[2];
  if (course3 && course3.modules.length >= 1) {
    await prisma.moduleCompletion.upsert({
      where: {
        userId_moduleId: {
          userId: studentUser.id,
          moduleId: course3.modules[0].id,
        },
      },
      create: {
        userId: studentUser.id,
        moduleId: course3.modules[0].id,
      },
      update: {},
    });
  }

  console.log("✓ Demo student academy progress populated (Partially-filled radar & line charts).");
  console.log("\n==================================================");
  console.log("   FIN PHASE 5 SEEDING COMPLETED SUCCESSFULLY!    ");
  console.log("==================================================");
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
