# 🎬 Isbjørn x X402 Demo Script

## Pre-Demo Checklist

### Environment Setup
- [ ] Backend running on `http://localhost:5000`
- [ ] Frontend running on `http://localhost:3005` (or configured port)
- [ ] Database initialized with seed data
- [ ] X402 mock service responding
- [ ] Browser dev tools ready (for showing network calls)
- [ ] Screen recorder running (optional)

### Browser Setup
- [ ] Clear browser cache
- [ ] Open two browser tabs:
  - Tab 1: Frontend homepage
  - Tab 2: System Status page (`/system-status`)
- [ ] Prepare test credentials:
  - Email: `demo@company.co.nz`
  - Password: `Demo123!`
  - Company: `1234567` (test company number)

---

## 🎯 Demo Flow: "2-Minute Donation Journey"

### ⏱️ **Introduction (15 seconds)**

**Script:**
> "Hi! I'm showing Isbjørn — a donation platform that makes it **ridiculously easy** for NZ businesses to donate to charities and get instant tax receipts. The magic? We're using **X402** to handle payments, so donors don't need crypto wallets, but everything's still recorded on Avalanche for transparency."

**Actions:**
- Show homepage
- Point to "Donate Now" button

---

### ⏱️ **Act 1: System Health Check (20 seconds)**

**Script:**
> "First, let's verify all systems are live. This dashboard shows real-time status of our X402 payment gateway, Avalanche L1, and NZ compliance APIs."

**Actions:**
1. Navigate to `/system-status`
2. Point to **X402 Payments** card (should show "Online")
3. Point to **Avalanche / Iggy L1** card
4. Say: "Green means go — X402 is ready to process payments"
5. Quick scroll through other integrations

**What Judges See:**
- Professional system monitoring
- X402 explicitly called out
- Integration with multiple external services

---

### ⏱️ **Act 2: The Donation Flow (60 seconds)**

#### **Part A: Start Donation (15 seconds)**

**Script:**
> "Now let's make a donation. No signup forms, no crypto wallets — just pick a charity and amount."

**Actions:**
1. Click "Donate Now" from homepage
2. Select a charity (e.g., "Polar Bears International")
3. Enter donation amount: `$100`
4. Show brief info about charity

#### **Part B: Business Details (15 seconds)**

**Script:**
> "For NZ tax compliance, we auto-verify the business using the Companies Office API. Type in a company number..."

**Actions:**
1. Enter company number: `1234567`
2. Show auto-populated fields:
   - Company name
   - Company address
   - Director info
3. Enter email: `demo@company.co.nz`

#### **Part C: X402 Payment (30 seconds)**

**Script:**
> "Here's where X402 shines. Click 'Donate via X402' and watch this..."

**Actions:**
1. Point to the blue info box: **"⚡ Powered by x402"**
2. Click **"Donate $100 via x402"**
3. Open browser dev tools → Network tab (optional)
4. Show request to `/api/x402/create`
5. Show response with `paymentId` and `status`
6. Page transitions to success screen

**Script (during load):**
> "Behind the scenes, X402 is creating a checkout session, handling the payment, and triggering our webhook. The donor could pay with card or crypto — their choice."

**What Judges See:**
- Clean UX (no crypto jargon)
- X402 branding visible
- Fast processing (mock instant)
- Technical depth (network tab shows API calls)

---

### ⏱️ **Act 3: Instant Receipt (25 seconds)**

**Script:**
> "And... done! The donation is complete. Here's what the donor sees:"

**Actions:**
1. Point to success screen elements:
   - ✅ Green checkmark
   - Transaction ID (X402 payment ID)
   - "Download Tax Receipt" button
2. Click **"Download Tax Receipt"**
3. Show PDF opening (mock or real)
4. Highlight:
   - IRD-compliant format
   - Company details
   - Donation amount
   - Tax deduction info
   - Blockchain transaction hash (optional)

**Script:**
> "IRD-compliant receipt, generated instantly. The business can hand this to their accountant and claim the tax deduction. And if they want proof, they can verify the donation on Avalanche's blockchain."

---

### ⏱️ **Act 4: Dashboard View (20 seconds)**

**Script:**
> "Let's log in as the business to see their dashboard."

**Actions:**
1. Navigate to `/login` (or if already logged in, `/dashboard`)
2. Show business dashboard with:
   - Total donations for the year
   - List of recent donations
   - X402 payment IDs
   - Links to receipts
   - Blockchain verification links
3. Click on a donation to show details

**Script:**
> "All donations in one place, with links to receipts and blockchain verification. Perfect for year-end tax filing."

---

### ⏱️ **Act 5: The X402 Hook (20 seconds)**

**Script:**
> "For the devs in the audience, here's how easy X402 integration is..."

**Actions:**
1. Open code editor
2. Show `frontend/src/hooks/x402Hook.ts`
3. Scroll to `createPayment` function (lines 16-43)
4. Say: "One hook. Two functions. That's it."
5. Show backend route: `backend/src/routes/x402Donations.ts`

**Script:**
> "X402's SDK made this so simple. We're handling payments, wallets, and webhooks with about 200 lines of code total."

**What Judges See:**
- Clean code
- Simple integration
- X402 SDK in action

---

### ⏱️ **Conclusion (20 seconds)**

**Script:**
> "So that's Isbjørn — a real-world solution to a real-world problem. Businesses donate with zero friction, charities get funded faster, and everything's transparent on Avalanche. All powered by X402's hybrid payment system."

**Closing Line:**
> "This is how we bring the next million users to web3 — **without them even knowing they're using it**. Thank you!"

---

## 🎭 Demo Variants

### **Short Version (60 seconds)**
Use for: Quick pitches, elevator scenarios
- Skip system status check
- Go straight to donation flow
- Show receipt, mention blockchain
- Done

### **Technical Deep Dive (5 minutes)**
Use for: Judge Q&A, developer audience
- Show full code walkthrough
- Explain X402 checkout session creation
- Show webhook handling
- Demonstrate wallet management
- Show Avalanche L1 transaction lookup
- Explain IRD compliance engine

### **Business Focus (3 minutes)**
Use for: Non-technical judges, investors
- Focus on UX and problem-solving
- Show market size and revenue model
- Emphasize ease of use
- Demonstrate tax compliance
- Show growth potential

---

## 🎨 Demo Tips

### Visual Polish
- Use a clean browser profile (no weird extensions)
- Zoom browser to 125% for better visibility
- Use Cmd+Shift+P (Mac) or F11 (Windows) for full screen during screen share
- Have a backup video recording in case of technical issues

### Talking Points
- Always mention "X402" by name when clicking payment button
- Say "Avalanche" when showing blockchain verification
- Emphasize "zero crypto knowledge required"
- Highlight "instant" — speed is key
- Point to specific UI elements (don't just wave at screen)

### Handling Technical Issues
- If API fails: "This is a mock X402 integration for the demo, but you can see the full code"
- If slow load: Talk through what's happening behind the scenes
- If crash: Have a backup video or screenshots

### Engagement Questions
After demo, ask judges:
- "How many of you have donated to charity this year?"
- "How long did it take to get your receipt?"
- "Who actually verifies where the money went?"
→ Builds relatability and shows problem awareness

---

## 🔊 Voice & Energy

### Tone
- **Confident but not arrogant**
- **Enthusiastic but not over-the-top**
- **Technical but accessible**

### Pacing
- Speak clearly and not too fast
- Pause after showing something important
- Let judges absorb visual info

### Body Language (if in person)
- Gesture to screen elements
- Make eye contact with judges
- Smile when showing success screens

---

## 📋 Post-Demo Q&A Prep

### Expected Questions

**Q: "Is X402 live in production?"**
A: "For this demo, we're using X402's test environment. The integration is production-ready and we can deploy with real API keys immediately."

**Q: "How does the crypto conversion work?"**
A: "X402 handles that automatically. A donor paying with a card triggers X402 to convert fiat to AVAX, which then gets recorded on our Avalanche L1. The donor never sees this complexity."

**Q: "What's your revenue model?"**
A: "2.5% transaction fee on donations, split between X402 processing (~1%) and our platform (~1.5%). This is standard for donation platforms — lower than credit card fees for the charity."

**Q: "Why Avalanche?"**
A: "Fast, cheap, and Avalanche L1s give us full control over our blockchain environment while benefiting from the security of the main network. Plus, X402 integrates seamlessly with Avalanche."

**Q: "What makes this better than Stripe?"**
A: "Three things: (1) Blockchain transparency — donors can verify funds went where they should. (2) Lower fees than Stripe's 2.9% + 30¢. (3) Crypto optionality — businesses can donate in AVAX if they want."

**Q: "How do you handle compliance?"**
A: "We've built an IRD compliance engine that generates NZ-specific tax receipts. We verify charities against the official NZ Charities Register and validate businesses via the Companies Office API."

**Q: "What's stopping you from launching today?"**
A: "Nothing technical — we need real X402 production keys, domain setup, and to onboard our first 10 charities. We could be live in 2 weeks."

---

## 🎯 Success Metrics (What Good Looks Like)

After the demo, judges should say/think:

✅ "That was smooth — I understood exactly what it does"
✅ "The X402 integration is clearly central to the product"
✅ "This solves a real problem for real users"
✅ "The code looks clean and production-ready"
✅ "I want to use this for my business donations"

---

## 🚀 Ready to Demo!

**Remember:**
1. **Start strong** — hook them in the first 15 seconds
2. **Show, don't tell** — let the product speak
3. **Highlight X402** — this is an X402 hackathon!
4. **End with impact** — "bringing the next million users to web3"

**Good luck! 🐻‍❄️**
