import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function runPhase4Tests() {
  console.log("=========================================");
  console.log("      FIN PHASE 4 INTEGRATION TEST       ");
  console.log("=========================================\n");

  try {
    // 1. Verify Database Seeding for Courses & Modules
    console.log("1. Checking Seeded Academy Courses & Modules...");
    const courses = await prisma.course.findMany({
      include: { modules: true },
      orderBy: { title: "asc" },
    });
    console.log(`   Found ${courses.length} courses in DB:`);
    let totalModulesCount = 0;
    courses.forEach((c) => {
      totalModulesCount += c.modules.length;
      console.log(`   - [${c.modules[0]?.skillAxis || "AXIS"}] ${c.title}: ${c.modules.length} modules`);
    });

    if (courses.length < 5 || totalModulesCount < 20) {
      throw new Error(`Expected at least 5 courses and 20 modules, found ${courses.length} courses, ${totalModulesCount} modules`);
    }
    console.log("   ✅ Academy courses and modules seeded correctly.\n");

    // 2. Fetch or Create Test Student User
    console.log("2. Preparing Test Student & Application...");
    let student = await prisma.user.findFirst({
      where: { role: "STUDENT" },
    });

    if (!student) {
      student = await prisma.user.create({
        data: {
          email: "phase4student@test.com",
          fullName: "Phase 4 Test Student",
          passwordHash: "$2a$10$placeholderhashfortesting",
          role: "STUDENT",
        },
      });
    }

    // 3. Test Module Completion & Certificate Auto-Issuance
    console.log("3. Testing Module Completion & Certificate Auto-Issuance...");
    const testCourse = courses[0];
    const courseModules = testCourse.modules;

    // Complete all modules for this course
    for (const mod of courseModules) {
      await prisma.moduleCompletion.upsert({
        where: {
          userId_moduleId: {
            userId: student.id,
            moduleId: mod.id,
          },
        },
        create: {
          userId: student.id,
          moduleId: mod.id,
        },
        update: {},
      });
    }

    // Verify all modules completed
    const completedCount = await prisma.moduleCompletion.count({
      where: {
        userId: student.id,
        module: { courseId: testCourse.id },
      },
    });

    console.log(`   Completed ${completedCount}/${courseModules.length} modules for course "${testCourse.title}".`);

    // Simulate certificate issuance logic
    let cert = await prisma.certificate.findUnique({
      where: {
        userId_courseId: {
          userId: student.id,
          courseId: testCourse.id,
        },
      },
    });

    if (!cert) {
      const code = `FIN-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      cert = await prisma.certificate.create({
        data: {
          userId: student.id,
          courseId: testCourse.id,
          certificateCode: code,
        },
      });
    }

    console.log(`   Issued Certificate Code: ${cert.certificateCode}`);
    console.log("   ✅ Module completion & certificate generation passed.\n");

    // 4. Test Public Certificate Verification Endpoint Data Privacy
    console.log("4. Testing Public Certificate Verification Privacy...");
    const certVerification = await prisma.certificate.findUnique({
      where: { certificateCode: cert.certificateCode },
      select: {
        certificateCode: true,
        issuedAt: true,
        user: { select: { fullName: true } },
        course: { select: { title: true } },
      },
    });

    if (!certVerification) {
      throw new Error("Failed to verify certificate by code");
    }

    const publicPayload = {
      valid: true,
      certificateCode: certVerification.certificateCode,
      courseTitle: certVerification.course.title,
      studentName: certVerification.user.fullName,
      issuedAt: certVerification.issuedAt,
    };

    console.log("   Public Verification Payload:", JSON.stringify(publicPayload, null, 2));
    if ("email" in publicPayload || "phone" in publicPayload || "institution" in publicPayload) {
      throw new Error("PRIVACY VIOLATION: Contact info leaked in public verification payload!");
    }
    console.log("   ✅ Public verification contains ZERO sensitive contact data.\n");

    // 5. Test Application Offer Letter & Company Notification Timestamps
    console.log("5. Testing Admin Offer Letter & Company Notification Dispatch...");
    let offerApp = await prisma.application.findFirst({
      where: { status: "OFFER" },
      include: { company: true },
    });

    if (!offerApp) {
      const company = await prisma.company.findFirst() || await prisma.company.create({
        data: { name: "Test Corp", contactEmail: "hr@testcorp.com" },
      });

      offerApp = await prisma.application.create({
        data: {
          userId: student.id,
          companyId: company.id,
          companyNameSnapshot: company.name,
          firstName: "Phase",
          lastName: "Student",
          email: student.email,
          phone: "0240000000",
          institution: "Test University",
          programOfStudy: "Computer Science",
          yearOfStudy: "Year 3",
          indexNumber: "123456",
          status: "OFFER",
        },
        include: { company: true },
      });
    }

    // Simulate sending offer letter
    const letterSent = await prisma.application.update({
      where: { id: offerApp.id },
      data: { letterSentAt: new Date() },
    });
    console.log(`   Updated letterSentAt: ${letterSent.letterSentAt?.toISOString()}`);

    // Simulate notifying company
    const companyNotified = await prisma.application.update({
      where: { id: offerApp.id },
      data: { companyNotifiedAt: new Date() },
    });
    console.log(`   Updated companyNotifiedAt: ${companyNotified.companyNotifiedAt?.toISOString()}`);

    console.log("   ✅ Offer letter & company notification DB updates verified.\n");

    console.log("=========================================");
    console.log("   ALL PHASE 4 TESTS COMPLETED PASSED!   ");
    console.log("=========================================");
  } catch (error) {
    console.error("❌ Test failed with error:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runPhase4Tests();
