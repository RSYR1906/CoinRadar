import { useEffect, useRef, useState, useCallback } from "react";
import type { CryptoData, PriceUpdate } from "../types";

export function usePriceUpdates() {
  const [prices, setPrices] = useState<Map<string, CryptoData>>(new Map());
  const wsRef = useRef<WebSocket | null>(null);
  const retryRef = useRef(0);

  const connect = useCallback(() => {
    const protocol = window.location.protocol === "https:" ? "wss" : "ws";
    const ws = new WebSocket(`${protocol}://${window.location.host}/ws/prices`);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      const msg: PriceUpdate = JSON.parse(event.data);
      if (msg.type === "price_update") {
        setPrices((prev) => {
          const next = new Map(prev);
          for (const coin of msg.data) {
            next.set(coin.id, coin);
          }
          return next;
        });
      }
    };

    ws.onopen = () => {
      retryRef.current = 0;
    };

    ws.onclose = () => {
      const delay = Math.min(1000 * 2 ** retryRef.current, 30000);
      retryRef.current++;
      setTimeout(connect, delay);
    };
  }, []);

  useEffect(() => {
    connect();
    return () => {
      wsRef.current?.close();
    };
  }, [connect]);

  return prices;
}
