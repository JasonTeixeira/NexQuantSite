# 🌐 **DNS SETUP FOR NEXURAL.IO**
*Complete DNS configuration for Namecheap → Google Workspace + Resend + OVHCloud*

---

## **📋 OVERVIEW**
- **Domain**: nexural.io (Namecheap)
- **Business Email**: contact@nexural.io (Google Workspace)
- **Transactional**: noreply@send.nexural.io (Resend)
- **Website**: https://nexural.io (OVHCloud)

---

## **1️⃣ GOOGLE WORKSPACE SETUP (Business Email)**

### **Step 1: Sign up for Google Workspace**
1. Go to: https://workspace.google.com/
2. Choose "Business Starter" ($6/user/month)
3. Enter domain: `nexural.io`
4. Create admin account: `admin@nexural.io`

### **Step 2: Add MX Records in Namecheap**
```
Login to Namecheap → Domain List → nexural.io → Advanced DNS

Add these MX Records:
Type    Host    Value                           Priority
MX      @       aspmx.l.google.com              1
MX      @       alt1.aspmx.l.google.com         5
MX      @       alt2.aspmx.l.google.com         5
MX      @       alt3.aspmx.l.google.com         10
MX      @       alt4.aspmx.l.google.com         10
```

### **Step 3: Add TXT Record for Verification**
```
Type    Host    Value
TXT     @       google-site-verification=YOUR_VERIFICATION_CODE
```
*(Google will provide the verification code)*

---

## **2️⃣ RESEND SETUP (Transactional Emails)**

### **Step 1: Add Domain in Resend**
1. Go to: https://resend.com/domains
2. Click "Add Domain"
3. Enter: `send.nexural.io`
4. Select "Subdomain"

### **Step 2: Add DNS Records in Namecheap**
```
Resend will provide these records - add them to Namecheap:

Type    Host              Value
TXT     send              v=spf1 include:_spf.resend.com ~all
CNAME   resend._domainkey [provided by Resend]
TXT     _dmarc.send       v=DMARC1; p=none; rua=mailto:admin@nexural.io
```

### **Step 3: Verify Domain**
- Wait 5-10 minutes for DNS propagation
- Click "Verify" in Resend dashboard
- Should see green checkmark

---

## **3️⃣ OVHCLOUD DEPLOYMENT**

### **Step 1: Point Domain to OVHCloud**
```
In Namecheap Advanced DNS:

Type    Host    Value                    TTL
A       @       YOUR_OVH_SERVER_IP      300
A       www     YOUR_OVH_SERVER_IP      300
```

### **Step 2: SSL Certificate Setup**
```bash
# On OVHCloud server
certbot --nginx -d nexural.io -d www.nexural.io
```

---

## **4️⃣ COMPLETE DNS CONFIGURATION**

### **Final Namecheap DNS Table:**
```
Type    Host              Value                           TTL     Priority
A       @                YOUR_OVH_SERVER_IP             300
A       www              YOUR_OVH_SERVER_IP             300
MX      @                aspmx.l.google.com             300     1
MX      @                alt1.aspmx.l.google.com        300     5
MX      @                alt2.aspmx.l.google.com        300     5
MX      @                alt3.aspmx.l.google.com        300     10
MX      @                alt4.aspmx.l.google.com        300     10
TXT     @                google-site-verification=XXX   300
TXT     @                v=spf1 include:_spf.google.com 300
TXT     send             v=spf1 include:_spf.resend.com 300
CNAME   resend._domainkey [Resend DKIM record]          300
TXT     _dmarc.send      v=DMARC1; p=none; rua=...     300
```

---

## **5️⃣ EMAIL ACCOUNTS TO CREATE**

### **Google Workspace Accounts:**
```
admin@nexural.io     - Admin account
contact@nexural.io   - Customer support
support@nexural.io   - Technical support
info@nexural.io      - General inquiries
sales@nexural.io     - Sales inquiries
```

### **Resend Transactional:**
```
noreply@send.nexural.io     - System emails
alerts@send.nexural.io      - Trading alerts
billing@send.nexural.io     - Payment receipts
welcome@send.nexural.io     - Welcome emails
```

---

## **6️⃣ VERIFICATION STEPS**

### **Test Google Workspace:**
1. Send email to contact@nexural.io
2. Check if it arrives in Google Workspace
3. Reply to test outbound

### **Test Resend:**
1. Send test email via API
2. Check SPF/DKIM/DMARC records
3. Test deliverability to Gmail/Outlook

### **Test Website:**
1. Visit https://nexural.io
2. Verify SSL certificate
3. Test www redirect

---

## **7️⃣ COSTS BREAKDOWN**

```
Google Workspace: $6/month (1 user)
Resend: Free (up to 3,000 emails/month)
Domain: $12/year (already paid)
OVHCloud: €20-50/month
SSL: Free (Let's Encrypt)

Total Monthly: ~€30-60
```

---

## **🚀 IMPLEMENTATION TIMELINE**

### **Day 1: Google Workspace (30 mins)**
- Sign up
- Add MX records
- Verify domain
- Create contact@nexural.io

### **Day 2: Resend Subdomain (15 mins)**
- Add send.nexural.io to Resend
- Add DNS records
- Verify domain

### **Day 3: Deploy & SSL (2 hours)**
- Point domain to OVHCloud
- Setup SSL certificate
- Test everything

---

## **✅ VERIFICATION COMMANDS**

```bash
# Check MX records
dig MX nexural.io

# Check SPF record
dig TXT send.nexural.io

# Check website
curl -I https://nexural.io

# Test SSL
openssl s_client -connect nexural.io:443
```

---

## **🎯 PROFESSIONAL EMAIL SETUP**

Once Google Workspace is active:

### **Email Signatures:**
```
[Your Name]
[Your Title]
Nexural Trading Platform
📧 contact@nexural.io
🌐 https://nexural.io
```

### **Auto-Responders:**
- Set up out-of-office replies
- Create support ticket system
- Forward important emails

---

## **⚡ QUICK START**

1. **Right now**: Sign up for Google Workspace
2. **Add MX records**: In Namecheap DNS
3. **Add Resend domain**: send.nexural.io
4. **Update .env**: Use your new domain
5. **Deploy**: Point DNS to OVHCloud

**Your professional email setup will be complete in 24 hours!**

---

*This setup gives you enterprise-grade email infrastructure for €30/month*

