/**
 * Rich Demo Seed — Actionable Justice OS
 *
 * Adds realistic lifecycle events to existing grievances (filed → reply →
 * follow-up → escalation → resolution) and seeds community grievances for
 * the Local Issues page.
 *
 * Run: pnpm db:seed:rich
 * Safe to re-run — all records use deterministic IDs + upsert.
 */

import {
  PrismaClient,
  Urgency,
  GrievanceStatus,
  EventKind,
  EventSource,
  Channel,
} from '@prisma/client';

const prisma = new PrismaClient();

const DEMO_EMAIL = process.env.DEMO_OFFICER_EMAIL || 'team@actionablejustice.dev';

// ── Existing stable IDs from main seed ──────────────────────
const DEMO_USER_ID      = 'user_demo_kamakshi';
const G_HARASSMENT      = 'grievance_demo_harassment';
const G_NOISE           = 'grievance_demo_noise';
const G_ELECTRICITY     = 'grievance_demo_electricity';
const OFFICER_COMMISSIONER = 'officer_commissioner_demo';
const OFFICER_DCP          = 'officer_dcp_north_demo';
const OFFICER_ASI          = 'officer_asi_local_demo';

// ── Extra user IDs from performance seed ────────────────────
const PERF_USER_2 = 'perf_user_2'; // Mumbai
const PERF_USER_3 = 'perf_user_3'; // Bangalore
const PERF_USER_4 = 'perf_user_4'; // Chennai

async function main() {
  console.log('\n🌱 Rich demo seed starting…\n');

  // ──────────────────────────────────────────────────────────
  // 1. FULL LIFECYCLE — Harassment grievance (now RESOLVED)
  //    Commissioner receives → acknowledges → resolves
  // ──────────────────────────────────────────────────────────
  console.log('  ⚙️  Building harassment grievance lifecycle…');

  await prisma.grievance.update({
    where: { id: G_HARASSMENT },
    data: {
      status:     GrievanceStatus.RESOLVED,
      filedAt:    new Date('2026-04-20T10:00:00Z'),
      resolvedAt: new Date('2026-04-27T14:30:00Z'),
    },
  });

  const harassmentEvents = [
    {
      id:          'rich_h_officer_ack',
      grievanceId: G_HARASSMENT,
      kind:        EventKind.USER_UPDATE,
      channel:     Channel.SYSTEM,
      source:      EventSource.OFFICER,
      message:     'Your complaint has been received and logged. I have initiated an inquiry into the reported stalking incident near Connaught Place. A patrol has been deployed to the area.',
      payload: {
        from:    'Sh. R.K. Sharma, IPS — Commissioner of Police',
        message: 'Your complaint has been received and logged. I have initiated an inquiry into the reported stalking incident near Connaught Place. A patrol has been deployed to the area.',
        status:  'Under investigation',
      },
      sentAt: new Date('2026-04-21T09:15:00Z'),
    },
    {
      id:          'rich_h_officer_update1',
      grievanceId: G_HARASSMENT,
      kind:        EventKind.USER_UPDATE,
      channel:     Channel.SYSTEM,
      source:      EventSource.OFFICER,
      message:     'The suspect has been identified from CCTV footage. We have issued a notice under BNS Section 354D. The individual has been warned and a restraining order has been applied for. You will be contacted if any further action is required.',
      payload: {
        from:    'Sh. R.K. Sharma, IPS — Commissioner of Police',
        message: 'The suspect has been identified from CCTV footage. We have issued a notice under BNS Section 354D. The individual has been warned and a restraining order has been applied for. You will be contacted if any further action is required.',
        status:  'Notice issued to suspect',
      },
      sentAt: new Date('2026-04-24T16:00:00Z'),
    },
    {
      id:          'rich_h_citizen_update',
      grievanceId: G_HARASSMENT,
      kind:        EventKind.USER_UPDATE,
      channel:     Channel.SYSTEM,
      source:      EventSource.USER,
      message:     'Thank you for the quick action. The individual has stopped following me. I have not seen them since April 22nd.',
      payload: {
        message: 'Thank you for the quick action. The individual has stopped following me. I have not seen them since April 22nd.',
      },
      sentAt: new Date('2026-04-25T11:30:00Z'),
    },
    {
      id:          'rich_h_resolved',
      grievanceId: G_HARASSMENT,
      kind:        EventKind.USER_UPDATE,
      channel:     Channel.SYSTEM,
      source:      EventSource.OFFICER,
      message:     'We are pleased to inform you that this case has been resolved. The suspect has signed an undertaking and the restraining order is in effect. Case marked RESOLVED. If the individual contacts you again, call 112 immediately.',
      payload: {
        from:    'Sh. R.K. Sharma, IPS — Commissioner of Police',
        message: 'We are pleased to inform you that this case has been resolved. The suspect has signed an undertaking and the restraining order is in effect. Case marked RESOLVED. If the individual contacts you again, call 112 immediately.',
        status:  'RESOLVED',
        resolvedOn: '27 April 2026',
      },
      sentAt: new Date('2026-04-27T14:30:00Z'),
    },
  ];

  for (const e of harassmentEvents) {
    await prisma.noticeEvent.upsert({
      where:  { id: e.id },
      update: {},
      create: e,
    });
  }
  console.log(`    ✅ Harassment grievance — ${harassmentEvents.length} lifecycle events added, status → RESOLVED`);

  // ──────────────────────────────────────────────────────────
  // 2. ESCALATION LIFECYCLE — Noise complaint (stays ESCALATED)
  //    DCP replies → citizen notes more → escalated to Commissioner
  // ──────────────────────────────────────────────────────────
  console.log('  ⚙️  Building noise complaint escalation lifecycle…');

  const noiseEvents = [
    {
      id:          'rich_n_officer_ack',
      grievanceId: G_NOISE,
      kind:        EventKind.USER_UPDATE,
      channel:     Channel.SYSTEM,
      source:      EventSource.OFFICER,
      message:     'Complaint noted. The venue has been issued an initial verbal warning. We will monitor the situation over the next 7 days.',
      payload: {
        from:    'Sh. A.K. Verma, IPS — DCP North District',
        message: 'Complaint noted. The venue has been issued an initial verbal warning. We will monitor the situation over the next 7 days.',
        status:  'Verbal warning issued',
      },
      sentAt: new Date('2026-04-11T10:00:00Z'),
    },
    {
      id:          'rich_n_citizen_note',
      grievanceId: G_NOISE,
      kind:        EventKind.USER_UPDATE,
      channel:     Channel.SYSTEM,
      source:      EventSource.USER,
      message:     'The noise continued over the weekend (April 12–13). DJ was playing until 2 AM both nights. The verbal warning had no effect.',
      payload: {
        message: 'The noise continued over the weekend (April 12–13). DJ was playing until 2 AM both nights. The verbal warning had no effect.',
      },
      sentAt: new Date('2026-04-14T09:00:00Z'),
    },
    {
      id:          'rich_n_officer_2',
      grievanceId: G_NOISE,
      kind:        EventKind.USER_UPDATE,
      channel:     Channel.SYSTEM,
      source:      EventSource.OFFICER,
      message:     'A formal show-cause notice has been sent to the venue under the Noise Pollution Rules 2000. They have 3 days to respond or face a fine. Follow-up inspection scheduled.',
      payload: {
        from:    'Sh. A.K. Verma, IPS — DCP North District',
        message: 'A formal show-cause notice has been sent to the venue under the Noise Pollution Rules 2000. They have 3 days to respond or face a fine. Follow-up inspection scheduled.',
        status:  'Show-cause notice issued',
      },
      sentAt: new Date('2026-04-15T14:30:00Z'),
    },
    {
      id:          'rich_n_commissioner_ack',
      grievanceId: G_NOISE,
      kind:        EventKind.USER_UPDATE,
      channel:     Channel.SYSTEM,
      source:      EventSource.OFFICER,
      message:     'I have taken direct cognisance of this complaint following the 14-day escalation. A joint inspection by police and the municipal noise monitoring team has been ordered for this weekend. Venue licence suspension is under review.',
      payload: {
        from:    'Sh. R.K. Sharma, IPS — Commissioner of Police',
        message: 'I have taken direct cognisance of this complaint following the 14-day escalation. A joint inspection by police and the municipal noise monitoring team has been ordered for this weekend. Venue licence suspension is under review.',
        status:  'Commissioner oversight — escalated',
      },
      sentAt: new Date('2026-04-25T11:00:00Z'),
    },
  ];

  for (const e of noiseEvents) {
    await prisma.noticeEvent.upsert({
      where:  { id: e.id },
      update: {},
      create: e,
    });
  }
  console.log(`    ✅ Noise complaint — ${noiseEvents.length} events added`);

  // ──────────────────────────────────────────────────────────
  // 3. IN-PROGRESS — Electricity grievance (FILED → FOLLOWED_UP)
  //    ASI acknowledges → follow-up sent
  // ──────────────────────────────────────────────────────────
  console.log('  ⚙️  Building electricity grievance lifecycle…');

  await prisma.grievance.update({
    where: { id: G_ELECTRICITY },
    data: {
      status:  GrievanceStatus.FOLLOWED_UP,
      filedAt: new Date('2026-04-22T09:00:00Z'),
    },
  });

  const electricityEvents = [
    {
      id:          'rich_e_filed',
      grievanceId: G_ELECTRICITY,
      kind:        EventKind.FILED,
      channel:     Channel.EMAIL,
      source:      EventSource.SYSTEM,
      payload: {
        to:      DEMO_EMAIL,
        subject: 'Grievance Filed: Faulty Electricity Meter — New Delhi',
        templateVersion: '1.0',
      },
      sentAt: new Date('2026-04-22T09:01:00Z'),
    },
    {
      id:          'rich_e_officer_ack',
      grievanceId: G_ELECTRICITY,
      kind:        EventKind.USER_UPDATE,
      channel:     Channel.SYSTEM,
      source:      EventSource.OFFICER,
      message:     'Your complaint about faulty metering has been forwarded to the BSES Rajdhani meter testing department. A technician visit has been requested within 5 working days.',
      payload: {
        from:    'Sh. Pradeep Kumar — ASI, Delhi Police',
        message: 'Your complaint about faulty metering has been forwarded to the BSES Rajdhani meter testing department. A technician visit has been requested within 5 working days.',
        status:  'Forwarded to BSES',
        refNo:   'BSES-2026-04-089234',
      },
      sentAt: new Date('2026-04-23T11:00:00Z'),
    },
    {
      id:          'rich_e_followup',
      grievanceId: G_ELECTRICITY,
      kind:        EventKind.FOLLOWUP_7D,
      channel:     Channel.EMAIL,
      source:      EventSource.SYSTEM,
      payload: {
        to:            DEMO_EMAIL,
        subject:       'REMINDER: Electricity Meter Complaint Unresolved (7 days)',
        followupNumber: 1,
      },
      sentAt: new Date('2026-04-29T09:00:00Z'),
    },
  ];

  for (const e of electricityEvents) {
    await prisma.noticeEvent.upsert({
      where:  { id: e.id },
      update: {},
      create: e,
    });
  }
  console.log(`    ✅ Electricity grievance — ${electricityEvents.length} events added, status → FOLLOWED_UP`);

  // ──────────────────────────────────────────────────────────
  // 4. NEW GRIEVANCE — Road pothole (ESCALATED, with full chain)
  // ──────────────────────────────────────────────────────────
  console.log('  ⚙️  Creating road pothole grievance with full chain…');

  await prisma.grievance.upsert({
    where:  { id: 'rich_g_road' },
    update: {},
    create: {
      id:         'rich_g_road',
      userId:     DEMO_USER_ID,
      officerId:  OFFICER_DCP,
      rawText:    'There is a massive pothole on Lodi Road near Golf Links that has caused 3 accidents in the past week. It is not marked or barricaded. Requires urgent repair.',
      language:   'en',
      category:   'roads',
      urgency:    Urgency.HIGH,
      statute:    'Motor Vehicles Act, 1988',
      section:    'Section 116 — Road safety obligations',
      status:     GrievanceStatus.ESCALATED,
      pin:        '110001',
      locality:   'Lodi Road',
      lat:        28.5918,
      lng:        77.2273,
      filedAt:    new Date('2026-04-13T08:00:00Z'),
    },
  });

  const roadEvents = [
    {
      id: 'rich_r_filed', grievanceId: 'rich_g_road',
      kind: EventKind.FILED, channel: Channel.EMAIL, source: EventSource.SYSTEM,
      payload: { to: DEMO_EMAIL, subject: 'Grievance Filed: Road Pothole — Lodi Road, New Delhi' },
      sentAt: new Date('2026-04-13T08:01:00Z'),
    },
    {
      id: 'rich_r_officer_ack', grievanceId: 'rich_g_road',
      kind: EventKind.USER_UPDATE, channel: Channel.SYSTEM, source: EventSource.OFFICER,
      message: 'Your complaint has been forwarded to the Delhi PWD (Public Works Department) for inspection. The site has been marked for urgent review.',
      payload: { from: 'Sh. A.K. Verma, IPS — DCP North', message: 'Your complaint has been forwarded to the Delhi PWD (Public Works Department) for inspection. The site has been marked for urgent review.', status: 'Forwarded to PWD' },
      sentAt: new Date('2026-04-14T10:00:00Z'),
    },
    {
      id: 'rich_r_citizen', grievanceId: 'rich_g_road',
      kind: EventKind.USER_UPDATE, channel: Channel.SYSTEM, source: EventSource.USER,
      message: 'A 4th accident occurred today (April 19). A cyclist has been injured. Pothole is still unrepaired and no PWD visit has happened. This is now a safety emergency.',
      payload: { message: 'A 4th accident occurred today (April 19). A cyclist has been injured. Pothole is still unrepaired and no PWD visit has happened. This is now a safety emergency.' },
      sentAt: new Date('2026-04-19T18:00:00Z'),
    },
    {
      id: 'rich_r_followup', grievanceId: 'rich_g_road',
      kind: EventKind.FOLLOWUP_7D, channel: Channel.EMAIL, source: EventSource.SYSTEM,
      payload: { to: DEMO_EMAIL, subject: 'REMINDER: Road Safety Complaint Unresolved (7 days)', followupNumber: 1 },
      sentAt: new Date('2026-04-20T09:00:00Z'),
    },
    {
      id: 'rich_r_escalation', grievanceId: 'rich_g_road',
      kind: EventKind.ESCALATION_14D, channel: Channel.EMAIL, source: EventSource.SYSTEM,
      payload: { to: DEMO_EMAIL, ccParent: DEMO_EMAIL, subject: 'ESCALATION: Road Safety Complaint — Lodi Road (14 days, injury reported)', escalatedTo: 'Commissioner of Police' },
      sentAt: new Date('2026-04-27T09:00:00Z'),
    },
    {
      id: 'rich_r_commissioner', grievanceId: 'rich_g_road',
      kind: EventKind.USER_UPDATE, channel: Channel.SYSTEM, source: EventSource.OFFICER,
      message: 'I have personally directed the PWD Executive Engineer to repair this pothole within 48 hours. Barricades and warning lights have been placed at the site today. A progress report will be submitted to my office by April 29.',
      payload: { from: 'Sh. R.K. Sharma, IPS — Commissioner of Police', message: 'I have personally directed the PWD Executive Engineer to repair this pothole within 48 hours. Barricades and warning lights have been placed at the site today. A progress report will be submitted to my office by April 29.', status: 'Commissioner directive issued' },
      sentAt: new Date('2026-04-27T16:00:00Z'),
    },
  ];

  for (const e of roadEvents) {
    await prisma.noticeEvent.upsert({
      where: { id: e.id }, update: {}, create: e,
    });
  }
  console.log('    ✅ Road pothole grievance — 6 lifecycle events, status → ESCALATED');

  // ──────────────────────────────────────────────────────────
  // 5. COMMUNITY GRIEVANCES — Local Issues clusters
  // ──────────────────────────────────────────────────────────
  console.log('\n  ⚙️  Seeding community grievances for Local Issues page…');

  // Create a few extra individual grievances to link as members
  const extraGrievances = [
    // Delhi noise cluster (links with G_NOISE)
    {
      id: 'rich_cg_noise2', userId: DEMO_USER_ID, officerId: OFFICER_DCP,
      rawText: 'DJ music near my house until 1:30 AM every Saturday. Unacceptable noise levels.', language: 'en',
      category: 'noise', urgency: Urgency.HIGH, statute: 'Noise Pollution Rules, 2000', section: 'Rule 5',
      status: GrievanceStatus.FILED, pin: '110001', locality: 'Chandni Chowk',
      filedAt: new Date('2026-04-10T19:30:00Z'),
    },
    {
      id: 'rich_cg_noise3', userId: DEMO_USER_ID, officerId: OFFICER_DCP,
      rawText: 'Weekend DJ events in the area playing until past 2 AM with heavy bass. Multiple residents affected.', language: 'en',
      category: 'noise', urgency: Urgency.NORMAL, statute: 'Noise Pollution Rules, 2000', section: 'Rule 5',
      status: GrievanceStatus.FILED, pin: '110001', locality: 'Chandni Chowk',
      filedAt: new Date('2026-04-11T08:00:00Z'),
    },
    // Delhi roads cluster (links with rich_g_road)
    {
      id: 'rich_cg_road2', userId: DEMO_USER_ID, officerId: OFFICER_DCP,
      rawText: 'Multiple potholes near the Lodhi Garden stretch causing traffic slowdowns and vehicle damage.', language: 'en',
      category: 'roads', urgency: Urgency.HIGH, statute: 'Motor Vehicles Act, 1988', section: 'Section 116',
      status: GrievanceStatus.FILED, pin: '110001', locality: 'Lodi Road',
      filedAt: new Date('2026-04-14T07:00:00Z'),
    },
    // Mumbai consumer cluster
    {
      id: 'rich_cg_consumer1', userId: PERF_USER_2, officerId: 'perf_officer_mumbai_1',
      rawText: 'Online grocery platform delivered expired products. Refused refund and disconnected call.', language: 'en',
      category: 'consumer', urgency: Urgency.NORMAL, statute: 'Consumer Protection Act, 2019', section: 'Section 35',
      status: GrievanceStatus.FILED, pin: '400001', locality: 'Bandra',
      filedAt: new Date('2026-04-20T10:00:00Z'),
    },
    {
      id: 'rich_cg_consumer2', userId: PERF_USER_2, officerId: 'perf_officer_mumbai_1',
      rawText: 'Same grocery app sent rotten vegetables and closed the refund request without resolution.', language: 'en',
      category: 'consumer', urgency: Urgency.NORMAL, statute: 'Consumer Protection Act, 2019', section: 'Section 35',
      status: GrievanceStatus.FILED, pin: '400001', locality: 'Bandra',
      filedAt: new Date('2026-04-20T14:30:00Z'),
    },
    {
      id: 'rich_cg_consumer3', userId: PERF_USER_2, officerId: 'perf_officer_mumbai_1',
      rawText: 'Received expired dairy products from the same app. Filed complaint, no response in 5 days.', language: 'en',
      category: 'consumer', urgency: Urgency.NORMAL, statute: 'Consumer Protection Act, 2019', section: 'Section 35',
      status: GrievanceStatus.FILED, pin: '400001', locality: 'Bandra',
      filedAt: new Date('2026-04-21T09:00:00Z'),
    },
    // Chennai electricity cluster
    {
      id: 'rich_cg_elec1', userId: PERF_USER_4, officerId: 'perf_officer_chn_1',
      rawText: 'Power outage every afternoon between 2–5 PM for the past 2 weeks. No prior notice from TNEB.', language: 'en',
      category: 'electricity', urgency: Urgency.HIGH, statute: 'Electricity Act, 2003', section: 'Section 135',
      status: GrievanceStatus.FILED, pin: '600001', locality: 'Anna Nagar',
      filedAt: new Date('2026-04-15T16:00:00Z'),
    },
    {
      id: 'rich_cg_elec2', userId: PERF_USER_4, officerId: 'perf_officer_chn_1',
      rawText: 'Frequent power cuts in the afternoon disrupting work from home. No scheduled outage notice.', language: 'en',
      category: 'electricity', urgency: Urgency.HIGH, statute: 'Electricity Act, 2003', section: 'Section 135',
      status: GrievanceStatus.FILED, pin: '600001', locality: 'Anna Nagar',
      filedAt: new Date('2026-04-16T11:00:00Z'),
    },
  ];

  for (const g of extraGrievances) {
    await prisma.grievance.upsert({ where: { id: g.id }, update: {}, create: g });
  }

  // Create community grievances
  type CommunityInput = {
    id: string; pin: string; locality?: string; category: string;
    status: GrievanceStatus; count: number; officerId: string;
    emailSentAt?: Date; members: string[];
  };

  const communities: CommunityInput[] = [
    {
      id: 'rich_comm_noise_delhi', pin: '110001', locality: 'Chandni Chowk',
      category: 'noise', status: GrievanceStatus.ESCALATED, count: 3,
      officerId: OFFICER_DCP, emailSentAt: new Date('2026-04-11T12:00:00Z'),
      members: [G_NOISE, 'rich_cg_noise2', 'rich_cg_noise3'],
    },
    {
      id: 'rich_comm_roads_delhi', pin: '110001', locality: 'Lodi Road',
      category: 'roads', status: GrievanceStatus.ESCALATED, count: 2,
      officerId: OFFICER_DCP, emailSentAt: new Date('2026-04-14T10:00:00Z'),
      members: ['rich_g_road', 'rich_cg_road2'],
    },
    {
      id: 'rich_comm_consumer_mumbai', pin: '400001', locality: 'Bandra',
      category: 'consumer', status: GrievanceStatus.FILED, count: 3,
      officerId: 'perf_officer_mumbai_1', emailSentAt: new Date('2026-04-21T10:00:00Z'),
      members: ['rich_cg_consumer1', 'rich_cg_consumer2', 'rich_cg_consumer3'],
    },
    {
      id: 'rich_comm_elec_chennai', pin: '600001', locality: 'Anna Nagar',
      category: 'electricity', status: GrievanceStatus.FOLLOWED_UP, count: 2,
      officerId: 'perf_officer_chn_1', emailSentAt: new Date('2026-04-16T14:00:00Z'),
      members: ['rich_cg_elec1', 'rich_cg_elec2'],
    },
  ];

  for (const c of communities) {
    await prisma.communityGrievance.upsert({
      where:  { id: c.id },
      update: {},
      create: {
        id:          c.id,
        pin:         c.pin,
        locality:    c.locality,
        category:    c.category,
        status:      c.status,
        count:       c.count,
        officerId:   c.officerId,
        emailSentAt: c.emailSentAt,
      },
    });

    // Link members
    for (const grievanceId of c.members) {
      const memberId = `${c.id}_${grievanceId}`.slice(0, 64);
      await prisma.communityGrievanceMember.upsert({
        where:  { communityGrievanceId_grievanceId: { communityGrievanceId: c.id, grievanceId } },
        update: {},
        create: { id: memberId, communityGrievanceId: c.id, grievanceId },
      });
    }

    console.log(`    ✅ Community cluster: ${c.category} — ${c.pin} (${c.count} complaints)`);
  }

  // Add COMMUNITY_NOTICE events to the noise grievance so timeline shows it
  await prisma.noticeEvent.upsert({
    where:  { id: 'rich_comm_noise_event' },
    update: {},
    create: {
      id:          'rich_comm_noise_event',
      grievanceId: G_NOISE,
      kind:        EventKind.COMMUNITY_NOTICE,
      channel:     Channel.EMAIL,
      source:      EventSource.SYSTEM,
      payload: {
        to:            DEMO_EMAIL,
        subject:       'Community Alert: 3 noise complaints in Chandni Chowk, PIN 110001',
        clusterSize:   3,
        locality:      'Chandni Chowk',
        category:      'noise',
        message:       '3 residents in your area have reported the same noise issue. A combined community notice has been filed with the DCP North District.',
      },
      sentAt: new Date('2026-04-11T12:00:00Z'),
    },
  });

  // ──────────────────────────────────────────────────────────
  // 6. Summary
  // ──────────────────────────────────────────────────────────
  const counts = {
    grievances:  await prisma.grievance.count(),
    events:      await prisma.noticeEvent.count(),
    communities: await prisma.communityGrievance.count(),
  };

  console.log('\n📊 DB after rich seed:');
  console.log(`   Grievances:          ${counts.grievances}`);
  console.log(`   Timeline events:     ${counts.events}`);
  console.log(`   Community clusters:  ${counts.communities}`);
  console.log('\n✅ Rich seed complete.\n');
}

main()
  .catch((e) => { console.error('❌ Seed failed:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
