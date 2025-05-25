import Quiz from "@/app/Quiz";
import questions from "../data/az204.json";

export default function Home() {
  return (
    <>
      <Quiz questions={questions} />
    </>
  );
}
