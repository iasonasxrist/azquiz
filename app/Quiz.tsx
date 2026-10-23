"use client";
import React, { useState } from "react";

interface Question {
  description: string;
  choices: { [key: string]: string }[];
  correct_answer: string[];
}

export default function Quiz({
  questions,
  title = "AZ-204 Quiz",
}: {
  questions: Question[];
  title?: string;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<{ [key: number]: string[] }>(
    {}
  );
  const [showingAnswer, setShowingAnswer] = useState(false);
  const [inputIndex, setInputIndex] = useState("");

  if (questions.length === 0) {
    return (
      <div className="px-4 py-6 max-w-xl mx-auto text-base sm:text-lg">
        <h1 className="text-2xl font-bold text-center mb-6">{title}</h1>
        <p className="text-center text-gray-700">No questions available yet.</p>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const isMultiple = currentQuestion.correct_answer.length > 1;
  const hasChoices = currentQuestion.choices.length > 0;

  function toggleAnswer(letter: string) {
    setUserAnswers((prev) => {
      const current = prev[currentIndex] || [];
      const updated = isMultiple
        ? current.includes(letter)
          ? current.filter((l) => l !== letter)
          : [...current, letter]
        : [letter];
      return { ...prev, [currentIndex]: updated };
    });
  }

  function isCorrect(): boolean {
    const answer = userAnswers[currentIndex] || [];
    const correct = currentQuestion.correct_answer
      .map((l) => l.toUpperCase())
      .sort();
    const user = answer.map((l) => l.toUpperCase()).sort();
    return JSON.stringify(user) === JSON.stringify(correct);
  }

  function jumpToQuestion() {
    const num = parseInt(inputIndex);
    if (!isNaN(num) && num >= 1 && num <= questions.length) {
      setCurrentIndex(num - 1);
      setShowingAnswer(false);
    }
  }

  return (
    <div className="px-4 py-6 max-w-xl mx-auto text-base sm:text-lg">
      <h1 className="text-2xl font-bold text-center mb-6">{title}</h1>
      <div className="mb-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 mb-3">
          <div className="text-gray-700">
            Question {currentIndex + 1} of {questions.length}
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="goto" className="text-sm">
              Go to:
            </label>
            <input
              id="goto"
              type="text"
              value={inputIndex}
              onChange={(e) => setInputIndex(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && jumpToQuestion()}
              className="p-1 border border-gray-300 rounded w-16 text-center"
              placeholder="#"
            />
            <button
              onClick={jumpToQuestion}
              className="px-2 py-1 bg-gray-200 text-sm rounded hover:bg-gray-300"
            >
              Go
            </button>
          </div>
        </div>
        <div
          className="bg-white p-4 rounded shadow-sm border prose prose-sm sm:prose lg:prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: currentQuestion.description }}
        />
      </div>

      <div className="space-y-3 mb-5">
        {currentQuestion.choices.map((choice) => {
          const letter = Object.keys(choice)[0];
          const text = choice[letter];
          const selected = userAnswers[currentIndex]?.includes(letter) ?? false;
          return (
            <label key={letter} className="block">
              <div
                className={`flex items-start gap-2 p-2 border rounded cursor-pointer ${
                  selected ? "bg-blue-50 border-blue-500" : "hover:bg-gray-50"
                }`}
              >
                <input
                  type={isMultiple ? "checkbox" : "radio"}
                  name={`q-${currentIndex}`}
                  value={letter}
                  checked={selected}
                  onChange={() => toggleAnswer(letter)}
                  className="mt-1"
                />
                <span
                  className="overflow-x-auto"
                  dangerouslySetInnerHTML={{
                    __html: `<strong>${letter}.</strong> ${text}`,
                  }}
                />
              </div>
            </label>
          );
        })}
      </div>

      {showingAnswer && (
        <div
          className={`mb-5 p-3 rounded ${
            !hasChoices
              ? "bg-blue-50 text-gray-800"
              : isCorrect()
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {hasChoices && isCorrect() ? (
            "Correct!"
          ) : (
            <>
              <div>{hasChoices ? "Incorrect. Correct answer:" : "Correct answer:"}</div>
              <div
                className="mt-2 prose max-w-none"
                dangerouslySetInnerHTML={{
                  __html: currentQuestion.correct_answer.join("<br/>"),
                }}
              />
            </>
          )}
        </div>
      )}

      <div className="flex flex-wrap gap-3 justify-center sm:justify-start">
        <button
          onClick={() => setShowingAnswer(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Show Answer
        </button>
        <button
          onClick={() => {
            setCurrentIndex((i) => Math.max(0, i - 1));
            setShowingAnswer(false);
          }}
          disabled={currentIndex === 0}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:opacity-50"
        >
          Previous
        </button>
        {currentIndex < questions.length - 1 ? (
          <button
            onClick={() => {
              setCurrentIndex((i) => i + 1);
              setShowingAnswer(false);
            }}
            className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-900"
          >
            Next
          </button>
        ) : (
          <span className="text-green-700 font-semibold">End of Quiz</span>
        )}
      </div>

      <style jsx global>{`
        .prose img {
          max-width: 100%;
          height: auto;
          display: block;
          margin: 0.5rem 0;
        }
      `}</style>
    </div>
  );
}
