const fs = require('fs');
const path = require('path');

interface PropertyData {
  [key: string]: any;
}

interface HubSpotResult {
  csvPath: string;
  recordCount: number;
}

type HubSpotFetchResult = PropertyData[] | HubSpotResult;

const hubspotApiKey = 'YOUR_API_KEY';
const url = 'https://api.hubapi.com/crm/v3/objects/deals';

const propertiesFromHubSpot = [
  {
    id: "deal_001",
    dealname: "Manhattan Luxury Apartment",
    address: "123 Park Avenue, Manhattan",
    price: "750000",
    square_feet: "1200",
    bedrooms: "3",
    bathrooms: "2",
    parking: "1",
    status: "For Sale",
    type: "Apartment",
    condition: "Excellent",
    year_built: "2018",
    neighborhood: "Manhattan",
    city: "New York",
    state: "NY",
    zip: "10016",
    description: "Luxury apartment with park views, modern kitchen, 3 bedrooms with master suite",
    features: "Balcony, Park View, Open Kitchen, Air Conditioning",
    listing_date: "2024-01-15",
    agency: "NYC Real Estate"
  },
  {
    id: "deal_002", 
    dealname: "Brooklyn Heights Penthouse",
    address: "456 Brooklyn Heights Promenade, Brooklyn",
    price: "1200000",
    square_feet: "2000",
    bedrooms: "4",
    bathrooms: "3",
    parking: "2",
    status: "For Sale",
    type: "Penthouse",
    condition: "New",
    year_built: "2022",
    neighborhood: "Brooklyn Heights",
    city: "New York",
    state: "NY",
    zip: "11201",
    description: "Luxury penthouse with panoramic city views, private terrace",
    features: "City View, Terrace, Smart Home, Gym, Pool",
    listing_date: "2024-01-20",
    agency: "NYC Real Estate"
  },
  {
    id: "deal_003",
    dealname: "Queens Family House",
    address: "789 Oak Street, Queens",
    price: "450000",
    square_feet: "1800",
    bedrooms: "4",
    bathrooms: "3",
    parking: "3",
    status: "For Sale",
    type: "House",
    condition: "Good",
    year_built: "2015",
    neighborhood: "Queens",
    city: "New York",
    state: "NY",
    zip: "11375",
    description: "Perfect family house with large backyard, 3-car garage",
    features: "Backyard, Garage, Fireplace, Hardwood Floors",
    listing_date: "2024-01-25",
    agency: "NYC Real Estate"
  },
  {
    id: "deal_004",
    dealname: "SoHo Industrial Loft",
    address: "321 Industrial Way, SoHo",
    price: "650000",
    square_feet: "950",
    bedrooms: "2",
    bathrooms: "1",
    parking: "1",
    status: "For Sale",
    type: "Loft",
    condition: "Renovated",
    year_built: "2020",
    neighborhood: "SoHo",
    city: "New York",
    state: "NY",
    zip: "10013",
    description: "Modern loft in renovated industrial building, high ceilings, contemporary design",
    features: "High Ceilings, Industrial Design, Open Kitchen, Balcony",
    listing_date: "2024-02-01",
    agency: "NYC Real Estate"
  },
  {
    id: "deal_005",
    dealname: "Midtown Studio",
    address: "654 Broadway, Midtown",
    price: "380000",
    square_feet: "450",
    bedrooms: "1",
    bathrooms: "1",
    parking: "0",
    status: "For Sale",
    type: "Studio",
    condition: "Good",
    year_built: "2019",
    neighborhood: "Midtown",
    city: "New York",
    state: "NY",
    zip: "10019",
    description: "Compact and functional studio in city center, ideal for investment",
    features: "Furnished, Air Conditioning, Internet, Near Subway",
    listing_date: "2024-02-05",
    agency: "NYC Real Estate"
  }
];

async function fetchPropertiesFromHubSpot(): Promise<HubSpotFetchResult> {
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  try {
    const csvPath = path.join(__dirname, '../../uploads/properties_real_estate_english.csv');
    
    if (fs.existsSync(csvPath)) {
      const csvContent = fs.readFileSync(csvPath, 'utf8');
      const lines = csvContent.trim().split('\n');
      const dataLines = lines.length - 1;
      
      return { csvPath, recordCount: dataLines };
    } else {
      return propertiesFromHubSpot;
    }
  } catch (error) {
    return propertiesFromHubSpot;
  }
}

function generateCSV(data: any[], filename: string = 'properties_from_hubspot.csv') {
  if (!data || data.length === 0) {
    return null;
  }
  
  const allKeys = new Set<string>();
  data.forEach(item => {
    Object.keys(item).forEach(key => allKeys.add(key));
  });
  
  const headers = Array.from(allKeys).sort();
  
  const escapeCSVValue = (value: any): string => {
    if (value === null || value === undefined) {
      return '';
    }
    
    const stringValue = String(value);
    
    if (stringValue.includes(',') || stringValue.includes('\n') || stringValue.includes('"')) {
      return `"${stringValue.replace(/"/g, '""')}"`;
    }
    
    return stringValue;
  };
  
  const csvRows = [headers.join(',')];
  
  data.forEach(item => {
    const row = headers.map(header => escapeCSVValue(item[header]));
    csvRows.push(row.join(','));
  });
  
  const csvContent = csvRows.join('\n');
  const outputPath = path.join(__dirname, '../../uploads', filename);
  fs.writeFileSync(outputPath, csvContent, 'utf8');
  
  return outputPath;
}

async function main() {
  try {
    const result = await fetchPropertiesFromHubSpot();
    
    let csvPath: string;
    let recordCount: number;
    
    if (typeof result === 'object' && 'csvPath' in result) {
      csvPath = result.csvPath;
      recordCount = result.recordCount;
    } else {
      const properties = result as any[];
      csvPath = generateCSV(properties) || '';
      recordCount = properties.length;
    }
    
    return { csvPath, recordCount };
    
  } catch (error) {
    throw error;
  }
}

if (require.main === module) {
  main();
}

const exampleRealEstateStructures = {
  basic: [
    {
      name: "Simple House",
      address: "123 Oak Street",
      price: 300000,
      bedrooms: 3
    },
    {
      name: "Downtown Apartment",
      address: "456 Main Street", 
      price: 450000,
      bedrooms: 2
    }
  ],
  
  intermediate: [
    {
      property_id: "P001",
      title: "Luxury Apartment",
      address: "123 Fifth Avenue",
      price: 800000,
      bedrooms: 3,
      bathrooms: 2,
      area: 120,
      status: "available"
    }
  ],
  
  advanced: [
    {
      listing_id: "LUX-001",
      property_name: "Manhattan Penthouse",
      full_address: "456 Park Avenue, Floor 25, Manhattan",
      listing_price: 1500000,
      property_type: "Penthouse",
      bedrooms: 4,
      bathrooms: 3,
      square_feet: 2500,
      parking_spaces: 2,
      building_year: 2020,
      property_condition: "New",
      amenities: ["Pool", "Gym", "Concierge", "Rooftop"],
      neighborhood: "Manhattan",
      city: "New York",
      state: "NY",
      zip_code: "10016",
      listing_date: "2024-01-15",
      agent_name: "John Smith",
      agency: "Luxury Real Estate NYC",
      description: "Amazing penthouse with city views",
      photos_count: 15,
      virtual_tour: true,
      energy_efficiency: "A+"
    }
  ]
};

async function testDifferentStructures() {
  generateCSV(exampleRealEstateStructures.basic, 'basic_structure.csv');
  generateCSV(exampleRealEstateStructures.intermediate, 'intermediate_structure.csv');
  generateCSV(exampleRealEstateStructures.advanced, 'advanced_structure.csv');
}

export {
  fetchPropertiesFromHubSpot,
  generateCSV,
  main,
  testDifferentStructures,
  exampleRealEstateStructures
};
