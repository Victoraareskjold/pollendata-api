import puppeteer from "puppeteer";

export async function GET() {
  try {
    const browser = await puppeteer.connect({
      browserWSEndpoint: `wss://chrome.browserless.io?token=${process.env.BLESS_TOKEN}`,
    });
    const page = await browser.newPage();

    await page.goto("https://pollenvarsel.naaf.no/charts/forecast", {
      waitUntil: "networkidle2",
    });

    const pollenData = await page.evaluate(() => {
      const nextData = window.__NEXT_DATA__;
      if (nextData && nextData.props && nextData.props.pageProps.data) {
        return nextData.props.pageProps.data.forecastData;
      }
      return null;
    });

    await browser.close();

    if (!pollenData) {
      return new Response(
        JSON.stringify({ success: false, error: "No pollendata found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify({ success: true, data: pollenData }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching pollendata:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: "Could not fetch pollendata",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
