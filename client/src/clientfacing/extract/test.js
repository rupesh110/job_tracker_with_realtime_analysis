export async function testFunction() {
  // simulate async work (scraping or API call)
  return new Promise(resolve => {
    setTimeout(() => {
      resolve("📦 Data fetched to test");
    }, 2000);
  });
}
