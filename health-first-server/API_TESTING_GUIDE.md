# 🧪 Health First API Testing Guide

## 📋 **Overview**
This guide provides step-by-step instructions for testing all implemented modules using Postman.

## 🚀 **Server Status**
- **Server URL**: `http://localhost:3000`
- **Base API URL**: `http://localhost:3000/api/v1`
- **Status**: ✅ Running

## 📦 **Postman Collections**

### 1. **Provider API Collection**
- **File**: `Health-First-Provider-API.postman_collection.json`
- **Import**: Import this file into Postman

### 2. **Patient API Collection**
- **File**: `Health-First-Patient-API.postman_collection.json`
- **Import**: Import this file into Postman

## 🔧 **Environment Setup**

### **Postman Environment Variables**
Set up these variables in your Postman environment:

```json
{
  "base_url": "http://localhost:3000/api/v1",
  "access_token": "",
  "refresh_token": "",
  "provider_id": "",
  "patient_id": ""
}
```

## 🧪 **Testing Sequence**

### **Phase 1: Provider Testing**

#### **Step 1: Provider Registration**
```http
POST {{base_url}}/provider/register
Content-Type: application/json

{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john.doe@example.com",
  "phone_number": "+12345678901",
  "password": "StrongPassw0rd!",
  "confirm_password": "StrongPassw0rd!",
  "specialization": "Cardiology",
  "license_number": "MD123456",
  "years_of_experience": 10,
  "clinic_address": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zip": "10001"
  },
  "medical_school": "Harvard Medical School",
  "board_certifications": ["American Board of Cardiology"],
  "languages_spoken": ["English"]
}
```

**Expected Response**: `201 Created`
- ✅ Provider registered successfully
- ✅ Verification email sent
- ✅ Provider ID returned

#### **Step 2: Provider Login**
```http
POST {{base_url}}/provider/login
Content-Type: application/json

{
  "email": "john.doe@example.com",
  "password": "StrongPassw0rd!",
  "remember_me": true,
  "device_info": {
    "device_name": "Postman",
    "device_type": "desktop",
    "browser": "Postman",
    "os": "Windows"
  }
}
```

**Expected Response**: `200 OK`
- ✅ Access token and refresh token returned
- ✅ Provider information included
- ✅ Tokens auto-saved to environment

#### **Step 3: Get Onboarding Status**
```http
GET {{base_url}}/provider/onboarding/status
Authorization: Bearer {{access_token}}
```

**Expected Response**: `200 OK`
- ✅ Current onboarding step
- ✅ Progress percentage
- ✅ Next steps listed

#### **Step 4: Provider Management**
```http
GET {{base_url}}/provider?page=1&limit=10
Authorization: Bearer {{access_token}}
```

**Expected Response**: `200 OK`
- ✅ List of providers with pagination
- ✅ Filtering options available

### **Phase 2: Patient Testing**

#### **Step 1: Patient Registration**
```http
POST {{base_url}}/patient/register
Content-Type: application/json

{
  "first_name": "Jane",
  "last_name": "Smith",
  "email": "jane.smith@example.com",
  "phone_number": "+12345678902",
  "password": "StrongPassw0rd!",
  "confirm_password": "StrongPassw0rd!",
  "date_of_birth": "1990-05-15",
  "gender": "female",
  "blood_type": "O+",
  "height": 165,
  "weight": 60,
  "address": {
    "street": "456 Oak St",
    "city": "Los Angeles",
    "state": "CA",
    "zip": "90210"
  },
  "preferred_language": "English",
  "emergency_contact": {
    "name": "John Smith",
    "relationship": "Spouse",
    "phone": "+12345678903",
    "email": "john.smith@example.com"
  },
  "insurance": {
    "provider": "Blue Cross Blue Shield",
    "policy_number": "BCBS123456",
    "group_number": "GRP789012",
    "expiry_date": "2024-12-31"
  },
  "medical_history": {
    "conditions": [
      {
        "condition": "Hypertension",
        "diagnosis_date": "2020-03-15",
        "is_active": true,
        "notes": "Controlled with medication"
      }
    ],
    "medications": [
      {
        "name": "Lisinopril",
        "dosage": "10mg",
        "frequency": "daily",
        "start_date": "2020-03-20",
        "is_active": true
      }
    ],
    "allergies": [
      {
        "allergen": "Penicillin",
        "reaction": "Rash",
        "severity": "moderate"
      }
    ]
  }
}
```

**Expected Response**: `201 Created`
- ✅ Patient registered successfully
- ✅ Verification email sent
- ✅ Patient ID returned

#### **Step 2: Patient Login**
```http
POST {{base_url}}/patient/login
Content-Type: application/json

{
  "email": "jane.smith@example.com",
  "password": "StrongPassw0rd!",
  "remember_me": true,
  "device_info": {
    "device_name": "Postman",
    "device_type": "desktop",
    "browser": "Postman",
    "os": "Windows"
  }
}
```

**Expected Response**: `200 OK`
- ✅ Access token and refresh token returned
- ✅ Patient information included
- ✅ Tokens auto-saved to environment

#### **Step 3: Get Patient Onboarding Status**
```http
GET {{base_url}}/patient/onboarding/status
Authorization: Bearer {{access_token}}
```

**Expected Response**: `200 OK`
- ✅ Current onboarding step
- ✅ Progress percentage
- ✅ Next steps listed

#### **Step 4: Patient Management**
```http
GET {{base_url}}/patient?page=1&limit=10
Authorization: Bearer {{access_token}}
```

**Expected Response**: `200 OK`
- ✅ List of patients with pagination
- ✅ Filtering options available

## 🔄 **Advanced Testing Scenarios**

### **Token Refresh Testing**
```http
POST {{base_url}}/provider/refresh-token
Content-Type: application/json

{
  "refresh_token": "{{refresh_token}}"
}
```

### **Logout Testing**
```http
POST {{base_url}}/provider/logout
Authorization: Bearer {{access_token}}
```

### **Error Handling Testing**

#### **Invalid Login**
```http
POST {{base_url}}/provider/login
Content-Type: application/json

{
  "email": "invalid@example.com",
  "password": "wrongpassword"
}
```

**Expected Response**: `401 Unauthorized`

#### **Duplicate Registration**
```http
POST {{base_url}}/provider/register
Content-Type: application/json

{
  "email": "john.doe@example.com",
  // ... same data as before
}
```

**Expected Response**: `409 Conflict`

## 📊 **Test Data Examples**

### **Provider Test Data**
```json
{
  "first_name": "Test",
  "last_name": "Provider",
  "email": "test.provider@example.com",
  "phone_number": "+19876543210",
  "password": "TestPassw0rd!",
  "confirm_password": "TestPassw0rd!",
  "specialization": "Neurology",
  "license_number": "MD789012",
  "years_of_experience": 8,
  "clinic_address": {
    "street": "789 Test Ave",
    "city": "Chicago",
    "state": "IL",
    "zip": "60601"
  },
  "medical_school": "Northwestern Medical School",
  "board_certifications": ["American Board of Neurology"],
  "languages_spoken": ["English", "French"]
}
```

### **Patient Test Data**
```json
{
  "first_name": "Test",
  "last_name": "Patient",
  "email": "test.patient@example.com",
  "phone_number": "+19876543211",
  "password": "TestPassw0rd!",
  "confirm_password": "TestPassw0rd!",
  "date_of_birth": "1985-08-20",
  "gender": "male",
  "blood_type": "A+",
  "height": 175,
  "weight": 70,
  "address": {
    "street": "321 Test Blvd",
    "city": "Miami",
    "state": "FL",
    "zip": "33101"
  },
  "preferred_language": "English",
  "emergency_contact": {
    "name": "Test Emergency Contact",
    "relationship": "Friend",
    "phone": "+19876543212",
    "email": "emergency@example.com"
  },
  "insurance": {
    "provider": "Cigna",
    "policy_number": "CIGNA456789",
    "group_number": "GRP123456",
    "expiry_date": "2024-06-30"
  },
  "medical_history": {
    "conditions": [
      {
        "condition": "Diabetes Type 2",
        "diagnosis_date": "2018-11-10",
        "is_active": true,
        "notes": "Well controlled with diet and exercise"
      }
    ],
    "medications": [
      {
        "name": "Metformin",
        "dosage": "500mg",
        "frequency": "twice daily",
        "start_date": "2018-11-15",
        "is_active": true
      }
    ],
    "allergies": [
      {
        "allergen": "Sulfa drugs",
        "reaction": "Hives",
        "severity": "severe"
      }
    ]
  }
}
```

## ✅ **Success Criteria**

### **Provider Module**
- ✅ Registration creates provider account
- ✅ Login returns valid tokens
- ✅ Onboarding status tracks progress
- ✅ CRUD operations work correctly
- ✅ Error handling works properly

### **Patient Module**
- ✅ Registration creates patient account
- ✅ Login returns valid tokens
- ✅ Onboarding status tracks progress
- ✅ CRUD operations work correctly
- ✅ Error handling works properly

## 🚨 **Common Issues & Solutions**

### **Issue 1: MongoDB Connection**
- **Error**: "MongoDB connection failed"
- **Solution**: Ensure MongoDB is running and connection string is correct

### **Issue 2: Token Expiration**
- **Error**: "Invalid token"
- **Solution**: Use refresh token to get new access token

### **Issue 3: Rate Limiting**
- **Error**: "Too many requests"
- **Solution**: Wait for rate limit to reset or use different IP

### **Issue 4: Validation Errors**
- **Error**: "Validation failed"
- **Solution**: Check required fields and data format

## 📈 **Performance Testing**

### **Load Testing**
- Test with multiple concurrent requests
- Monitor response times
- Check for memory leaks

### **Security Testing**
- Test with invalid tokens
- Test with malformed data
- Test brute force protection

## 🎯 **Next Steps**

1. **Import Collections**: Import both Postman collections
2. **Set Environment**: Configure environment variables
3. **Run Tests**: Execute tests in sequence
4. **Verify Results**: Check all responses match expected format
5. **Document Issues**: Note any failures or unexpected behavior

## 📞 **Support**

If you encounter issues:
1. Check server logs for errors
2. Verify MongoDB connection
3. Ensure all dependencies are installed
4. Check environment variables

**Happy Testing! 🚀** 