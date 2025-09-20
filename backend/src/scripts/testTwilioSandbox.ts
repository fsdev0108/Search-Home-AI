import axios from 'axios'
import { config } from '../config'

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN
const TWILIO_WHATSAPP_NUMBER = process.env.TWILIO_WHATSAPP_NUMBER || '+14155238886'

async function testTwilioConnection() {
  console.log('🧪 Testing Twilio Sandbox Connection...\n')

  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
    console.error('❌ Missing Twilio credentials in .env file')
    console.log('Please add:')
    console.log('TWILIO_ACCOUNT_SID=your_account_sid')
    console.log('TWILIO_AUTH_TOKEN=your_auth_token')
    return
  }

  try {
    const auth = Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString('base64')
    
    const isProduction = process.env.NODE_ENV === 'production'
    const baseUrl = isProduction 
      ? process.env.RAILWAY_PUBLIC_DOMAIN || 'https://seu-app.up.railway.app'
      : `http://localhost:${config.port}`
    
    console.log('📋 Twilio Account Info:')
    console.log(`Account SID: ${TWILIO_ACCOUNT_SID}`)
    console.log(`WhatsApp Number: ${TWILIO_WHATSAPP_NUMBER}`)
    console.log(`Environment: ${isProduction ? 'Production' : 'Development'}`)
    console.log(`Webhook URL: ${baseUrl}${config.api.prefix}/twilio/webhook/test-integration`)
    
    const response = await axios.get(
      `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}.json`,
      {
        headers: {
          'Authorization': `Basic ${auth}`
        }
      }
    )

    if (response.status === 200) {
      console.log('\n✅ Twilio connection successful!')
      console.log(`Account Name: ${response.data.friendly_name}`)
      console.log(`Account Status: ${response.data.status}`)
      
      console.log('\n📱 To test WhatsApp:')
      console.log('1. Send "join <sandbox-keyword>" to +1 415 523 8886 on WhatsApp')
      console.log('2. Then send any message to test the integration')
      console.log('\n🔗 Webhook Configuration:')
      console.log('- Go to Twilio Console > Messaging > Try it out > WhatsApp')
      console.log(`- Set webhook URL: ${baseUrl}${config.api.prefix}/twilio/webhook/test-integration`)
      
      if (isProduction) {
        console.log('\n🚀 Production Mode:')
        console.log('- Make sure your Railway app is deployed and running')
        console.log('- Webhook will receive messages from WhatsApp users')
      }
      
    } else {
      console.log('❌ Failed to connect to Twilio')
    }

  } catch (error: any) {
    console.error('❌ Twilio connection failed:', error.response?.data || error.message)
    
    if (error.response?.status === 401) {
      console.log('\n💡 Authentication failed. Please check:')
      console.log('1. Account SID is correct')
      console.log('2. Auth Token is correct')
      console.log('3. Credentials are from the same Twilio account')
    }
  }
}

if (require.main === module) {
  testTwilioConnection()
}

export { testTwilioConnection }
