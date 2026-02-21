async function seed() {
    try {
        const res = await fetch("http://localhost:3000/api/seed", {
            method: "POST"
        });
        const data = await res.json();
        console.log("Seed API Response:", data);
    } catch (err) {
        console.error("Fetch failed:", err);
    }
}
seed();
