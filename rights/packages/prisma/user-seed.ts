/**
 * user-seed.ts
 *
 * Seeds rich timeline events and community clusters for the actual
 * logged-in demo user's grievances so the UI shows real progress data.
 *
 * Run: pnpm --filter @repo/prisma db:seed:user
 */
import { PrismaClient, EventKind, Channel, EventSource } from '@prisma/client';

const prisma = new PrismaClient();

const ELECTRICITY_ID = 'cmoil0qwr000efemmkm7cu1n4'; // electricity surge, PIN 100010
const ROAD_ID = 'cmojgs4pz0002feop549xnn27';        // accident / broken road, PIN 160036
const OFFICER_ID = 'officer_commissioner_demo';
const OFFICER_NAME = 'Sh. R.K. Sharma, IPS';
const OFFICER_EMAIL = 'team@actionablejustice.dev';
const USER_ID = 'cmoic7tid0000fhcb230h60w5';

function daysAgo(n: number) {
  return new Date(Date.now() - n * 86_400_000);
}
function hoursAgo(n: number) {
  return new Date(Date.now() - n * 3_600_000);
}

async function main() {
  console.log('🌱  user-seed: adding events to your real grievances…');

  /* ── 1. Electricity grievance — full lifecycle ─────────── */
  await prisma.grievance.update({
    where: { id: ELECTRICITY_ID },
    data: { status: 'ESCALATED' },
  });

  await prisma.noticeEvent.createMany({
    skipDuplicates: true,
    data: [
      {
        id: 'ue_elec_ack',
        grievanceId: ELECTRICITY_ID,
        kind: EventKind.FOLLOWUP_7D,
        channel: Channel.EMAIL,
        source: EventSource.OFFICER,
        sentAt: hoursAgo(46),
        payload: {
          subject: 'Grievance Received – Electricity Surge Complaint',
          to: 'You',
          body: `Dear Citizen,\n\nYour grievance regarding the electricity surge that damaged your appliances has been received and registered under case PIN 100010.\n\nWe have forwarded your complaint to the concerned Distribution Sub-Station (DSS) officer. An inspection of the transformer and feeder line has been scheduled for tomorrow morning.\n\nPlease keep your original purchase receipts and photos of damaged appliances ready.\n\nRegards,\n${OFFICER_NAME}\nNodal Officer, Power & Utilities`,
        },
      },
      {
        id: 'ue_elec_inspect',
        grievanceId: ELECTRICITY_ID,
        kind: EventKind.USER_UPDATE,
        channel: Channel.SYSTEM,
        source: EventSource.OFFICER,
        sentAt: hoursAgo(38),
        payload: {
          subject: 'Field Inspection Completed – Fault Identified',
          to: 'You',
          body: `Dear Citizen,\n\nOur technical team visited the sub-station today. We have identified a blown surge arrestor on Feeder Line F-3 as the root cause of the voltage spike in your locality.\n\nThe faulty component has been replaced. A compensation form for damaged appliances is attached; please submit it with purchase invoices within 15 days at the local DISCOM office.\n\nRegards,\n${OFFICER_NAME}`,
        },
      },
      {
        id: 'ue_elec_user_followup',
        grievanceId: ELECTRICITY_ID,
        kind: EventKind.USER_UPDATE,
        channel: Channel.SYSTEM,
        source: EventSource.USER,
        sentAt: hoursAgo(26),
        payload: {
          body: 'The power is stable now but I have not received the compensation form yet. Can you please resend it? My TV (Samsung 43") is completely burnt and fridge compressor is damaged.',
        },
      },
      {
        id: 'ue_elec_escalated',
        grievanceId: ELECTRICITY_ID,
        kind: EventKind.ESCALATION_14D,
        channel: Channel.EMAIL,
        source: EventSource.SYSTEM,
        sentAt: hoursAgo(14),
        payload: {
          subject: 'Case Escalated to Divisional Engineer',
          escalatedTo: 'Divisional Engineer, Northern Zone – Er. Amit Kapoor',
          reason: 'Compensation form not delivered within SLA of 24 hours. Case auto-escalated per grievance SLA policy.',
        },
      },
      {
        id: 'ue_elec_de_reply',
        grievanceId: ELECTRICITY_ID,
        kind: EventKind.USER_UPDATE,
        channel: Channel.EMAIL,
        source: EventSource.OFFICER,
        sentAt: hoursAgo(8),
        payload: {
          subject: 'Compensation Form – Resent by Divisional Engineer',
          to: 'You',
          cc: OFFICER_EMAIL,
          body: `Dear Citizen,\n\nApologies for the delay. I am Er. Amit Kapoor, Divisional Engineer, Northern Zone, and I have taken note of your escalation.\n\nThe compensation form has been sent to your registered email address. Please also note that you may visit Sub-Division Office, Sector 5 between 10 AM–4 PM on any working day to get the form stamped.\n\nYour claim will be processed within 30 days as per DISCOM policy.\n\nRegards,\nEr. Amit Kapoor\nDivisional Engineer, Northern Zone`,
        },
      },
    ],
  });

  /* ── 2. Road / accident grievance — full lifecycle ─────── */
  await prisma.grievance.update({
    where: { id: ROAD_ID },
    data: { status: 'FOLLOWED_UP' },
  });

  await prisma.noticeEvent.createMany({
    skipDuplicates: true,
    data: [
      {
        id: 'ue_road_ack',
        grievanceId: ROAD_ID,
        kind: EventKind.FOLLOWUP_7D,
        channel: Channel.EMAIL,
        source: EventSource.OFFICER,
        sentAt: daysAgo(2),
        payload: {
          subject: 'Road Damage Complaint – Acknowledged',
          to: 'You',
          body: `Dear Citizen,\n\nYour grievance regarding road damage (pothole) leading to vehicle accident in PIN 160036 has been received.\n\nWe are sorry to hear about the damage to your vehicle. Your complaint has been forwarded to the Municipal Roads & Infrastructure Department with a priority tag (accident-related).\n\nA Road Safety Officer will inspect the site within 48 hours.\n\nRegards,\n${OFFICER_NAME}\nNodal Officer, Municipal Infrastructure`,
        },
      },
      {
        id: 'ue_road_inspect_sched',
        grievanceId: ROAD_ID,
        kind: EventKind.USER_UPDATE,
        channel: Channel.SYSTEM,
        source: EventSource.OFFICER,
        sentAt: daysAgo(1),
        payload: {
          subject: 'Site Inspection Completed – Pothole Marked Category-A',
          to: 'You',
          body: `Dear Citizen,\n\nThe Roads Inspector visited your reported location today. Photographs and GPS coordinates of the damaged stretch have been recorded.\n\nThe pothole (approx. 2.5 ft × 1.5 ft, depth 8 inches) has been marked as a Category-A hazard. Repair work has been approved under Emergency Road Maintenance Fund and is scheduled to begin within 5 working days.\n\nFor your vehicle damage claim, please file an FIR copy along with your repair estimate at the District Collectorate, Ward 7.\n\nRegards,\n${OFFICER_NAME}`,
        },
      },
      {
        id: 'ue_road_user_photos',
        grievanceId: ROAD_ID,
        kind: EventKind.USER_UPDATE,
        channel: Channel.SYSTEM,
        source: EventSource.USER,
        sentAt: hoursAgo(20),
        payload: {
          body: 'Thank you for the quick inspection. I have attached the car repair estimate (₹38,500) and FIR copy. Please let me know the next steps for the vehicle damage claim.',
        },
      },
      {
        id: 'ue_road_claim_confirm',
        grievanceId: ROAD_ID,
        kind: EventKind.USER_UPDATE,
        channel: Channel.EMAIL,
        source: EventSource.OFFICER,
        sentAt: hoursAgo(12),
        payload: {
          subject: 'Claim Documents Received – Under Review',
          to: 'You',
          body: `Dear Citizen,\n\nThank you for submitting the documents. Your vehicle damage claim of ₹38,500 is now under review by the Municipal Compensation Cell.\n\nYou will receive a decision within 21 working days. The claim reference number is MCL-2026-160036-004.\n\nRoad repair work at the reported location has also commenced today. Estimated completion: 3 days.\n\nRegards,\n${OFFICER_NAME}`,
        },
      },
    ],
  });

  /* ── 3. Community clusters for user's actual PINs ────────── */

  // Electricity cluster for PIN 100010
  const elecComm = await prisma.communityGrievance.upsert({
    where: { id: 'comm_elec_100010' },
    update: { count: 4 },
    create: {
      id: 'comm_elec_100010',
      pin: '100010',
      locality: 'Sector 12, North Zone',
      category: 'electricity',
      officerId: OFFICER_ID,
      status: 'ESCALATED',
      count: 4,
      emailSentAt: hoursAgo(30),
    },
  });

  await prisma.communityGrievanceMember.upsert({
    where: { communityGrievanceId_grievanceId: { communityGrievanceId: elecComm.id, grievanceId: ELECTRICITY_ID } },
    update: {},
    create: { communityGrievanceId: elecComm.id, grievanceId: ELECTRICITY_ID },
  });

  for (let i = 1; i <= 3; i++) {
    const g = await prisma.grievance.upsert({
      where: { id: `seed_elec_100010_${i}` },
      update: {},
      create: {
        id: `seed_elec_100010_${i}`,
        userId: USER_ID,
        officerId: OFFICER_ID,
        rawText: `Electricity surge damaged appliances — neighbour report ${i}`,
        status: 'FILED',
        urgency: 'NORMAL',
        category: 'electricity',
        statute: 'Electricity Act, 2003',
        section: 'Section 43',
        pin: '100010',
        locality: 'Sector 12, North Zone',
        filedAt: daysAgo(3 + i),
      },
    });
    await prisma.communityGrievanceMember.upsert({
      where: { communityGrievanceId_grievanceId: { communityGrievanceId: elecComm.id, grievanceId: g.id } },
      update: {},
      create: { communityGrievanceId: elecComm.id, grievanceId: g.id },
    });
  }

  // Road cluster for PIN 160036
  const roadComm = await prisma.communityGrievance.upsert({
    where: { id: 'comm_road_160036' },
    update: { count: 5 },
    create: {
      id: 'comm_road_160036',
      pin: '160036',
      locality: 'Sector 22-B, Chandigarh',
      category: 'property',
      officerId: OFFICER_ID,
      status: 'FOLLOWED_UP',
      count: 5,
      emailSentAt: hoursAgo(18),
    },
  });

  await prisma.communityGrievanceMember.upsert({
    where: { communityGrievanceId_grievanceId: { communityGrievanceId: roadComm.id, grievanceId: ROAD_ID } },
    update: {},
    create: { communityGrievanceId: roadComm.id, grievanceId: ROAD_ID },
  });

  for (let i = 1; i <= 4; i++) {
    const g = await prisma.grievance.upsert({
      where: { id: `seed_road_160036_${i}` },
      update: {},
      create: {
        id: `seed_road_160036_${i}`,
        userId: USER_ID,
        officerId: OFFICER_ID,
        rawText: `Vehicle damaged due to road pothole on main stretch — report ${i}`,
        status: 'FILED',
        urgency: 'NORMAL',
        category: 'property',
        statute: 'Motor Vehicles Act, 1988',
        section: 'Section 116',
        pin: '160036',
        locality: 'Sector 22-B, Chandigarh',
        filedAt: daysAgo(4 + i),
      },
    });
    await prisma.communityGrievanceMember.upsert({
      where: { communityGrievanceId_grievanceId: { communityGrievanceId: roadComm.id, grievanceId: g.id } },
      update: {},
      create: { communityGrievanceId: roadComm.id, grievanceId: g.id },
    });
  }

  console.log('\n✅  user-seed: done!');
  console.log('   • Electricity grievance → ESCALATED + 5 events');
  console.log('   • Road grievance        → FOLLOWED_UP + 4 events');
  console.log('   • Community cluster for PIN 100010 (electricity, 4 members)');
  console.log('   • Community cluster for PIN 160036 (property/road, 5 members)');
}

main().catch(console.error).finally(() => prisma.$disconnect());
