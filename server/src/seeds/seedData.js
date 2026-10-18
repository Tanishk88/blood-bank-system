const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const User = require('../models/User');
const BloodStock = require('../models/BloodStock');
const Donor = require('../models/Donor');
const Donation = require('../models/Donation');
const BloodRequest = require('../models/BloodRequest');

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/blood_bank';
    console.log(`[Seed] Connecting to ${mongoUri}...`);
    await mongoose.connect(mongoUri);

    console.log('[Seed] Cleaning old database collections...');
    await User.deleteMany();
    await BloodStock.deleteMany();
    await Donor.deleteMany();
    await Donation.deleteMany();
    await BloodRequest.deleteMany();

    console.log('[Seed] Seeding Users...');
    const adminUser = await User.create({
      name: 'System Administrator',
      email: 'admin@bloodbank.org',
      password: 'admin123',
      role: 'admin',
      phone: '+1 555-0199',
      address: 'Central Health HQ, Room 401',
    });

    const hospitalUser = await User.create({
      name: 'Dr. Sarah Mitchell',
      email: 'hospital@citycare.org',
      password: 'hospital123',
      role: 'hospital',
      organizationName: 'City Memorial Hospital',
      phone: '+1 555-0144',
      address: '742 Evergreen Medical Park, Sector 4',
    });

    const donorUser = await User.create({
      name: 'John Doe',
      email: 'donor@example.com',
      password: 'donor123',
      role: 'donor',
      phone: '+1 555-0188',
      bloodGroup: 'O+',
      address: '42 Maple Street, Westview',
    });

    console.log('[Seed] Seeding Blood Inventory...');
    const stockEntries = [
      { bloodGroup: 'A+', units: 28, minimumThreshold: 10 },
      { bloodGroup: 'A-', units: 9, minimumThreshold: 10 },
      { bloodGroup: 'B+', units: 35, minimumThreshold: 10 },
      { bloodGroup: 'B-', units: 7, minimumThreshold: 10 },
      { bloodGroup: 'AB+', units: 14, minimumThreshold: 10 },
      { bloodGroup: 'AB-', units: 4, minimumThreshold: 8 },
      { bloodGroup: 'O+', units: 42, minimumThreshold: 15 },
      { bloodGroup: 'O-', units: 5, minimumThreshold: 12 }, // Critical shortage
    ];
    await BloodStock.insertMany(stockEntries);

    console.log('[Seed] Seeding Donors...');
    const donors = await Donor.insertMany([
      {
        name: 'Michael Vance',
        email: 'michael.v@example.com',
        phone: '+1 555-0101',
        bloodGroup: 'O-',
        age: 29,
        gender: 'Male',
        weight: 74,
        city: 'Metro City',
        status: 'Eligible',
        totalDonations: 3,
        lastDonationDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
      },
      {
        name: 'Elena Rostova',
        email: 'elena.r@example.com',
        phone: '+1 555-0102',
        bloodGroup: 'A+',
        age: 34,
        gender: 'Female',
        weight: 62,
        city: 'Riverdale',
        status: 'Eligible',
        totalDonations: 5,
        lastDonationDate: new Date(Date.now() - 65 * 24 * 60 * 60 * 1000),
      },
      {
        name: 'David Chen',
        email: 'david.c@example.com',
        phone: '+1 555-0103',
        bloodGroup: 'B+',
        age: 41,
        gender: 'Male',
        weight: 80,
        city: 'Oakridge',
        status: 'Eligible',
        totalDonations: 2,
        lastDonationDate: new Date(Date.now() - 110 * 24 * 60 * 60 * 1000),
      },
      {
        name: 'Priya Sharma',
        email: 'priya.s@example.com',
        phone: '+1 555-0104',
        bloodGroup: 'AB+',
        age: 26,
        gender: 'Female',
        weight: 58,
        city: 'Metro City',
        status: 'Eligible',
        totalDonations: 1,
        lastDonationDate: new Date(Date.now() - 75 * 24 * 60 * 60 * 1000),
      },
    ]);

    console.log('[Seed] Seeding Donations...');
    await Donation.insertMany([
      {
        donor: donors[0]._id,
        donorName: donors[0].name,
        bloodGroup: 'O-',
        units: 1,
        hemoglobinLevel: 14.2,
        bloodPressure: '120/80',
        status: 'Completed',
        notes: 'Volunteer camp drive',
        donationDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
      },
      {
        donor: donors[1]._id,
        donorName: donors[1].name,
        bloodGroup: 'A+',
        units: 1,
        hemoglobinLevel: 13.8,
        bloodPressure: '118/76',
        status: 'Completed',
        notes: 'Routine blood center donation',
        donationDate: new Date(Date.now() - 65 * 24 * 60 * 60 * 1000),
      },
    ]);

    console.log('[Seed] Seeding Blood Requests...');
    await BloodRequest.insertMany([
      {
        requester: hospitalUser._id,
        requesterName: hospitalUser.name,
        hospitalName: 'City Memorial Hospital',
        patientName: 'Robert Langdon',
        bloodGroup: 'O-',
        unitsRequested: 2,
        urgency: 'Critical',
        status: 'Pending',
        reason: 'Trauma ICU emergency surgery',
        contactPhone: '+1 555-0144',
      },
      {
        requester: hospitalUser._id,
        requesterName: hospitalUser.name,
        hospitalName: 'City Memorial Hospital',
        patientName: 'Emma Watson',
        bloodGroup: 'B+',
        unitsRequested: 3,
        urgency: 'Urgent',
        status: 'Pending',
        reason: 'Orthopedic surgical operation',
        contactPhone: '+1 555-0144',
      },
      {
        requester: hospitalUser._id,
        requesterName: hospitalUser.name,
        hospitalName: 'City Memorial Hospital',
        patientName: 'James Stewart',
        bloodGroup: 'A+',
        unitsRequested: 1,
        urgency: 'Normal',
        status: 'Approved',
        reason: 'Anemia treatment',
        contactPhone: '+1 555-0144',
        processedBy: adminUser._id,
        processedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      },
    ]);

    console.log('[Seed] Data successfully seeded!');
    console.log('----------------------------------------------------');
    console.log('Admin:    admin@bloodbank.org    / password: admin123');
    console.log('Hospital: hospital@citycare.org  / password: hospital123');
    console.log('Donor:    donor@example.com      / password: donor123');
    console.log('----------------------------------------------------');
    process.exit(0);
  } catch (err) {
    console.error(`[Seed Error] ${err.message}`);
    process.exit(1);
  }
};

seedData();
