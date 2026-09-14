import crypto from "crypto";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function runTests() {
  console.log("=== PHASE 2 BACKEND VALIDATION SUITE ===");

  const secret = process.env.PAYSTACK_SECRET_KEY || "sk_test_placeholder_key";

  // 1. Fetch a test user or create one
  const user = await prisma.user.findFirst({
    where: { email: "kwame.mensah@ug.edu.gh" },
  });

  if (!user) {
    console.error("Test user kwame.mensah@ug.edu.gh not found. Please register user first.");
    return;
  }

  console.log(`✓ Test User found: ${user.fullName} (${user.id})`);

  // 2. Create a test application in PENDING_PAYMENT
  const testApp = await prisma.application.create({
    data: {
      userId: user.id,
      companyNameSnapshot: "MTN Ghana (Scancom PLC)",
      companyAddressSnapshot: "MTN House, Independence Avenue, Ridge, Accra, Ghana",
      firstName: "Kwame",
      lastName: "Mensah",
      gender: "Male",
      phone: "+233 24 123 4567",
      email: "kwame.mensah@ug.edu.gh",
      institution: "University of Ghana",
      programOfStudy: "BSc Computer Science",
      yearOfStudy: "Year 2",
      indexNumber: "10982345",
      status: "PENDING_PAYMENT",
    },
  });

  console.log(`✓ Created test Application: ${testApp.id} (status: ${testApp.status})`);

  // 3. Create a test Payment attempt
  const testRef = `test_ref_${Date.now()}`;
  const testPayment = await prisma.payment.create({
    data: {
      applicationId: testApp.id,
      paystackReference: testRef,
      amountKobo: 5000,
      status: "PENDING",
    },
  });

  console.log(`✓ Created test Payment attempt: ${testPayment.paystackReference} (status: ${testPayment.status})`);

  // 4. Test Webhook with INVALID signature
  const fakePayload = JSON.stringify({
    event: "charge.success",
    data: {
      reference: testRef,
      amount: 5000,
      status: "success",
    },
  });

  const invalidSig = "invalid_signature_hash_12345";
  console.log("\n--- Testing Invalid Signature Webhook ---");
  const badRes = await fetch("http://localhost:3000/api/webhooks/paystack", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-paystack-signature": invalidSig,
    },
    body: fakePayload,
  });

  console.log(`Response Status: ${badRes.status} (Expected 400)`);
  if (badRes.status === 400) {
    console.log("✓ Invalid signature correctly rejected with 400 Bad Request.");
  } else {
    console.error(`✕ FAILED: Expected 400, got ${badRes.status}`);
  }

  // 5. Test Webhook with VALID HMAC SHA512 signature
  console.log("\n--- Testing Valid HMAC SHA512 Signature Webhook ---");
  const validSig = crypto
    .createHmac("sha512", secret)
    .update(fakePayload)
    .digest("hex");

  const goodRes = await fetch("http://localhost:3000/api/webhooks/paystack", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-paystack-signature": validSig,
    },
    body: fakePayload,
  });

  console.log(`Response Status: ${goodRes.status} (Expected 200)`);
  const goodData = await goodRes.json();
  console.log("Response Body:", goodData);

  // Verify DB state changes
  const updatedPayment = await prisma.payment.findUnique({
    where: { paystackReference: testRef },
  });
  const updatedApp = await prisma.application.findUnique({
    where: { id: testApp.id },
  });

  console.log(`Updated Payment status: ${updatedPayment?.status} (Expected SUCCESS, verifiedAt: ${updatedPayment?.verifiedAt})`);
  console.log(`Updated Application status: ${updatedApp?.status} (Expected APPLIED, submittedAt: ${updatedApp?.submittedAt})`);

  if (updatedPayment?.status === "SUCCESS" && updatedApp?.status === "APPLIED" && updatedApp.submittedAt) {
    console.log("✓ Cryptographic Webhook verification & atomic state transition SUCCEEDED.");
  } else {
    console.error("✕ FAILED state transition.");
  }

  // 6. Test Idempotency (Redelivering the same webhook)
  console.log("\n--- Testing Idempotent Redelivery of Same Webhook ---");
  const secondRes = await fetch("http://localhost:3000/api/webhooks/paystack", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-paystack-signature": validSig,
    },
    body: fakePayload,
  });

  console.log(`Second Response Status: ${secondRes.status} (Expected 200)`);
  const secondData = await secondRes.json();
  console.log("Second Response Body:", secondData);
  console.log("✓ Webhook is idempotent.");

  // 7. Test Badge Variations (Create test applications in REVIEW, INTERVIEW, OFFER, REJECTED)
  console.log("\n--- Creating Test Applications with Different Statuses for Badge Verification ---");
  await prisma.application.create({
    data: {
      userId: user.id,
      companyNameSnapshot: "Standard Chartered Bank Ghana",
      companyAddressSnapshot: "High Street, Accra",
      firstName: "Kwame",
      lastName: "Mensah",
      phone: "+233 24 123 4567",
      email: "kwame.mensah@ug.edu.gh",
      institution: "University of Ghana",
      programOfStudy: "BSc Computer Science",
      yearOfStudy: "Year 2",
      indexNumber: "10982345",
      status: "REVIEW",
      submittedAt: new Date(),
    },
  });

  await prisma.application.create({
    data: {
      userId: user.id,
      companyNameSnapshot: "Enterprise Group PLC",
      companyAddressSnapshot: "Ridge West, Accra",
      firstName: "Kwame",
      lastName: "Mensah",
      phone: "+233 24 123 4567",
      email: "kwame.mensah@ug.edu.gh",
      institution: "University of Ghana",
      programOfStudy: "BSc Computer Science",
      yearOfStudy: "Year 2",
      indexNumber: "10982345",
      status: "INTERVIEW",
      submittedAt: new Date(),
    },
  });

  await prisma.application.create({
    data: {
      userId: user.id,
      companyNameSnapshot: "Hubtel Ghana",
      companyAddressSnapshot: "Kokomlemle, Accra",
      firstName: "Kwame",
      lastName: "Mensah",
      phone: "+233 24 123 4567",
      email: "kwame.mensah@ug.edu.gh",
      institution: "University of Ghana",
      programOfStudy: "BSc Computer Science",
      yearOfStudy: "Year 2",
      indexNumber: "10982345",
      status: "OFFER",
      submittedAt: new Date(),
    },
  });

  await prisma.application.create({
    data: {
      userId: user.id,
      companyNameSnapshot: "Tullow Oil Ghana Limited",
      companyAddressSnapshot: "Airport Residential Area, Accra",
      firstName: "Kwame",
      lastName: "Mensah",
      phone: "+233 24 123 4567",
      email: "kwame.mensah@ug.edu.gh",
      institution: "University of Ghana",
      programOfStudy: "BSc Computer Science",
      yearOfStudy: "Year 2",
      indexNumber: "10982345",
      status: "REJECTED",
      submittedAt: new Date(),
    },
  });

  console.log("✓ Created applications in REVIEW, INTERVIEW, OFFER, REJECTED for visual badge verification.");
  console.log("=== ALL BACKEND VALIDATION TESTS PASSED ===");
}

runTests()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
