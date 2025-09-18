# 🏠 Sensay Admin Panel - Testing Guide

Administrative panel for managing users, replicas and files in the Sensay system for real estate.

## 🚀 How to Test

### 1. Access the Panel
```
http://localhost:3000
```

### 2. Login

#### 👑 **Admin (Full Access)**
- **Email:** `admin@herainov.com`
- **Password:** `admin123`
- **Permissions:** Access to all functionalities

#### 👤 **Regular User (Limited Access)**
- **Email:** `user@herainov.com`
- **Password:** `user123`
- **Permissions:** Access only to own replicas and data

## 📋 Features by User Type

### 👑 **Admin - Complete Features**

#### **Dashboard**
- ✅ Overview of all replicas
- ✅ Usage statistics
- ✅ User management

#### **Users**
- ✅ View all users in the system
- ✅ Manage user accounts
- ✅ View user statistics

#### **Replicas**
- ✅ View all replicas in the system
- ✅ Manage replicas from any user
- ✅ View knowledge base files

### 👤 **Regular User - Limited Features**

#### **Dashboard**
- ✅ View own replicas
- ✅ Personal statistics

#### **Replicas**
- ✅ View only own replicas
- ✅ Manage knowledge base files
- ✅ View conversation history

#### **Widget**
- ✅ Generate embed code for own replicas
- ✅ Configure personalized widget

#### **Settings**
- ✅ HubSpot integration
- ✅ Personal settings

## 🏢 Testing Scenarios for Real Estate

### **Scenario 1: Creating a Real Estate Replica**

#### **1. Login as Admin**
```
Email: admin@herainov.com
Password: admin123
```

#### **2. Create Model Replica**
- **Name:** `Real Estate Sales Assistant`
- **Description:** `Agent specialized in residential and commercial real estate sales`
- **Type:** `Real Estate Sales`
- **Settings:**
  - Personality: Professional and consultative
  - Specialization: Real estate sales
  - Tone: Friendly and trustworthy

#### **3. Add Knowledge Base Files**

The system will automatically add the following files when you integrate with HubSpot:

##### **Automatic Files (Added by System):**
- **Real Estate Agent Instructions** - Professional guidelines for the AI agent
- **Properties Database** - CSV file with your property listings from HubSpot

##### **Manual Files (Optional):**
- **Company Information** - Your real estate agency details
- **Additional FAQ** - Specific questions about your services
- **Neighborhood Guide** - Information about areas you serve

### **Scenario 2: Widget Testing for Client**

#### **1. Login as Regular User**
```
Email: user@herainov.com
Password: user123
```

#### **2. Configure Widget**
- **Replica:** Select created replica
- **Position:** `bottom-right`
- **Theme:** `auto`
- **Color:** `#3cacae`

#### **3. Generate Embed Code**
```html
<script src="https://yourdomain.com/chat-widget.js"></script>
<script>
  RealEstateChat.init({
    userId: 'user-uuid',
    replicaUuid: 'replica-uuid',
    position: 'bottom-right',
    theme: 'auto',
    primaryColor: '#3cacae'
  });
</script>
```

#### **4. Test Widget**
- Copy generated code
- Paste in test page
- Verify chat functionality

### **Scenario 3: HubSpot Integration User**

#### **1. Configure HubSpot**
- **API Key:** Insert HubSpot key
- **Target Replica:** Select replica to receive data
- **Sync:** Execute synchronization

#### **2. Verify Data**
- Access selected replica
- Check knowledge base files
- Confirm property data


## 📊 What You Need to Train the Agent

### **Required Data:**
1. **Property Spreadsheet** - Your property listings (CSV format)
2. **Real Estate Agency Information** - Your company details and services

### **Property Spreadsheet Should Include:**
- Property ID, Address, Neighborhood, Bedrooms, Bathrooms
- Area (sqm), Price, Type, Status, Description
- Features, Parking, Floor, Building Age
- Condominium Fee, IPTU, Contact Agent, Photos URL


## 🎯 Testing Objectives

The system should demonstrate:
- ✅ Creation of real estate specialized assistants
- ✅ Upload of property catalogs and knowledge bases
- ✅ Widget configuration for real estate websites
- ✅ Integration with CRM systems (HubSpot)
- ✅ Role-based access control
- ✅ Personalized embed code generation

## 💡 Note

This README provides **example scenarios** and **suggested approaches** for testing the admin panel. Feel free to adapt the examples to your specific needs and use cases. The goal is to demonstrate the system's capabilities with realistic real estate scenarios.

---

**Developed with ❤️ for the Sensay system - Real Estate Solutions**