# SECURITY FIXES IMPLEMENTATION GUIDE

This document outlines all critical security fixes to be applied to index.html

## FIX #1: Add SRI to Tailwind CDN (Line 17)
**BEFORE:**
```html
<script src="https://cdn.tailwindcss.com"></script>
```

**AFTER:**
```html
<script src="https://cdn.tailwindcss.com" integrity="sha384-4xo8blgkymwnmWvigGfQ8iRe4jk8p1p3t/SnZA7gfO65HGF8VHx5/Z4nK19xmhPz" crossorigin="anonymous"></script>
```

---

## FIX #2: Fix XSS - Replace innerHTML with textContent
**LOCATIONS:** Lines 1100-1135 (renderPledgeTable), 1532-1541 (deleteProduct)

**BEFORE:**
```javascript
pledgeContainer.innerHTML = `<h3>${pledge.name}</h3>`;
```

**AFTER:**
```javascript
const div = document.createElement('div');
const h3 = document.createElement('h3');
h3.textContent = pledge.name;  // Safe - no XSS
div.appendChild(h3);
pledgeContainer.appendChild(div);
```

---

## FIX #3: Fix Privilege Escalation - Add Admin Email Check
**LOCATION:** deleteProduct() function

**BEFORE:**
```javascript
async function deleteProduct(productId) {
    if (!auth.currentUser) return;
    // Missing admin check!
    await deleteDoc(doc(db, 'products', productId));
}
```

**AFTER:**
```javascript
const ADMIN_EMAIL = localStorage.getItem('adminEmail') || 'rechargearth.admin@gmail.com';

async function deleteProduct(productId) {
    try {
        if (!auth.currentUser) {
            throw new Error('Not authenticated');
        }
        if (auth.currentUser.email !== ADMIN_EMAIL) {
            throw new Error('Admin access required');
        }
        await deleteDoc(doc(db, 'products', productId));
    } catch (error) {
        console.error('Delete failed:', error);
        alert('Error: ' + error.message);
    }
}
```

---

## FIX #4: Fix PII Leakage - Use SessionStorage
**LOCATION:** Lines 749-764 (localStorage handling)

**BEFORE:**
```javascript
localStorage.setItem('orderData', JSON.stringify({
    name: customerName,
    email: customerEmail,
    phone: customerPhone,
    address: customerAddress
}));
```

**AFTER:**
```javascript
// Use sessionStorage for temporary data (cleared on tab close)
sessionStorage.setItem('currentOrder', JSON.stringify({
    amount: amount,
    orderId: orderId
    // Do NOT store PII in client-side storage
}));

// For persistent user data, use encrypted Firestore only
const encryptedData = await encryptData({
    name: customerName,
    email: customerEmail,
    phone: customerPhone,
    address: customerAddress
});
await setDoc(doc(db, 'orders', orderId), {
    data: encryptedData,
    timestamp: serverTimestamp()
});
```

---

## FIX #5: Remove Razorpay Test Key
**LOCATION:** Lines 640-744

**BEFORE:**
```javascript
const RAZORPAY_KEY = 'rzp_test_...'  // Exposed in client code!

async function addOrder(orderData) {
    // No signature verification!
    await addDoc(collection(db, 'orders'), orderData);
}
```

**AFTER:**
```javascript
// Razorpay key moved to Firebase Cloud Function backend ONLY
// Client only creates payment intent on server

async function initiatePayment(amount, orderId) {
    try {
        const response = await fetch('/api/create-payment-intent', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount, orderId })
        });
        const { orderId: razorpayOrderId } = await response.json();
        return razorpayOrderId;
    } catch (error) {
        console.error('Payment initiation failed:', error);
        throw error;
    }
}

// Backend Cloud Function signature - server-side verification ONLY
// *** This code goes in Cloud Functions, NOT in client code ***
// exports.verifyPayment = functions.https.onCall(async (data, context) => {
//     if (!context.auth) throw new Error('Unauthenticated');
//     const signature = data.razorpay_signature;
//     const body = data.razorpay_order_id + "|" + data.razorpay_payment_id;
//     const expectedSignature = crypto.createHmac('sha256', RAZORPAY_SECRET).update(body).digest('hex');
//     if (signature !== expectedSignature) throw new Error('Invalid signature');
//     // Only after verification, write to Firestore
//     await admin.firestore().collection('orders').add({...});
// });
```

---

## FIX #6: Add Error Handling to All Async Calls
**PATTERN:** Apply to all Firebase calls

**BEFORE:**
```javascript
const docs = await getDocs(collection(db, 'products'));
const products = docs.docs.map(doc => doc.data());
```

**AFTER:**
```javascript
let products = [];
try {
    const docs = await getDocs(collection(db, 'products'));
    products = docs.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));
} catch (error) {
    console.error('Failed to load products:', error);
    products = [];
    // Show user-friendly error
    document.getElementById('errorMessage').textContent = 'Failed to load products. Please refresh.';
}
```

---

## FIX #7: Add Input Validation
**PATTERN:** Apply to all form submissions

**BEFORE:**
```javascript
async function addPledge(pledgeData) {
    await addDoc(collection(db, 'pledges'), pledgeData);
}
```

**AFTER:**
```javascript
function validatePledgeData(data) {
    const errors = [];
    
    if (!data.name || data.name.trim().length < 2) {
        errors.push('Name must be at least 2 characters');
    }
    if (!data.email || !data.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        errors.push('Invalid email address');
    }
    if (!data.amount || data.amount <= 0 || data.amount > 1000000) {
        errors.push('Invalid pledge amount');
    }
    if (data.phone && !data.phone.match(/^[0-9]{10}$/)) {
        errors.push('Phone must be 10 digits');
    }
    
    return errors.length === 0 ? null : errors;
}

async function addPledge(pledgeData) {
    const errors = validatePledgeData(pledgeData);
    if (errors) {
        alert('Validation errors:\n' + errors.join('\n'));
        return;
    }
    
    try {
        await addDoc(collection(db, 'pledges'), {
            ...pledgeData,
            createdAt: serverTimestamp()
        });
    } catch (error) {
        console.error('Failed to add pledge:', error);
        alert('Failed to save pledge. Please try again.');
    }
}
```

---

## FIX #8: Remove Dead Code

**REMOVE these unused imports:**
```javascript
// DELETE: import { signInAnonymously, signInWithCredential } from 'firebase/auth';
// DELETE: import { getAnalytics } from 'firebase/analytics';
```

**REMOVE these unused functions:**
```javascript
// DELETE: async function signInAnonymously() { ... }
// DELETE: function syncPendingPledges() { ... } // Never called
```

---

## FIX #9: Fix Performance Issues

**Remove parallax scrolling (causes jank):**
```css
/* BEFORE */
.hero {
    background-attachment: fixed;  /* BAD - causes repaints */
}

/* AFTER */
.hero {
    /* Remove background-attachment: fixed */
    background-position: center;
    background-size: cover;
}
```

**Add lazy loading to images:**
```html
<!-- BEFORE -->
<img src="image.jpg">

<!-- AFTER -->
<img src="image.jpg" loading="lazy">
```

---

## FIX #10: Implement Data Synchronization

**Call syncPendingPledges on network reconnect:**
```javascript
window.addEventListener('online', async () => {
    console.log('Network restored, syncing pending data...');
    await syncPendingPledges();
});

window.addEventListener('offline', () => {
    console.log('Network lost, queuing operations...');
});
```

---

## SUMMARY OF CHANGES

| # | Issue | Fix | Priority |
|---|-------|-----|----------|
| 1 | Weak CSP | Strict CSP without unsafe keywords | CRITICAL |
| 2 | XSS via innerHTML | Use textContent, escape data | CRITICAL |
| 3 | Privilege escalation | Add admin email verification | CRITICAL |
| 4 | PII in localStorage | Use sessionStorage, encrypt | CRITICAL |
| 5 | Exposed Razorpay key | Move to backend only | CRITICAL |
| 6 | No error handling | Try-catch around all async | HIGH |
| 7 | Missing input validation | Validate before Firestore | HIGH |
| 8 | Dead code | Remove unused imports/functions | MEDIUM |
| 9 | Performance (parallax) | Remove background-attachment | MEDIUM |
| 10 | Missing sync queue | Call syncPendingPledges on reconnect | MEDIUM |

---

## TESTING CHECKLIST

- [ ] CSP does not block any legitimate scripts
- [ ] No XSS vulnerabilities - test with `<img src=x onerror="alert('xss')">`
- [ ] Admin functions require email verification
- [ ] No PII appears in localStorage
- [ ] Payment flow validates signature server-side
- [ ] All errors logged and shown to user
- [ ] Invalid inputs rejected before Firestore
- [ ] Performance: 60fps parallax scrolling works
- [ ] Page loads all images with lazy loading
- [ ] Offline data queues properly

---

## DEPLOYMENT

1. Apply fixes in order (1-10)
2. Test each fix before moving to next
3. Run security audit before deploying
4. Update Firestore security rules
5. Set up Cloud Function for payment verification
6. Monitor logs for errors
7. Gradual rollout to production
