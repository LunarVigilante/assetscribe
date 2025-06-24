import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // Clear existing data in reverse dependency order
  await prisma.activityLog.deleteMany()
  await prisma.workflowInstanceTask.deleteMany()
  await prisma.workflowInstance.deleteMany()
  await prisma.workflowTemplateTask.deleteMany()
  await prisma.workflowTemplate.deleteMany()
  await prisma.kBLink.deleteMany()
  await prisma.kBArticle.deleteMany()
  await prisma.scheduledTask.deleteMany()
  await prisma.cIRelationship.deleteMany()
  await prisma.configurationItem.deleteMany()
  await prisma.cIType.deleteMany()
  await prisma.modelConsumableCompatibility.deleteMany()
  await prisma.consumable.deleteMany()
  await prisma.licenseAssignment.deleteMany()
  await prisma.license.deleteMany()
  await prisma.assetAttachment.deleteMany()
  await prisma.assetCustomFieldValue.deleteMany()
  await prisma.customField.deleteMany()
  await prisma.asset.deleteMany()
  await prisma.assetModel.deleteMany()
  await prisma.userAccessDocumentation.deleteMany()
  await prisma.userRole.deleteMany()
  await prisma.user.deleteMany()
  await prisma.rolePermission.deleteMany()
  await prisma.role.deleteMany()
  await prisma.permission.deleteMany()
  await prisma.location.deleteMany()
  await prisma.department.deleteMany()
  await prisma.depreciationMethod.deleteMany()
  await prisma.statusLabel.deleteMany()
  await prisma.supplier.deleteMany()
  await prisma.category.deleteMany()
  await prisma.manufacturer.deleteMany()

  // Create Manufacturers
  const manufacturers = await Promise.all([
    prisma.manufacturer.create({
      data: { name: 'Dell Technologies', website: 'https://dell.com', support_url: 'https://support.dell.com' }
    }),
    prisma.manufacturer.create({
      data: { name: 'HP Inc.', website: 'https://hp.com', support_url: 'https://support.hp.com' }
    }),
    prisma.manufacturer.create({
      data: { name: 'Lenovo', website: 'https://lenovo.com', support_url: 'https://support.lenovo.com' }
    }),
    prisma.manufacturer.create({
      data: { name: 'Apple Inc.', website: 'https://apple.com', support_url: 'https://support.apple.com' }
    }),
    prisma.manufacturer.create({
      data: { name: 'Microsoft Corporation', website: 'https://microsoft.com', support_url: 'https://support.microsoft.com' }
    }),
    prisma.manufacturer.create({
      data: { name: 'Cisco Systems', website: 'https://cisco.com', support_url: 'https://support.cisco.com' }
    }),
    prisma.manufacturer.create({
      data: { name: 'Samsung Electronics', website: 'https://samsung.com', support_url: 'https://support.samsung.com' }
    }),
    prisma.manufacturer.create({
      data: { name: 'Canon Inc.', website: 'https://canon.com', support_url: 'https://support.canon.com' }
    })
  ])

  // Create Categories
  const categories = await Promise.all([
    prisma.category.create({ data: { name: 'Desktop Computer' } }),
    prisma.category.create({ data: { name: 'Laptop' } }),
    prisma.category.create({ data: { name: 'Monitor' } }),
    prisma.category.create({ data: { name: 'Mobile Device' } }),
    prisma.category.create({ data: { name: 'Server' } }),
    prisma.category.create({ data: { name: 'Network Equipment' } }),
    prisma.category.create({ data: { name: 'Printer' } }),
    prisma.category.create({ data: { name: 'Software License' } }),
    prisma.category.create({ data: { name: 'Toner Cartridge' } }),
    prisma.category.create({ data: { name: 'Labels' } }),
    prisma.category.create({ data: { name: 'Cables' } })
  ])

  // Create Suppliers
  const suppliers = await Promise.all([
    prisma.supplier.create({
      data: { name: 'TechSource Inc.', contact_info: 'John Smith - john@techsource.com - +1-555-0101' }
    }),
    prisma.supplier.create({
      data: { name: 'Office Depot', contact_info: 'Sarah Johnson - sarah@officedepot.com - +1-555-0102' }
    }),
    prisma.supplier.create({
      data: { name: 'CDW Corporation', contact_info: 'Mike Wilson - mike@cdw.com - +1-555-0103' }
    })
  ])

  // Create Status Labels
  const statusLabels = await Promise.all([
    prisma.statusLabel.create({ data: { name: 'Deployed', color: '#10b981' } }),
    prisma.statusLabel.create({ data: { name: 'In-Stock', color: '#3b82f6' } }),
    prisma.statusLabel.create({ data: { name: 'In-Repair', color: '#f59e0b' } }),
    prisma.statusLabel.create({ data: { name: 'Archived', color: '#6b7280' } }),
    prisma.statusLabel.create({ data: { name: 'Active', color: '#10b981' } }),
    prisma.statusLabel.create({ data: { name: 'Inactive', color: '#6b7280' } }),
    prisma.statusLabel.create({ data: { name: 'Maintenance', color: '#f59e0b' } }),
    prisma.statusLabel.create({ data: { name: 'Deprecated', color: '#dc2626' } })
  ])

  // Create Depreciation Methods
  const depreciationMethods = await Promise.all([
    prisma.depreciationMethod.create({ data: { name: 'Straight Line', description: '20% per year straight line depreciation' } }),
    prisma.depreciationMethod.create({ data: { name: 'Accelerated', description: '30% per year accelerated depreciation' } }),
    prisma.depreciationMethod.create({ data: { name: 'Double Declining', description: '40% per year double declining balance' } })
  ])

  // Create Departments
  const departments = await Promise.all([
    prisma.department.create({ data: { name: 'Information Technology' } }),
    prisma.department.create({ data: { name: 'Human Resources' } }),
    prisma.department.create({ data: { name: 'Finance' } }),
    prisma.department.create({ data: { name: 'Marketing' } }),
    prisma.department.create({ data: { name: 'Sales' } }),
    prisma.department.create({ data: { name: 'Operations' } }),
    prisma.department.create({ data: { name: 'Legal' } }),
    prisma.department.create({ data: { name: 'Executive' } })
  ])

  // Create Locations
  const locations = await Promise.all([
    prisma.location.create({ data: { name: 'New York Headquarters', parent_location_id: null } }),
    prisma.location.create({ data: { name: 'NY - Floor 1', parent_location_id: null } }),
    prisma.location.create({ data: { name: 'NY - Floor 2', parent_location_id: null } }),
    prisma.location.create({ data: { name: 'Los Angeles Office', parent_location_id: null } }),
    prisma.location.create({ data: { name: 'Chicago Branch', parent_location_id: null } }),
    prisma.location.create({ data: { name: 'Remote/Home Office', parent_location_id: null } })
  ])

  // Create Permissions
  const permissions = await Promise.all([
    prisma.permission.create({ data: { permission_name: 'asset:create', display_name: 'Create Assets' } }),
    prisma.permission.create({ data: { permission_name: 'asset:read', display_name: 'View Assets' } }),
    prisma.permission.create({ data: { permission_name: 'asset:update', display_name: 'Update Assets' } }),
    prisma.permission.create({ data: { permission_name: 'asset:delete', display_name: 'Delete Assets' } }),
    prisma.permission.create({ data: { permission_name: 'user:create', display_name: 'Create Users' } }),
    prisma.permission.create({ data: { permission_name: 'user:read', display_name: 'View Users' } }),
    prisma.permission.create({ data: { permission_name: 'user:update', display_name: 'Update Users' } }),
    prisma.permission.create({ data: { permission_name: 'user:delete', display_name: 'Delete Users' } }),
    prisma.permission.create({ data: { permission_name: 'license:create', display_name: 'Create Licenses' } }),
    prisma.permission.create({ data: { permission_name: 'license:read', display_name: 'View Licenses' } }),
    prisma.permission.create({ data: { permission_name: 'system:admin', display_name: 'System Administration' } })
  ])

  // Create Roles
  const adminRole = await prisma.role.create({
    data: { role_name: 'Admin', description: 'Full system access' }
  })
  const managerRole = await prisma.role.create({
    data: { role_name: 'Manager', description: 'Department management access' }
  })
  const technicianRole = await prisma.role.create({
    data: { role_name: 'Technician', description: 'Asset management access' }
  })
  const userRole = await prisma.role.create({
    data: { role_name: 'User', description: 'Basic user access' }
  })

  // Assign permissions to roles
  await Promise.all([
    // Admin gets all permissions
    ...permissions.map(permission => 
      prisma.rolePermission.create({
        data: { role_id: adminRole.id, permission_id: permission.id }
      })
    ),
    // Manager gets most permissions except system admin
    ...permissions.slice(0, -1).map(permission => 
      prisma.rolePermission.create({
        data: { role_id: managerRole.id, permission_id: permission.id }
      })
    ),
    // Technician gets asset and license permissions
    ...permissions.slice(0, 4).concat(permissions.slice(8, 10)).map(permission => 
      prisma.rolePermission.create({
        data: { role_id: technicianRole.id, permission_id: permission.id }
      })
    ),
    // User gets read permissions only
    prisma.rolePermission.create({
      data: { role_id: userRole.id, permission_id: permissions[1].id }
    }),
    prisma.rolePermission.create({
      data: { role_id: userRole.id, permission_id: permissions[5].id }
    })
  ])

  // Create Users
  const users = await Promise.all([
    prisma.user.create({
      data: {
        employee_id: 'EMP001',
        first_name: 'John',
        last_name: 'Smith',
        username: 'admin',
        email: 'admin@company.com',
        job_title: 'IT Administrator',
        department_id: departments[0].id,
        location_id: locations[0].id,
        office_phone: '+1-555-0201',
        is_active: true
      }
    }),
    prisma.user.create({
      data: {
        employee_id: 'EMP002',
        first_name: 'Sarah',
        last_name: 'Johnson',
        username: 'sarah.johnson',
        email: 'sarah.johnson@company.com',
        job_title: 'IT Manager',
        department_id: departments[0].id,
        location_id: locations[0].id,
        office_phone: '+1-555-0202',
        is_active: true
      }
    }),
    prisma.user.create({
      data: {
        employee_id: 'EMP003',
        first_name: 'Mike',
        last_name: 'Wilson',
        username: 'mike.wilson',
        email: 'mike.wilson@company.com',
        job_title: 'Systems Technician',
        department_id: departments[0].id,
        location_id: locations[1].id,
        office_phone: '+1-555-0203',
        is_active: true
      }
    }),
    prisma.user.create({
      data: {
        employee_id: 'EMP004',
        first_name: 'Emily',
        last_name: 'Davis',
        username: 'emily.davis',
        email: 'emily.davis@company.com',
        job_title: 'HR Director',
        department_id: departments[1].id,
        location_id: locations[0].id,
        office_phone: '+1-555-0204',
        is_active: true
      }
    }),
    prisma.user.create({
      data: {
        employee_id: 'EMP005',
        first_name: 'David',
        last_name: 'Brown',
        username: 'david.brown',
        email: 'david.brown@company.com',
        job_title: 'Financial Analyst',
        department_id: departments[2].id,
        location_id: locations[1].id,
        office_phone: '+1-555-0205',
        is_active: true
      }
    }),
    prisma.user.create({
      data: {
        employee_id: 'EMP006',
        first_name: 'Lisa',
        last_name: 'Chen',
        username: 'lisa.chen',
        email: 'lisa.chen@company.com',
        job_title: 'Marketing Specialist',
        department_id: departments[3].id,
        location_id: locations[3].id,
        office_phone: '+1-555-0206',
        is_active: true
      }
    }),
    prisma.user.create({
      data: {
        employee_id: 'EMP007',
        first_name: 'Robert',
        last_name: 'Taylor',
        username: 'robert.taylor',
        email: 'robert.taylor@company.com',
        job_title: 'Sales Representative',
        department_id: departments[4].id,
        location_id: locations[5].id,
        office_phone: '+1-555-0207',
        is_active: false
      }
    }),
    prisma.user.create({
      data: {
        employee_id: 'EMP008',
        first_name: 'Alice',
        last_name: 'Johnson',
        username: 'alice.johnson',
        email: 'alice.johnson@company.com',
        job_title: 'Operations Manager',
        department_id: departments[5].id,
        location_id: locations[4].id,
        office_phone: '+1-555-0208',
        is_active: true
      }
    })
  ])

  // Assign roles to users
  await Promise.all([
    prisma.userRole.create({ data: { user_id: users[0].id, role_id: adminRole.id } }),
    prisma.userRole.create({ data: { user_id: users[1].id, role_id: managerRole.id } }),
    prisma.userRole.create({ data: { user_id: users[2].id, role_id: technicianRole.id } }),
    prisma.userRole.create({ data: { user_id: users[3].id, role_id: managerRole.id } }),
    prisma.userRole.create({ data: { user_id: users[4].id, role_id: userRole.id } }),
    prisma.userRole.create({ data: { user_id: users[5].id, role_id: userRole.id } }),
    prisma.userRole.create({ data: { user_id: users[6].id, role_id: userRole.id } }),
    prisma.userRole.create({ data: { user_id: users[7].id, role_id: managerRole.id } })
  ])

  // Create Asset Models
  const assetModels = await Promise.all([
    prisma.assetModel.create({
      data: {
        name: 'OptiPlex 7090',
        manufacturer_id: manufacturers[0].id,
        category_id: categories[0].id,
        model_number: 'OP7090',
        depreciation_id: depreciationMethods[0].id
      }
    }),
    prisma.assetModel.create({
      data: {
        name: 'Latitude 5520',
        manufacturer_id: manufacturers[0].id,
        category_id: categories[1].id,
        model_number: 'LAT5520',
        depreciation_id: depreciationMethods[0].id
      }
    }),
    prisma.assetModel.create({
      data: {
        name: 'EliteBook 850 G8',
        manufacturer_id: manufacturers[1].id,
        category_id: categories[1].id,
        model_number: 'EB850G8',
        depreciation_id: depreciationMethods[0].id
      }
    }),
    prisma.assetModel.create({
      data: {
        name: 'UltraSharp U2723QE',
        manufacturer_id: manufacturers[0].id,
        category_id: categories[2].id,
        model_number: 'U2723QE',
        depreciation_id: depreciationMethods[1].id
      }
    }),
    prisma.assetModel.create({
      data: {
        name: 'iPhone 14 Pro',
        manufacturer_id: manufacturers[3].id,
        category_id: categories[3].id,
        model_number: 'A2894',
        depreciation_id: depreciationMethods[2].id
      }
    }),
    prisma.assetModel.create({
      data: {
        name: 'PowerEdge R750',
        manufacturer_id: manufacturers[0].id,
        category_id: categories[4].id,
        model_number: 'PE-R750',
        depreciation_id: depreciationMethods[1].id
      }
    })
  ])

  // Create Assets
  const assets = await Promise.all([
    prisma.asset.create({
      data: {
        asset_tag: 'DT-001',
        serial_number: 'DT001SN123',
        model_id: assetModels[0].id,
        status_id: statusLabels[0].id,
        assigned_to_user_id: users[4].id,
        location_id: locations[1].id,
        department_id: departments[2].id,
        supplier_id: suppliers[0].id,
        purchase_date: new Date('2023-01-15'),
        purchase_cost: 1200.00,
        warranty_expiry_date: new Date('2026-01-15')
      }
    }),
    prisma.asset.create({
      data: {
        asset_tag: 'LT-001',
        serial_number: 'LT001SN456',
        model_id: assetModels[1].id,
        status_id: statusLabels[0].id,
        assigned_to_user_id: users[5].id,
        location_id: locations[3].id,
        department_id: departments[3].id,
        supplier_id: suppliers[0].id,
        purchase_date: new Date('2023-03-20'),
        purchase_cost: 1800.00,
        warranty_expiry_date: new Date('2024-07-15')
      }
    }),
    prisma.asset.create({
      data: {
        asset_tag: 'LT-002',
        serial_number: 'LT002SN789',
        model_id: assetModels[2].id,
        status_id: statusLabels[1].id,
        location_id: locations[0].id,
        supplier_id: suppliers[2].id,
        purchase_date: new Date('2023-06-10'),
        purchase_cost: 2100.00,
        warranty_expiry_date: new Date('2026-06-10')
      }
    }),
    prisma.asset.create({
      data: {
        asset_tag: 'MN-001',
        serial_number: 'MN001SN012',
        model_id: assetModels[3].id,
        status_id: statusLabels[0].id,
        assigned_to_user_id: users[4].id,
        location_id: locations[1].id,
        department_id: departments[2].id,
        supplier_id: suppliers[1].id,
        purchase_date: new Date('2023-02-28'),
        purchase_cost: 450.00,
        warranty_expiry_date: new Date('2026-02-28')
      }
    }),
    prisma.asset.create({
      data: {
        asset_tag: 'PH-001',
        serial_number: 'PH001SN345',
        model_id: assetModels[4].id,
        status_id: statusLabels[2].id,
        assigned_to_user_id: users[6].id,
        location_id: locations[5].id,
        department_id: departments[4].id,
        supplier_id: suppliers[0].id,
        purchase_date: new Date('2023-09-15'),
        purchase_cost: 1200.00,
        warranty_expiry_date: new Date('2024-09-15')
      }
    }),
    prisma.asset.create({
      data: {
        asset_tag: 'SR-001',
        serial_number: 'SR001SN678',
        model_id: assetModels[5].id,
        status_id: statusLabels[0].id,
        location_id: locations[0].id,
        department_id: departments[0].id,
        supplier_id: suppliers[2].id,
        purchase_date: new Date('2022-11-30'),
        purchase_cost: 8500.00,
        warranty_expiry_date: new Date('2025-11-30')
      }
    })
  ])

  // Create Licenses
  const licenses = await Promise.all([
    prisma.license.create({
      data: {
        license_name: 'Microsoft Office 365 E3',
        product_key: 'XXXXX-XXXXX-XXXXX-XXXXX-XXXXX',
        total_seats: 50,
        purchase_date: new Date('2023-01-01'),
        expiry_date: new Date('2024-12-31'),
        vendor_id: manufacturers[4].id,
        notes: 'Enterprise license for productivity suite'
      }
    }),
    prisma.license.create({
      data: {
        license_name: 'Adobe Creative Cloud',
        product_key: 'YYYYY-YYYYY-YYYYY-YYYYY-YYYYY',
        total_seats: 10,
        purchase_date: new Date('2023-06-15'),
        expiry_date: new Date('2024-06-14'),
        vendor_id: manufacturers[7].id,
        notes: 'Design team license for creative software'
      }
    }),
    prisma.license.create({
      data: {
        license_name: 'Windows 11 Pro',
        product_key: 'ZZZZZ-ZZZZZ-ZZZZZ-ZZZZZ-ZZZZZ',
        total_seats: 100,
        purchase_date: new Date('2023-03-01'),
        expiry_date: null,
        vendor_id: manufacturers[4].id,
        notes: 'Operating system licenses'
      }
    }),
    prisma.license.create({
      data: {
        license_name: 'Antivirus Enterprise',
        product_key: 'AAAAA-BBBBB-CCCCC-DDDDD-EEEEE',
        total_seats: 75,
        purchase_date: new Date('2023-04-01'),
        expiry_date: new Date('2024-08-20'),
        vendor_id: manufacturers[4].id,
        notes: 'Enterprise security solution'
      }
    })
  ])

  // Create License Assignments
  await Promise.all([
    prisma.licenseAssignment.create({
      data: { license_id: licenses[0].id, user_id: users[4].id, external_ticket_id: 'SNOW-2024-001' }
    }),
    prisma.licenseAssignment.create({
      data: { license_id: licenses[0].id, user_id: users[5].id, external_ticket_id: 'SNOW-2024-002' }
    }),
    prisma.licenseAssignment.create({
      data: { license_id: licenses[1].id, user_id: users[5].id, external_ticket_id: 'SNOW-2024-003' }
    }),
    prisma.licenseAssignment.create({
      data: { license_id: licenses[2].id, asset_id: assets[0].id, external_ticket_id: 'SNOW-2024-004' }
    }),
    prisma.licenseAssignment.create({
      data: { license_id: licenses[2].id, asset_id: assets[1].id, external_ticket_id: 'SNOW-2024-005' }
    })
  ])

  // Create Consumables
  const consumables = await Promise.all([
    prisma.consumable.create({
      data: {
        name: 'HP 85A Black Toner',
        category_id: categories[8].id,
        manufacturer_id: manufacturers[1].id,
        model_number: 'CE285A',
        current_stock: 2,
        min_stock_level: 5
      }
    }),
    prisma.consumable.create({
      data: {
        name: 'Canon PG-245XL Black Ink',
        category_id: categories[8].id,
        manufacturer_id: manufacturers[7].id,
        model_number: 'PG-245XL',
        current_stock: 8,
        min_stock_level: 3
      }
    }),
    prisma.consumable.create({
      data: {
        name: 'Zebra 4x6 Shipping Labels',
        category_id: categories[9].id,
        manufacturer_id: manufacturers[6].id,
        model_number: 'Z-LABEL-4X6',
        current_stock: 1,
        min_stock_level: 3
      }
    }),
    prisma.consumable.create({
      data: {
        name: 'USB-C to USB-A Cable',
        category_id: categories[10].id,
        manufacturer_id: manufacturers[3].id,
        model_number: 'USBC-USBA-3FT',
        current_stock: 15,
        min_stock_level: 10
      }
    }),
    prisma.consumable.create({
      data: {
        name: 'Network Patch Cable Cat6',
        category_id: categories[10].id,
        manufacturer_id: manufacturers[5].id,
        model_number: 'CAT6-PATCH-5FT',
        current_stock: 0,
        min_stock_level: 20
      }
    })
  ])

  // Create CI Types
  const ciTypes = await Promise.all([
    prisma.cIType.create({ data: { name: 'Server', description: 'Physical and virtual servers' } }),
    prisma.cIType.create({ data: { name: 'Database', description: 'Database systems and instances' } }),
    prisma.cIType.create({ data: { name: 'Application', description: 'Software applications and services' } }),
    prisma.cIType.create({ data: { name: 'Network Device', description: 'Switches, routers, and network equipment' } }),
    prisma.cIType.create({ data: { name: 'Storage', description: 'Storage systems and arrays' } }),
    prisma.cIType.create({ data: { name: 'Service', description: 'Business services and processes' } })
  ])

  // Create Configuration Items
  const configurationItems = await Promise.all([
    prisma.configurationItem.create({
      data: {
        name: 'Primary Web Server',
        ci_type_id: ciTypes[0].id,
        description: 'Main production web server hosting company website',
        responsible_user_id: users[0].id,
        status_id: statusLabels[4].id
      }
    }),
    prisma.configurationItem.create({
      data: {
        name: 'Employee Database',
        ci_type_id: ciTypes[1].id,
        description: 'HR database containing employee information',
        responsible_user_id: users[1].id,
        status_id: statusLabels[4].id
      }
    }),
    prisma.configurationItem.create({
      data: {
        name: 'Customer Portal',
        ci_type_id: ciTypes[2].id,
        description: 'Web application for customer self-service',
        responsible_user_id: users[2].id,
        status_id: statusLabels[4].id
      }
    }),
    prisma.configurationItem.create({
      data: {
        name: 'Core Network Switch',
        ci_type_id: ciTypes[3].id,
        description: 'Main network switch for office connectivity',
        responsible_user_id: users[2].id,
        status_id: statusLabels[6].id
      }
    }),
    prisma.configurationItem.create({
      data: {
        name: 'Backup Storage Array',
        ci_type_id: ciTypes[4].id,
        description: 'Primary backup storage system',
        responsible_user_id: users[0].id,
        status_id: statusLabels[4].id
      }
    }),
    prisma.configurationItem.create({
      data: {
        name: 'Email Service',
        ci_type_id: ciTypes[5].id,
        description: 'Company email and messaging service',
        responsible_user_id: users[1].id,
        status_id: statusLabels[7].id
      }
    })
  ])

  // Create CI Relationships
  await Promise.all([
    prisma.cIRelationship.create({
      data: {
        parent_ci_id: configurationItems[0].id,
        child_ci_id: configurationItems[1].id,
        relationship_type: 'Depends on'
      }
    }),
    prisma.cIRelationship.create({
      data: {
        parent_ci_id: configurationItems[2].id,
        child_ci_id: configurationItems[1].id,
        relationship_type: 'Uses'
      }
    }),
    prisma.cIRelationship.create({
      data: {
        parent_ci_id: configurationItems[0].id,
        child_ci_id: configurationItems[3].id,
        relationship_type: 'Runs on'
      }
    }),
    prisma.cIRelationship.create({
      data: {
        parent_ci_id: configurationItems[1].id,
        child_ci_id: configurationItems[4].id,
        relationship_type: 'Backed up by'
      }
    })
  ])

  // Create Workflow Templates
  const workflowTemplates = await Promise.all([
    prisma.workflowTemplate.create({
      data: {
        name: 'Employee Onboarding',
        description: 'Complete process for new employee setup'
      }
    }),
    prisma.workflowTemplate.create({
      data: {
        name: 'Employee Offboarding',
        description: 'Process for employee departure and asset recovery'
      }
    }),
    prisma.workflowTemplate.create({
      data: {
        name: 'Hardware Refresh',
        description: 'Systematic replacement of aging hardware'
      }
    })
  ])

  // Create Workflow Template Tasks
  await Promise.all([
    // Onboarding tasks
    prisma.workflowTemplateTask.create({
      data: {
        template_id: workflowTemplates[0].id,
        task_name: 'Create User Account',
        description: 'Set up user account in Active Directory',
        display_order: 1,
        task_type: 'manual_checkbox'
      }
    }),
    prisma.workflowTemplateTask.create({
      data: {
        template_id: workflowTemplates[0].id,
        task_name: 'Assign Assets',
        description: 'Allocate laptop, monitor, and peripherals',
        display_order: 2,
        task_type: 'link_to_action',
        link_url: '/assets'
      }
    }),
    prisma.workflowTemplateTask.create({
      data: {
        template_id: workflowTemplates[0].id,
        task_name: 'Setup Email Account',
        description: 'Configure email and Office 365 access',
        display_order: 3,
        task_type: 'manual_checkbox'
      }
    }),
    // Offboarding tasks
    prisma.workflowTemplateTask.create({
      data: {
        template_id: workflowTemplates[1].id,
        task_name: 'Disable User Account',
        description: 'Deactivate all system access',
        display_order: 1,
        task_type: 'manual_checkbox'
      }
    }),
    prisma.workflowTemplateTask.create({
      data: {
        template_id: workflowTemplates[1].id,
        task_name: 'Recover Assets',
        description: 'Collect all company equipment',
        display_order: 2,
        task_type: 'link_to_action',
        link_url: '/assets'
      }
    })
  ])

  // Create Workflow Instances
  const workflowInstances = await Promise.all([
    prisma.workflowInstance.create({
      data: {
        template_id: workflowTemplates[0].id,
        target_user_id: users[5].id,
        status: 'In Progress'
      }
    }),
    prisma.workflowInstance.create({
      data: {
        template_id: workflowTemplates[1].id,
        target_user_id: users[6].id,
        status: 'Completed'
      }
    })
  ])

  // Create Activity Logs
  await Promise.all([
    prisma.activityLog.create({
      data: {
        user_id: users[0].id,
        action_type: 'ASSET_CREATE',
        target_id: assets[0].id,
        target_type: 'Asset',
        external_ticket_id: 'SNOW-2024-101',
        details: { asset_tag: 'DT-001', model: 'OptiPlex 7090' }
      }
    }),
    prisma.activityLog.create({
      data: {
        user_id: users[1].id,
        action_type: 'USER_CREATE',
        target_id: users[5].id,
        target_type: 'User',
        external_ticket_id: 'SNOW-2024-102',
        details: { username: 'lisa.chen', department: 'Marketing' }
      }
    }),
    prisma.activityLog.create({
      data: {
        user_id: users[2].id,
        action_type: 'ASSET_CHECKOUT',
        target_id: assets[1].id,
        target_type: 'Asset',
        external_ticket_id: 'SNOW-2024-103',
        details: { asset_tag: 'LT-001', assigned_to: 'lisa.chen' }
      }
    }),
    prisma.activityLog.create({
      data: {
        user_id: users[0].id,
        action_type: 'LICENSE_ASSIGN',
        target_id: licenses[0].id,
        target_type: 'License',
        external_ticket_id: 'SNOW-2024-104',
        details: { license: 'Microsoft Office 365 E3', assigned_to: 'david.brown' }
      }
    }),
    prisma.activityLog.create({
      data: {
        user_id: users[1].id,
        action_type: 'USER_UPDATE',
        target_id: users[6].id,
        target_type: 'User',
        external_ticket_id: 'SNOW-2024-105',
        details: { username: 'robert.taylor', change: 'status_updated_to_inactive' }
      }
    })
  ])

  // Seed Asset Conditions
  const assetConditions = [
    'New',
    'Excellent', 
    'Good',
    'Fair',
    'Poor',
    'Damaged'
  ]

  for (const condition of assetConditions) {
    await prisma.assetCondition.upsert({
      where: { name: condition },
      update: {},
      create: { name: condition }
    })
  }

  // Seed Maintenance Schedules  
  const maintenanceSchedules = [
    'Monthly',
    'Quarterly',
    'Semi-Annual', 
    'Annual',
    'As Needed'
  ]

  for (const schedule of maintenanceSchedules) {
    await prisma.maintenanceSchedule.upsert({
      where: { name: schedule },
      update: {},
      create: { name: schedule }
    })
  }

  console.log('✅ Seed completed successfully!')
  console.log(`📊 Created:
  - ${manufacturers.length} Manufacturers
  - ${categories.length} Categories  
  - ${suppliers.length} Suppliers
  - ${statusLabels.length} Status Labels
  - ${departments.length} Departments
  - ${locations.length} Locations
  - ${users.length} Users
  - ${assetModels.length} Asset Models
  - ${assets.length} Assets
  - ${licenses.length} Licenses
  - ${consumables.length} Consumables
  - ${configurationItems.length} Configuration Items
  - ${workflowTemplates.length} Workflow Templates
  - 5 Activity Log entries`)
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 