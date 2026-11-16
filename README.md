Real-Time Blood Donation & Supply Coordinator: MVP Document
Real-Time Blood Donation & Supply
Coordinator: MVP Document
Stack: MongoDB, Express, React, Node.js (MERN) + Socket.IO, Redis, Twilio Status: Draft
v1.0 Audience: Engineering, product, hospital/blood bank stakeholders
1. Overview
Hospitals regularly face sudden shortages of specific blood types. Today, coordination
happens through phone calls and manual lists, which is slow when minutes matter. This
platform connects hospitals, blood banks and registered donors, and instantly alerts
eligible nearby donors when a hospital declares an emergency shortage.
One-line pitch: When a hospital declares a shortage, every compatible, eligible donor
within range is alerted in seconds, and the hospital sees responses live.
2. Goals and Non-Goals
MVP goals
A hospital can declare an emergency for a blood type, quantity and urgency in under
30 seconds.
Matching donors within a configurable radius are alerted in real time (in-app via
WebSocket, plus SMS fallback).
Donors can accept or decline, and the hospital sees live responses.
Blood banks and hospitals can maintain a simple inventory view by blood type.
Donor eligibility (cooldown period) is respected automatically.
Non-goals (post-MVP)
Payments, incentives or rewards
Native mobile apps (MVP is a responsive PWA)
Integration with hospital information systems (HL7/FHIR)
Component-level tracking (plasma, platelets) and full cold-chain logistics
AI demand forecasting
Page 1 of 12Real-Time Blood Donation & Supply Coordinator: MVP Document
3. Users and Personas
PersonaNeeds
DonorRegister once, get alerted only when relevant,
respond in one tap, see donation history and next
eligible date
Hospital coordinatorDeclare an emergency fast, see who is coming and
their ETA, close the request when fulfilled
Blood bank staffUpdate inventory, see regional shortages, respond
to hospital requests
Platform adminVerify hospitals and blood banks, monitor alerts,
handle abuse
4. Core User Flows
4.1 Emergency alert flow (the heart of the MVP)
1. Hospital coordinator submits an emergency: blood type, units needed, urgency,
needed-by time.
2. API validates the request and stores it with status open .
3. Matching service finds eligible donors using a MongoDB $near query plus blood-
type compatibility and cooldown filters.
4. Online donors receive a Socket.IO event instantly. Offline donors receive SMS
through a background job queue.
5. Donor taps I can come or Can't make it. The hospital dashboard updates live.
6. If responses are below the units needed after a timeout, the system expands the
search radius and re-alerts (escalation).
7. When enough donors are confirmed or the coordinator closes the request, status
changes to fulfilled or closed , and remaining donors are notified.
4.2 Donor onboarding
Sign up with phone (OTP verified), blood type, date of birth, last donation date, location
consent, and alert preferences (radius, quiet hours).
Page 2 of 12Real-Time Blood Donation & Supply Coordinator: MVP Document
4.3 Inventory update
Blood bank or hospital staff adjust units by blood type. If units fall below a threshold, the
system suggests declaring a shortage.
5. Functional Requirements
5.1 Must have (MVP)
JWT authentication with roles: donor , hospital , bloodbank , admin
Phone OTP verification for donors
Donor profile with GeoJSON location and availability toggle
Hospital/blood bank registration with admin verification
Emergency request create, view, update, close
Geospatial donor matching with blood compatibility
Real-time alerts and responses via Socket.IO
SMS fallback via Twilio through a background queue
Hospital live dashboard (responses, confirmed count, ETA)
Donor eligibility enforcement (default 56 days between whole-blood donations,
configurable)
Basic inventory by blood type
Audit log of alerts sent
5.2 Should have
Radius escalation rounds
Donor quiet hours and daily alert cap
Donation history and confirmation by hospital after arrival
Email notifications
5.3 Could have (later)
Web push notifications
Map view of responders heading to hospital
Multi-language alerts
Analytics dashboard
Page 3 of 12Real-Time Blood Donation & Supply Coordinator: MVP Document
6. System Architecture
React PWA <--HTTPS/REST--> Express API <--> MongoDB (2dsphere)
^
|
|
+--> Redis (BullMQ queues, Socket.IO
adapter)
+----WebSocket (Socket.IO)---+
|
+--> Worker --> Twilio SMS
LayerChoiceReason
FrontendReact + Vite, React Router, TanStack
Query, LeafletFast PWA, free map tiles
BackendNode.js + ExpressStandard MERN, easy Socket.IO
integration
Real-
timeSocket.IO with Redis adapterRooms, reconnection, scales
across instances
DatabaseMongoDB + MongooseNative geospatial support
QueueBullMQ + RedisRetries and rate limiting for SMS
SMSTwilio (or a regional provider)Delivery receipts and reliability
AuthJWT (access + refresh), bcryptSimple and stateless
HostingRender/Railway/AWS, MongoDB AtlasQuick MVP deployment
7. Data Models
7.1 User (donor fields shown)
const userSchema = new Schema({
role: { type: String, enum: ['donor','hospital','bloodbank','admin'] },
name: String,
phone: { type: String, unique: true },
phoneVerified: { type: Boolean, default: false },
passwordHash: String,
donor: {
bloodType: { type: String, enum: ['A+','A-','B+','B-','AB+','AB-
Page 4 of 12Real-Time Blood Donation & Supply Coordinator: MVP Document
','O+','O-'] },
dob: Date,
lastDonationAt: Date,
available: { type: Boolean, default: true },
radiusKm: { type: Number, default: 15 },
quietHours: { start: String, end: String },
location: {
type: { type: String, enum: ['Point'], default: 'Point' },
coordinates: [Number] // [longitude, latitude]
},
locationUpdatedAt: Date
},
orgId: { type: Schema.Types.ObjectId, ref: 'Organization' }
}, { timestamps: true });
userSchema.index({ 'donor.location': '2dsphere' });
userSchema.index({ 'donor.bloodType': 1, 'donor.available': 1 });
7.2 Organization (hospital or blood bank)
name , type , address , location (GeoJSON Point, 2dsphere indexed),
contactPhone , verified , inventory (map of blood type to units, plus
lowThreshold )
7.3 EmergencyRequest
orgId , bloodType , unitsNeeded , urgency ( critical , urgent , standard ),
neededBy
status : open , fulfilled , closed , expired
location (copied from the org), currentRadiusKm , escalationRound
createdBy , closedAt , notes
7.4 AlertDelivery
requestId , donorId , channel ( socket , sms ), status ( queued , sent ,
delivered , failed ), sentAt
response ( accepted , declined , none ), respondedAt , etaMinutes
Unique index on (requestId, donorId) prevents duplicate alerts.
Page 5 of 12Real-Time Blood Donation & Supply Coordinator: MVP Document
7.5 Donation
donorId , orgId , requestId , donatedAt , confirmedBy
8. Geospatial Matching
Donor matching query (coordinates are [lng, lat] , distance in meters):
const donors = await User.find({
role: 'donor',
'donor.available': true,
'donor.bloodType': { $in: compatibleDonorTypes(request.bloodType) },
$or: [
{ 'donor.lastDonationAt': { $lte: eligibleBefore } },
{ 'donor.lastDonationAt': null }
],
'donor.location': {
$near: {
$geometry: request.location,
$maxDistance: request.currentRadiusKm * 1000
}
}
}).limit(200);
Notes
$near requires a 2dsphere index and returns results sorted nearest first.
If you later need aggregation, use $geoNear as the first pipeline stage.
Use each donor's own radiusKm as a second filter in code so donors are not alerted
beyond their preference.
Filter out donors in quiet hours (except critical urgency, which is a product
decision to confirm).
Cap the first wave (for example 50 nearest donors) and widen in later rounds to avoid
over-alerting.
Blood type compatibility (red cells)
Patient needsCompatible donors
O-O-
Page 6 of 12Real-Time Blood Donation & Supply Coordinator: MVP Document
Patient needsCompatible donors
O+O-, O+
A-O-, A-
A+O-, O+, A-, A+
B-O-, B-
B+O-, O+, B-, B+
AB-O-, A-, B-, AB-
AB+All types
Keep this as a single lookup map in code so it can be reviewed by a medical advisor.
9. Real-Time Design
Socket.IO rooms
donor:{userId} : personal alerts
hospital:{orgId} : live responses for that hospital
region:{geohash} (optional): broadcast to nearby clients
Events
EventDirectionPayload
emergency:newserver to donorrequestId, hospital, bloodType, distanceKm,
urgency
emergency:responddonor to serverrequestId, response, etaMinutes
emergency:updateserver to
hospitalrequestId, accepted count, declined count,
donor ETAs
emergency:closedserver to donorsrequestId, reason
location:updatedonor to servercoordinates (throttled)
Page 7 of 12Real-Time Blood Donation & Supply Coordinator: MVP Document
Sockets authenticate with the JWT during the handshake. Every response is also writable
over REST so the flow works if the socket drops.
10. Background Jobs and SMS
Queue: alerts (send SMS), escalation (delayed jobs), reminders (eligibility
notices).
When a request is created, enqueue an SMS job for every matched donor who is not
currently connected. Connected donors get the socket alert first, with SMS only if no
response after a short delay (for example 60 seconds).
SMS content: short, with a response link such as https://app.example/r/{token} ,
using a signed single-use token so donors can reply without logging in.
Handle Twilio delivery webhooks to update AlertDelivery.status .
Retries with exponential backoff, plus a per-donor daily SMS cap.
Escalation job: delayed by N minutes per urgency. If accepted donors are below units
needed, expand the radius (for example 10, 25, 50 km) and alert only new donors.
11. API Overview
MethodEndpointPurpose
POST/api/auth/registerRegister donor or org staff
POST/api/auth/otp/verifyVerify phone
POST/api/auth/loginLogin
GET/PATCH/api/donors/meView and update profile, availability
PUT/api/donors/me/locationUpdate location
POST/api/emergenciesHospital declares emergency
GET/api/emergencies/:idDetails and live status
POST/api/emergencies/:id/respondDonor accepts or declines
PATCH/api/emergencies/:id/closeClose or fulfill
GET/api/emergencies?status=openActive requests (role scoped)
Page 8 of 12Real-Time Blood Donation & Supply Coordinator: MVP Document
MethodEndpointPurpose
GET/PATCH/api/inventoryView and update stock
PATCH/api/admin/orgs/:id/verifyVerify organization
12. Frontend Screens
Donor: sign-up and onboarding, home (availability toggle, next eligible date), alert screen
(accept/decline, distance, directions link), history.
Hospital / blood bank: dashboard, Declare Emergency form, live request view
(responders list, ETAs, progress toward units), inventory table.
Admin: pending verifications, alert log.
Design principle: the donor alert flow should take two taps or fewer, and the emergency
form should be usable on a phone.
13. Privacy, Security and Compliance
This system handles health-related and location data, so treat it carefully.
Explicit consent for location use and SMS; easy opt-out and account deletion.
Donors never see each other. Hospitals see only donors who accepted, and only name,
ETA and contact needed.
Store precise location only as long as needed; allow approximate location for matching
if acceptable.
Encrypt in transit (TLS) and at rest (Atlas encryption). Hash passwords and signed
SMS tokens.
Rate limiting, input validation, Helmet, CORS allowlist, and OTP throttling.
Only admin-verified organizations can declare emergencies, to prevent spam and
false alerts.
Keep an audit trail of who declared what and who was alerted.
Check local regulations (for example HIPAA, GDPR or national health data laws) and
local SMS rules before launch. Eligibility rules should be reviewed by a medical
professional, as they vary by country.
Page 9 of 12Real-Time Blood Donation & Supply Coordinator: MVP Document
14. Non-Functional Requirements
AreaTarget
Alert latencySocket alert under 2 seconds from declaration;
SMS queued under 5 seconds
Availability99.5% for MVP
Scale50k donors, 100 hospitals, 20 concurrent
emergencies
Matching queryUnder 300 ms at target scale
ReliabilitySMS retries, idempotent responses, no duplicate
alerts
15. Success Metrics
Time from declaration to first donor acceptance (median)
Donor response rate and acceptance rate
Percent of emergencies fulfilled within the needed-by time
Alert delivery success rate (socket and SMS)
Donor opt-out rate (a signal of alert fatigue)
Number of verified hospitals and active donors
Page 10 of 12Real-Time Blood Donation & Supply Coordinator: MVP Document
16. Suggested Project Structure
/server
/src
/models
User, Organization, EmergencyRequest, AlertDelivery
/routes
/servicesauth, donors, emergencies, inventory, admin
matching, compatibility, notifications
/sockets
/jobsindex, handlers
alertQueue, escalationQueue, workers
/middleware
/client
/src
/pages
/components
/hooks
auth, roles, rateLimit, validate
donor, hospital, admin
AlertCard, EmergencyForm, LiveResponses, Map
useSocket, useGeolocation
17. Milestones (suggested 8-week plan)
WeekDeliverable
1Repo setup, auth, roles, OTP, data models
2Donor profile, location update, org registration and
verification
3Emergency creation, geospatial matching,
compatibility logic
4Socket.IO alerts and donor response flow
5BullMQ, Twilio SMS fallback, delivery webhooks
6Hospital live dashboard, escalation rounds,
inventory
7Security hardening, load test, drills with seeded
data
8Pilot with one hospital and a small donor group,
feedback fixes
Page 11 of 12Real-Time Blood Donation & Supply Coordinator: MVP Document
18. Risks and Mitigations
RiskMitigation
Alert fatigueCaps, radius tiers, relevance filtering, easy snooze
False or malicious emergenciesVerified orgs only, audit logs, admin review
Stale donor locationsPrompt location refresh, show
locationUpdatedAt , prefer recent
SMS cost and delivery gapsSocket first, SMS only when needed, provider
fallback
Donors unable to reach in timeAsk for ETA, over-alert slightly with escalation
Medical or legal complianceMedical advisor review, regional legal check before
pilot
19. Open Questions
1. Which country or region first (decides SMS provider, eligibility rules, privacy law)?
2. Do hospitals need to verify donors on arrival, and who records the donation?
3. Should critical alerts override donor quiet hours?
4. Will blood banks be alert recipients too, or only donors?
5. Is a PWA enough for pilot, or is native push required?
20. Next Steps
1. Confirm target region and pilot hospital.
2. Review the compatibility map and eligibility rules with a medical advisor.
3. Set up the repo, Atlas cluster with a 2dsphere index, and Redis.
4. Build the vertical slice first: declare emergency, match donors, socket alert, accept,
live dashboard. Add SMS after that works end to end.
Page 12 of 12