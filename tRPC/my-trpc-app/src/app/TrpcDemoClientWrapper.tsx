"use client";
import dynamic from "next/dynamic";

const TrpcDemo = dynamic(() => import("./trpc-demo"), { ssr: false });

export default function TrpcDemoClientWrapper() {
  return <TrpcDemo />;
} 