import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function runPhase5Tests() {
  console.log("=========================================");
  console.log("      FIN PHASE 5 INTEGRATION TEST       ");
  console.log("=========================================\n");

  try {
    // 1. SAFETY FIX: Verify No Real Corporate Emails Seeded
    console.log("1. Verifying Safety Fix (No Real Corporate Emails)...");
    const companies = await prisma.company.findMany();
    const unsafeDomains = ["sc.com", "mtn.com.gh", "enterprisegroup.com.gh", "hubtel.com", "tullowoil.com", "pwc.com.gh"];

    for (const comp of companies) {
      if (comp.contactEmail) {
        const isUnsafe = unsafeDomains.some((domain) => comp.contactEmail?.toLowerCase().includes(domain));
        if (isUnsafe) {
          throw new Error(`SAFETY VIOLATION: Real corporate email found on company "${comp.name}": ${comp.contactEmail}`);
        }
      }
      console.log(`   - [SAFE] ${comp.name}: ${comp.contactEmail || "(null)"}`);
    }
    console.log("   ✅ Safety fix verified: Zero real corporate emails seeded.\n");

    // 2. Verify Demo Student Account & Profile
    console.log("2. Verifying Demo Student Account & Profile...");
    const demoStudent = await prisma.user.findUnique({
      where: { email: "student@fortuneintern.com" },
      include: { profile: true, applications: true, completions: true, certificates: true },
    });

    if (!demoStudent) {
      throw new Error("Demo student 'student@fortuneintern.com' not found!");
    }
    if (!demoStudent.profile) {
      throw new Error("Demo student profile missing!");
    }

    console.log(`   Demo Student: ${demoStudent.fullName} (${demoStudent.email})`);
    console.log(`   Profile: ${demoStudent.profile.institution} - ${demoStudent.profile.programOfStudy}`);
    console.log("   ✅ Demo student account & profile verified.\n");

    // 3. Verify Applications Across All 5 Stages
    console.log("3. Verifying Demo Student Applications (All 5 Stages)...");
    const appStatuses = demoStudent.applications.map((app) => app.status);
    console.log("   Seeded Application Stages:", appStatuses);

    const requiredStages = ["PENDING_PAYMENT", "APPLIED", "REVIEW", "INTERVIEW", "OFFER"];
    for (const stage of requiredStages) {
      if (!appStatuses.includes(stage as any)) {
        throw new Error(`Missing demo application for stage '${stage}'!`);
      }
    }

    // Verify OFFER stage application has letterSentAt and companyNotifiedAt NULL
    const offerApp = demoStudent.applications.find((app) => app.status === "OFFER");
    if (!offerApp) {
      throw new Error("Missing OFFER stage application!");
    }
    if (offerApp.letterSentAt !== null || offerApp.companyNotifiedAt !== null) {
      throw new Error("OFFER application should have letterSentAt and companyNotifiedAt NULL for evaluation testing!");
    }
    console.log("   ✅ All 5 application stages present; OFFER application ready for evaluation clicks.\n");

    // 4. Verify Demo Student Academy Progress & Certificate
    console.log("4. Verifying Academy Progress & Earned Certificate...");
    console.log(`   Completed Modules: ${demoStudent.completions.length}`);
    console.log(`   Certificates Earned: ${demoStudent.certificates.length}`);

    if (demoStudent.completions.length === 0) {
      throw new Error("Demo student should have partial academy completions!");
    }
    if (demoStudent.certificates.length === 0) {
      throw new Error("Demo student should have at least 1 earned certificate!");
    }

    const demoCert = demoStudent.certificates[0];
    console.log(`   Certificate Code: ${demoCert.certificateCode}`);
    console.log("   ✅ Academy progress & certificate verified.\n");

    // 5. Verify Demo Staff Account
    console.log("5. Verifying Demo Staff Account...");
    const demoStaff = await prisma.user.findUnique({
      where: { email: "admin@fortuneintern.com" },
    });

    if (!demoStaff || demoStaff.role !== "STAFF") {
      throw new Error("Demo staff 'admin@fortuneintern.com' missing or invalid role!");
    }
    console.log(`   Demo Staff: ${demoStaff.fullName} (${demoStaff.email}) - Role: ${demoStaff.role}`);
    console.log("   ✅ Demo staff account verified.\n");

    console.log("=========================================");
    console.log("   ALL PHASE 5 TESTS COMPLETED PASSED!   ");
    console.log("=========================================");
  } catch (error) {
    console.error("❌ Test failed with error:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runPhase5Tests();
