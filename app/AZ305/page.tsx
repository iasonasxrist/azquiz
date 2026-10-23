import type { Metadata } from "next";
import Quiz from "@/app/Quiz";
import questions from "@/data/az305.json";

export const metadata: Metadata = {
  title: "AZ-305 Quiz",
};

export default function AZ305Page() {
  return <Quiz questions={questions} title="AZ-305 Quiz" />;
}
