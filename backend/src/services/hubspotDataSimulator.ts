const fs = require('fs');
const path = require('path');

// Simulação de dados do HubSpot - em produção viria da API
const hubspotApiKey = 'SUA_CHAVE_DE_API';
const url = 'https://api.hubapi.com/crm/v3/objects/deals';

// Dados simulados que viriam do HubSpot - Estrutura completa
const propertiesFromHubSpot = [
  {
    id: "deal_001",
    dealname: "Apartamento Jardim Botânico",
    endereco: "Rua das Flores, 123, Jardim Botânico",
    preco: "750000",
    metragem: "120",
    quartos: "3",
    banheiros: "2",
    vagas: "1",
    status: "À venda",
    tipo: "Apartamento",
    condicao: "Excelente",
    ano_construcao: "2018",
    bairro: "Jardim Botânico",
    cidade: "São Paulo",
    estado: "SP",
    cep: "01234-567",
    descricao: "Apartamento com vista para o jardim, cozinha moderna, 3 quartos sendo 1 suíte",
    caracteristicas: "Varanda, Vista Jardim, Cozinha Americana, Ar Condicionado",
    data_listagem: "2024-01-15",
    imobiliaria: "Imobiliária Exemplo"
  },
  {
    id: "deal_002", 
    dealname: "Cobertura Centro",
    endereco: "Av. Principal, 456, Centro",
    preco: "1200000",
    metragem: "200",
    quartos: "4",
    banheiros: "3",
    vagas: "2",
    status: "À venda",
    tipo: "Cobertura",
    condicao: "Nova",
    ano_construcao: "2022",
    bairro: "Centro",
    cidade: "São Paulo",
    estado: "SP",
    cep: "01234-890",
    descricao: "Cobertura de luxo com vista panorâmica da cidade, terraço privativo",
    caracteristicas: "Vista Cidade, Terraço, Casa Inteligente, Academia, Piscina",
    data_listagem: "2024-01-20",
    imobiliaria: "Imobiliária Exemplo"
  },
  {
    id: "deal_003",
    dealname: "Casa Subúrbio",
    endereco: "Rua do Carvalho, 789, Subúrbio",
    preco: "450000",
    metragem: "180",
    quartos: "4",
    banheiros: "3",
    vagas: "3",
    status: "À venda",
    tipo: "Casa",
    condicao: "Boa",
    ano_construcao: "2015",
    bairro: "Subúrbio",
    cidade: "São Paulo",
    estado: "SP",
    cep: "01234-123",
    descricao: "Casa térrea perfeita para família, quintal amplo, garagem para 3 carros",
    caracteristicas: "Quintal, Garagem, Lareira, Piso de Madeira",
    data_listagem: "2024-01-25",
    imobiliaria: "Imobiliária Exemplo"
  },
  {
    id: "deal_004",
    dealname: "Loft Industrial",
    endereco: "Rua Industrial, 321, Vila Madalena",
    preco: "650000",
    metragem: "95",
    quartos: "2",
    banheiros: "1",
    vagas: "1",
    status: "À venda",
    tipo: "Loft",
    condicao: "Reformado",
    ano_construcao: "2020",
    bairro: "Vila Madalena",
    cidade: "São Paulo",
    estado: "SP",
    cep: "01234-456",
    descricao: "Loft moderno em prédio industrial reformado, pé-direito alto, design contemporâneo",
    caracteristicas: "Pé-direito Alto, Design Industrial, Cozinha Integrada, Varanda",
    data_listagem: "2024-02-01",
    imobiliaria: "Imobiliária Exemplo"
  },
  {
    id: "deal_005",
    dealname: "Studio Centro",
    endereco: "Rua Comercial, 654, Centro",
    preco: "380000",
    metragem: "45",
    quartos: "1",
    banheiros: "1",
    vagas: "0",
    status: "À venda",
    tipo: "Studio",
    condicao: "Boa",
    ano_construcao: "2019",
    bairro: "Centro",
    cidade: "São Paulo",
    estado: "SP",
    cep: "01234-789",
    descricao: "Studio compacto e funcional no centro da cidade, ideal para investimento",
    caracteristicas: "Mobiliado, Ar Condicionado, Internet, Próximo ao Metrô",
    data_listagem: "2024-02-05",
    imobiliaria: "Imobiliária Exemplo"
  }
];

// Função para simular busca de dados no HubSpot
async function fetchPropertiesFromHubSpot() {
  console.log('🔍 Simulando busca de dados no HubSpot...');
  
  // Simulação de delay da API
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  console.log(`✅ Encontradas ${propertiesFromHubSpot.length} propriedades no HubSpot`);
  return propertiesFromHubSpot;
}

// Função genérica para gerar CSV a partir de qualquer estrutura de dados
function generateCSV(data: any[], filename: string = 'properties_from_hubspot.csv') {
  console.log('📄 Gerando arquivo CSV...');
  
  if (!data || data.length === 0) {
    console.log('⚠️ Nenhum dado encontrado para gerar CSV');
    return null;
  }
  
  // Extrair todas as chaves únicas de todos os objetos
  const allKeys = new Set<string>();
  data.forEach(item => {
    Object.keys(item).forEach(key => allKeys.add(key));
  });
  
  // Converter Set para Array e ordenar para consistência
  const headers = Array.from(allKeys).sort();
  
  // Função para escapar valores CSV
  const escapeCSVValue = (value: any): string => {
    if (value === null || value === undefined) {
      return '';
    }
    
    const stringValue = String(value);
    
    // Se contém vírgula, quebra de linha ou aspas, precisa ser envolvido em aspas
    if (stringValue.includes(',') || stringValue.includes('\n') || stringValue.includes('"')) {
      // Escapar aspas duplas duplicando-as
      return `"${stringValue.replace(/"/g, '""')}"`;
    }
    
    return stringValue;
  };
  
  // Converter dados para CSV
  const csvRows = [headers.join(',')];
  
  data.forEach(item => {
    const row = headers.map(header => escapeCSVValue(item[header]));
    csvRows.push(row.join(','));
  });
  
  const csvContent = csvRows.join('\n');
  
  // Salvar arquivo
  const outputPath = path.join(__dirname, '../../uploads', filename);
  fs.writeFileSync(outputPath, csvContent, 'utf8');
  
  console.log(`✅ Arquivo CSV gerado: ${outputPath}`);
  console.log(`📊 Campos detectados: ${headers.length} (${headers.join(', ')})`);
  console.log(`📊 Registros processados: ${data.length}`);
  
  return outputPath;
}

// Função principal
async function main() {
  try {
    console.log('🚀 Iniciando simulação de integração HubSpot...\n');
    
    // 1. Buscar dados do HubSpot (simulado)
    const properties = await fetchPropertiesFromHubSpot();
    
    // 2. Gerar CSV
    const csvPath = generateCSV(properties);
    
    // 3. Mostrar resumo
    console.log('\n📊 Resumo dos dados:');
    console.log(`- Total de propriedades: ${properties.length}`);
    console.log(`- Tipos: ${[...new Set(properties.map(p => p.tipo))].join(', ')}`);
    console.log(`- Faixa de preços: R$ ${Math.min(...properties.map(p => parseInt(p.preco))).toLocaleString()} - R$ ${Math.max(...properties.map(p => parseInt(p.preco))).toLocaleString()}`);
    console.log(`- Arquivo CSV: ${csvPath}`);
    
    console.log('\n✅ Simulação concluída com sucesso!');
    console.log('📁 O arquivo CSV está pronto para ser usado pelo agente de IA.');
    
  } catch (error) {
    console.error('❌ Erro na simulação:', error);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  main();
}

// Exemplos de diferentes estruturas de dados de imobiliárias
const exampleRealEstateStructures = {
  // Estrutura básica (imobiliária pequena)
  basic: [
    {
      nome: "Casa Simples",
      endereco: "Rua A, 123",
      preco: 300000,
      quartos: 3
    },
    {
      nome: "Apartamento Centro",
      endereco: "Rua B, 456", 
      preco: 450000,
      quartos: 2
    }
  ],
  
  // Estrutura intermediária
  intermediate: [
    {
      property_id: "P001",
      title: "Luxury Apartment",
      address: "123 Main St",
      price: 800000,
      bedrooms: 3,
      bathrooms: 2,
      area: 120,
      status: "available"
    }
  ],
  
  // Estrutura avançada (imobiliária grande)
  advanced: [
    {
      listing_id: "LUX-001",
      property_name: "Penthouse Downtown",
      full_address: "456 Business Ave, Floor 25, Downtown",
      listing_price: 1500000,
      property_type: "Penthouse",
      bedrooms: 4,
      bathrooms: 3,
      square_meters: 250,
      parking_spaces: 2,
      building_year: 2020,
      property_condition: "New",
      amenities: ["Pool", "Gym", "Concierge", "Rooftop"],
      neighborhood: "Downtown",
      city: "São Paulo",
      state: "SP",
      zip_code: "01234-567",
      listing_date: "2024-01-15",
      agent_name: "João Silva",
      agency: "Luxury Real Estate",
      description: "Amazing penthouse with city views",
      photos_count: 15,
      virtual_tour: true,
      energy_efficiency: "A+"
    }
  ]
};

// Função para testar diferentes estruturas
async function testDifferentStructures() {
  console.log('\n🧪 Testando diferentes estruturas de dados...\n');
  
  // Testar estrutura básica
  console.log('📋 Estrutura Básica:');
  generateCSV(exampleRealEstateStructures.basic, 'basic_structure.csv');
  
  // Testar estrutura intermediária  
  console.log('\n📋 Estrutura Intermediária:');
  generateCSV(exampleRealEstateStructures.intermediate, 'intermediate_structure.csv');
  
  // Testar estrutura avançada
  console.log('\n📋 Estrutura Avançada:');
  generateCSV(exampleRealEstateStructures.advanced, 'advanced_structure.csv');
}

export {
  fetchPropertiesFromHubSpot,
  generateCSV,
  main,
  testDifferentStructures,
  exampleRealEstateStructures
};
