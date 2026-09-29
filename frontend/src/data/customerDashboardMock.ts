export const mockServiceData = {
  customer: {
    id: "cus_123",
    name: "Shlok Mehta",
    email: "shlok@example.com",
    phone: "+91 98765 43210",
    avatar: "https://i.pravatar.cc/150?u=shlok",
    memberSince: "2024-01-15T00:00:00Z"
  },
  vehicle: {
    id: "veh_123",
    make: "Porsche",
    model: "911 Carrera",
    year: 2026,
    registration: "GJ-01-XY-1234",
    vin: "WP0AA2992KS123456",
    mileage: 18420,
    color: "Red",
    health: {
      engine: 96,
      battery: 82,
      brakes: 43,
      tyres: 76,
      fluids: 91,
      suspension: 88
    },
    warranty: {
      vehicleRemaining: 18, // months
      parts: [
        { name: "Brake Pads", remaining: 12 },
        { name: "Battery", remaining: 24 }
      ]
    }
  },
  activeService: {
    id: "RT-2026-1048",
    status: "REPAIRING", // 'RECEIVED', 'INSPECTION', 'DIAGNOSTICS', 'AWAITING_APPROVAL', 'REPAIRING', 'QUALITY_CHECK', 'READY', 'DELIVERED'
    progress: 68,
    checkInTime: "2026-09-22T09:15:00Z",
    estimatedCompletion: "2026-09-22T18:30:00Z",
    advisor: {
      id: "adv_1",
      name: "Rahul Sharma",
      role: "Service Advisor",
      avatar: "https://i.pravatar.cc/150?u=rahul",
      status: "online"
    },
    technician: {
      id: "tech_1",
      name: "Arjun Patel",
      role: "Senior Porsche Technician",
      specialization: "Engine & Performance",
      avatar: "https://i.pravatar.cc/150?u=arjun"
    },
    timeline: [
      { id: 1, time: "2026-09-22T09:15:00Z", title: "Vehicle checked in", description: "Vehicle received at service center.", status: "completed" },
      { id: 2, time: "2026-09-22T09:42:00Z", title: "Initial inspection", description: "Initial diagnostic scan completed.", status: "completed" },
      { id: 3, time: "2026-09-22T10:20:00Z", title: "Diagnostics", description: "Front brake pad wear detected.", status: "completed" },
      { id: 4, time: "2026-09-22T10:48:00Z", title: "Estimate generated", description: "Repair estimate sent for approval.", status: "completed" },
      { id: 5, time: "2026-09-22T11:05:00Z", title: "Customer approved", description: "Customer approved brake replacement.", status: "completed" },
      { id: 6, time: "2026-09-22T12:30:00Z", title: "Repair started", description: "Technician assigned and repair in progress.", status: "active" },
      { id: 7, time: null, title: "Quality Check", description: "Final road test and inspection.", status: "pending" },
      { id: 8, time: null, title: "Ready for Delivery", description: "Vehicle washed and ready.", status: "pending" }
    ],
    diagnostics: [
      {
        id: "diag_1",
        component: "Front Brakes",
        health: 18,
        issue: "Needs Attention",
        severity: "High",
        notes: "Front brake pads are worn down to 2mm, which is below the safe threshold of 3mm. The rotors also show significant scoring and heat damage.",
        recommendation: "Replace front brake pads and rotors.",
        estimatedCost: 8500,
        approved: true,
        hotspotId: "front-brakes"
      },
      {
        id: "diag_2",
        component: "Engine Oil",
        health: 45,
        issue: "Routine Maintenance",
        severity: "Low",
        notes: "Oil viscosity is normal but approaching scheduled replacement mileage.",
        recommendation: "Scheduled oil and filter change.",
        estimatedCost: 12500,
        approved: true,
        hotspotId: "engine"
      }
    ],
    estimate: {
      id: "EST-9482",
      createdDate: "2026-09-22T10:48:00Z",
      expiryDate: "2026-09-29T10:48:00Z",
      status: "APPROVED",
      parts: [
        { name: "OEM Front Brake Pads", quantity: 1, unitPrice: 6500, total: 6500 },
        { name: "Synthetic Engine Oil (0W-40)", quantity: 8, unitPrice: 1200, total: 9600 },
        { name: "Oil Filter", quantity: 1, unitPrice: 2900, total: 2900 }
      ],
      labor: [
        { name: "Brake Pad Replacement", hours: 1.5, rate: 2000, total: 3000 },
        { name: "Oil Change Service", hours: 0.5, rate: 2000, total: 1000 }
      ],
      subtotal: 23000,
      tax: 4140,
      discount: 1000,
      total: 26140
    },
    invoice: {
      id: "INV-9482",
      issueDate: "2026-09-22T12:00:00Z",
      dueDate: "2026-09-29T12:00:00Z",
      status: "UNPAID",
      amount: 26140
    },
    photos: {
      before: [
        { id: "p1", url: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&q=80&w=800", category: "Wheels", desc: "Worn brake pads" }
      ],
      after: []
    },
    replacedParts: [
      { id: "rp1", name: "Front Brake Pads", partNo: "P-991-351-939", brand: "OEM Porsche", qty: 1, cost: 6500, warranty: "12 months", status: "Installed" }
    ]
  },
  history: [
    { id: "SRV-8102", date: "2026-03-15T10:00:00Z", mileage: 15300, type: "Scheduled Maintenance", center: "Porsche Center Ahmedabad", amount: 14800 }
  ],
  appointments: [
    { id: "APP-9921", type: "Scheduled Maintenance", date: "2027-02-12T09:00:00Z", center: "Porsche Center Ahmedabad", status: "CONFIRMED" }
  ],
  notifications: [
    { id: "n1", title: "Repair started", message: "Technician Arjun has started working on your vehicle.", time: "2026-09-22T12:30:00Z", read: false },
    { id: "n2", title: "Estimate approved", message: "You approved the estimate EST-9482.", time: "2026-09-22T11:05:00Z", read: true }
  ]
};

