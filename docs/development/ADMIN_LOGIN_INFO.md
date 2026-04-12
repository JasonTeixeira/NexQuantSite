# 🔐 Login Credentials (Development Mode)

## 🛡️ Admin Credentials (For Admin Dashboard)

You can log into the admin dashboard using these demo credentials:

### **Primary Admin:**
- **Email:** `admin@nexural.com`
- **Password:** `admin123`

### **Manager Admin:**
- **Email:** `manager@nexural.com`  
- **Password:** `manager123`

### **Demo Admin:**
- **Email:** `demo@nexural.com`  
- **Password:** `demo123`

### **Super Admin:**
- **Email:** `super@nexural.com`
- **Password:** `super123`

---

## 👤 User Credentials (For Regular User Login)

You can log into the main platform using these demo credentials:

### **Demo User:**
- **Email:** `demo@nexural.com`
- **Password:** `demo123`

### **Test User:**
- **Email:** `user@nexural.com`  
- **Password:** `user123`

### **Sample User:**
- **Email:** `test@nexural.com`
- **Password:** `test123`

---

## 🌐 Access Points

### **Admin Login Page:**
```
http://localhost:3011/admin/login
```

### **Regular User Login Page:**
```
http://localhost:3011/login
```

### **Admin Dashboard:**
```
http://localhost:3011/admin
```

### **Users Management Page:**
```
http://localhost:3011/admin/users
```

### **Main Platform Dashboard:**
```
http://localhost:3011/dashboard
```

---

## 📊 Available Admin Pages

1. **Dashboard** - Overview and metrics
2. **Users** - User management and analytics  
3. **Bot Management** - Trading bot controls
4. **Community Management** - Content moderation
5. **Marketplace Management** - Commerce controls
6. **Leaderboard Management** - Competition controls
7. **LMS Management** - Learning system controls
8. **Revenue Analytics** - Financial tracking
9. **Security Monitoring** - Platform security

---

## 🔧 Development Notes

- **Development Mode:** Uses demo credentials for easy testing
- **Production Mode:** Will use secure database authentication
- **Token Duration:** 24 hours
- **Security:** JWT-based authentication with HTTP-only cookies

---

## ✅ Quick Login Steps

### **For Admin Access:**
1. Go to `http://localhost:3011/admin/login`
2. Click "Show Demo Credentials" button on the login page
3. Click "Use" next to any admin credential set
4. Click "Sign In"
5. You'll be redirected to the admin dashboard

### **For User Access:**
1. Go to `http://localhost:3011/login`
2. Use any of the user credentials listed above
3. Click "Login" 
4. You'll be redirected to the main platform dashboard

---

## 🔧 Development Features

- **Demo Credentials UI:** Both login pages show demo credentials for easy testing
- **No Database Required:** Works entirely with mock authentication
- **Automatic Cookies:** Sessions are managed with secure HTTP-only cookies
- **24-Hour Sessions:** Login tokens last for 24 hours
- **Full Feature Access:** All pages and features available with demo accounts

---

## 🚀 Status: FULLY WORKING!

**Both admin and user authentication are now fully functional for development and testing!** 🎉

- ✅ Admin login with multiple role levels
- ✅ Regular user login with demo accounts  
- ✅ No database setup required
- ✅ All pages accessible
- ✅ Session management working
- ✅ Easy credential switching via UI
