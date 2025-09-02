# Real Estate AI Agent API

API para integração com Sensay para criação de agentes de IA para imobiliárias.

## 🚀 Tecnologias

- **Node.js** + **TypeScript**
- **Fastify** - Framework web
- **Prisma** + **SQLite** - ORM e banco de dados
- **Sensay API** - Plataforma de IA

## 📋 Funcionalidades

- ✅ Criação de usuários
- ✅ Criação de réplicas (agentes IA)
- ✅ Upload de arquivos Excel
- ✅ Agendamento de uploads diários
- ✅ Gerenciamento de storage (deleta uploads anteriores)
- ✅ Integração com Sensay API

## 🗄️ Banco de Dados

O projeto usa **SQLite** como banco local para MVP:

```bash
# Gerar cliente Prisma
npm run db:generate

# Sincronizar schema com banco
npm run db:push

# Abrir interface visual do banco
npm run db:studio
```

## 🔧 Configuração

1. **Instalar dependências:**
```bash
npm install
```

2. **Configurar variáveis de ambiente:**
```bash
cp .env.example .env
# Editar .env com suas credenciais
```

3. **Configurar banco de dados:**
```bash
npm run db:push
```

4. **Executar:**
```bash
# Desenvolvimento
npm run dev

# Produção
npm run build
npm start
```

## 📡 API Endpoints

### Usuários
- `POST /api/v1/users` - Criar usuário
- `GET /api/v1/users/:userId/replicas` - Listar réplicas do usuário

### Réplicas
- `POST /api/v1/replicas` - Criar réplica

### Uploads
- `POST /api/v1/replicas/:replicaUuid/upload` - Upload de arquivo
- `POST /api/v1/uploads/schedule` - Agendar upload
- `GET /api/v1/uploads/schedules` - Listar agendamentos
- `POST /api/v1/uploads/process` - Processar uploads agendados

## 📊 Estrutura do Banco

- **users** - Usuários do sistema
- **replicas** - Réplicas/agentes IA
- **upload_schedules** - Agendamentos de upload
- **file_uploads** - Histórico de uploads

## 🔄 Fluxo de Dados

1. **Criação de Usuário** → Salva no banco local
2. **Criação de Réplica** → Cria no Sensay + salva localmente
3. **Upload de Arquivo** → Upload para Sensay + agendamento diário
4. **Processamento Diário** → Executa uploads agendados automaticamente

## 🛠️ Comandos Úteis

```bash
# Desenvolvimento
npm run dev

# Banco de dados
npm run db:generate  # Gerar cliente Prisma
npm run db:push      # Sincronizar schema
npm run db:studio    # Interface visual do banco

# Build e produção
npm run build
npm start
```
