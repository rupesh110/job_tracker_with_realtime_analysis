export async function testFunction() {
  // simulate async work (scraping or API call)
  return new Promise(resolve => {
    setTimeout(() => {
      resolve("📦 Data fetched from testFunction! okay");
    }, 2000);
  });
}
