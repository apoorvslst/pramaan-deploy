async function testCrac() {
  try {
    // 1. Login as Officer
    const offLogin = await fetch("http://127.0.0.1:5000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "officer@praman.test", password: "password123" })
    });
    const offData = await offLogin.json();
    console.log("Officer Login:", offData.success);

    // 2. Fetch pending contracts for CRAC
    const pendingRes = await fetch("http://127.0.0.1:5000/api/crac/pending-contracts", {
      headers: { Authorization: `Bearer ${offData.token}` }
    });
    const pendingData = await pendingRes.json();
    console.log("Pending contracts for CRAC:", pendingData.count, pendingData.contracts?.map(c => ({ bidRef: c.bidReferenceNumber, vendor: c.bidder?.legalBusinessName, hasCrac: c.hasCrac })));

    // 3. Fetch all CRACs
    const allCracRes = await fetch("http://127.0.0.1:5000/api/crac/all", {
      headers: { Authorization: `Bearer ${offData.token}` }
    });
    const allCracData = await allCracRes.json();
    console.log("All CRAC count:", allCracData.count, allCracData.cracs?.map(c => ({ num: c.cracNumber, rating: c.rating, status: c.status })));

    // 4. Test Bidder 3 (Apex Infra) fetching my-cracs
    const b3Login = await fetch("http://127.0.0.1:5000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "bidder3@praman.test", password: "password123" })
    });
    const b3Data = await b3Login.json();
    const myCracsRes = await fetch("http://127.0.0.1:5000/api/crac/my-cracs", {
      headers: { Authorization: `Bearer ${b3Data.token}` }
    });
    const myCracsData = await myCracsRes.json();
    console.log("Bidder 3 my-cracs count:", myCracsData.count, myCracsData.cracs?.map(c => ({ num: c.cracNumber, rating: c.rating, title: c.reviewTitle })));
  } catch (err) {
    console.error("Test CRAC failed:", err);
  }
}
testCrac();
