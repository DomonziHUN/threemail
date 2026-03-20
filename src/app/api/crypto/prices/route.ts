import { NextResponse } from "next/server";

const COINGECKO_API = "https://api.coingecko.com/api/v3";

const TOP_CRYPTOS = [
  { id: "bitcoin", symbol: "BTC", name: "Bitcoin" },
  { id: "ethereum", symbol: "ETH", name: "Ethereum" },
  { id: "binancecoin", symbol: "BNB", name: "BNB" },
  { id: "solana", symbol: "SOL", name: "Solana" },
  { id: "ripple", symbol: "XRP", name: "XRP" },
  { id: "cardano", symbol: "ADA", name: "Cardano" },
  { id: "dogecoin", symbol: "DOGE", name: "Dogecoin" },
  { id: "polkadot", symbol: "DOT", name: "Polkadot" },
  { id: "polygon", symbol: "MATIC", name: "Polygon" },
  { id: "litecoin", symbol: "LTC", name: "Litecoin" },
];

export async function GET() {
  try {
    const ids = TOP_CRYPTOS.map((c) => c.id).join(",");
    
    const response = await fetch(
      `${COINGECKO_API}/simple/price?ids=${ids}&vs_currencies=eur&include_24hr_change=true&include_market_cap=true`,
      { next: { revalidate: 60 } }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch crypto prices");
    }

    const data = await response.json();

    const prices = TOP_CRYPTOS.map((crypto) => {
      const priceData = data[crypto.id];
      return {
        id: crypto.id,
        symbol: crypto.symbol,
        name: crypto.name,
        price: priceData?.eur || 0,
        change24h: priceData?.eur_24h_change || 0,
        marketCap: priceData?.eur_market_cap || 0,
      };
    });

    return NextResponse.json(prices);
  } catch (error) {
    console.error("Crypto prices error:", error);
    return NextResponse.json(
      { error: "Failed to fetch crypto prices" },
      { status: 500 }
    );
  }
}
