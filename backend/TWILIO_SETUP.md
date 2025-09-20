# 📱 Twilio WhatsApp Integration Setup

## 1. **Criar conta Twilio (Gratuito)**
1. Acesse https://www.twilio.com/try-twilio
2. Crie conta gratuita ($15 de crédito)
3. Verifique seu telefone

## 2. **Obter credenciais**
1. No Console Twilio, vá em **Account Info**
2. Copie **Account SID** e **Auth Token**

## 3. **Configurar WhatsApp Sandbox**
1. No Console: **Messaging** → **Try it out** → **Send a WhatsApp message**
2. Anote o número sandbox: `+1 415 523 8886`
3. Anote sua palavra-chave (ex: `join <palavra>`)

## 4. **Configurar .env**
```bash
# Twilio Configuration (Sandbox for testing)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_WHATSAPP_NUMBER=+14155238886
```

## 5. **Configurar Webhook**

### **Desenvolvimento (Local)**
1. No Console Twilio: **Messaging** → **Settings** → **WhatsApp sandbox settings**
2. **When a message comes in**: `http://localhost:3000/api/v1/twilio/webhook/test-integration`
3. **HTTP POST**

### **Produção (Railway)**
1. No Console Twilio: **Messaging** → **Settings** → **WhatsApp sandbox settings**
2. **When a message comes in**: `https://sensay-search-home-ai-production.up.railway.app/api/v1/twilio/webhook/test-integration`
3. **HTTP POST**

> **✅ URL configurada para produção**

## 6. **Testar**
```bash
# 1. Executar servidor
npm start

# 2. Testar conexão
node dist/scripts/testTwilioSandbox.js

# 3. No WhatsApp:
# - Envie "join <sua-palavra>" para +1 415 523 8886
# - Depois envie qualquer mensagem
```

## 7. **Endpoints disponíveis**
- `POST /api/v1/twilio/integrations` - Criar integração
- `POST /api/v1/twilio/integrations/:id/activate` - Ativar
- `POST /api/v1/twilio/webhook/:id` - Webhook WhatsApp
- `DELETE /api/v1/twilio/integrations/:id` - Deletar

## 🧪 **Teste rápido**
O endpoint `test-integration` retorna echo de qualquer mensagem enviada.

## 🚀 **Produção**
Para usar número WhatsApp Business próprio:
1. Solicite aprovação do WhatsApp Business
2. Configure número verificado
3. Atualize `TWILIO_WHATSAPP_NUMBER` no .env
