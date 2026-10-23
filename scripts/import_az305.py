import argparse
import hashlib
import html
import json
import re
from pathlib import Path

import pdfplumber
from pypdf import PdfReader


def import_questions(source, root):
    reader = PdfReader(source)
    bookmarks = reader.outline
    if [item.title for item in bookmarks] != [
        f"Question {number}" for number in range(1, 367)
    ]:
        raise ValueError("Expected the complete archive's 366 question bookmarks")

    starts = [reader.get_destination_page_number(item) for item in bookmarks]
    starts.append(len(reader.pages))
    assets = root / "public" / "az305"
    assets.mkdir(parents=True, exist_ok=True)
    questions = []
    image_names = set()
    image_count = 0

    with pdfplumber.open(source) as document:
        for number, (start, end) in enumerate(zip(starts, starts[1:]), 1):
            description = []
            choices = []
            answers = []
            answer_letters = ""
            state = "heading"
            found_solution = False

            for page_index in range(start, end):
                page = document.pages[page_index]
                lines = page.extract_text_lines()
                events = [
                    (line["top"], "text", line)
                    for line in lines
                    if line["top"] < page.height - 40
                ]
                events.extend((image["top"], "image", image) for image in page.images)
                page_images = {
                    image.name.rsplit(".", 1)[0]: image
                    for image in reader.pages[page_index].images
                }

                for position, kind, event in sorted(events, key=lambda item: item[0]):
                    if kind == "image":
                        image = page_images[event["name"]]
                        digest = hashlib.sha256(image.data).hexdigest()[:20]
                        extension = image.name.rsplit(".", 1)[1].lower()
                        filename = f"{digest}.{extension}"
                        if filename not in image_names:
                            (assets / filename).write_bytes(image.data)
                            image_names.add(filename)
                        image_count += 1
                        label = "solution" if state == "solution" else "exhibit"
                        markup = (
                            f'<img src="/az305/{filename}" '
                            f'alt="Question {number} {label}" loading="lazy">'
                        )
                        if state == "description":
                            description.append(markup)
                        elif state == "solution":
                            answers.append(markup)
                        elif state == "choices" and choices:
                            letter = next(iter(choices[-1]))
                            choices[-1][letter] += "<br>" + markup
                        else:
                            raise ValueError(f"Question {number}: image outside question")
                        continue

                    text = event["text"].strip()
                    if text == "Question and full context":
                        state = "description"
                    elif text == "Answer choices":
                        state = "choices"
                    elif text == "Revealed solution":
                        state = "solution"
                        found_solution = True
                    elif text.startswith("Source:"):
                        state = "source"
                    elif state == "description":
                        escaped = html.escape(text)
                        if all("Bold" in char["fontname"] for char in event["chars"]):
                            escaped = f"<strong>{escaped}</strong>"
                        description.append(escaped)
                    elif state == "choices":
                        text = re.sub(r"\s*Most Voted\b", "", text)
                        match = re.match(r"^[•\u2022]?\s*([A-Z])\.\s*(.*)$", text)
                        if match:
                            choices.append({match[1]: html.escape(match[2])})
                        elif choices:
                            letter = next(iter(choices[-1]))
                            choices[-1][letter] += " " + html.escape(text)
                        else:
                            raise ValueError(f"Question {number}: unrecognized choice {text!r}")
                    elif state == "solution" and text.startswith("Correct Answer:"):
                        answer_letters = text.removeprefix("Correct Answer:").strip()
                        if not re.fullmatch(r"[A-Z]*", answer_letters):
                            raise ValueError(f"Question {number}: unexpected answer {text!r}")

                page.close()

            for choice in choices:
                letter = next(iter(choice))
                choice[letter] = re.sub(r"\s*Most\s+Voted\b", "", choice[letter]).strip()

            if answer_letters:
                if answers:
                    raise ValueError(f"Question {number}: mixed answer formats")
                answers = list(answer_letters)
                available = {next(iter(choice)) for choice in choices}
                if not set(answers) <= available or len(available) != len(choices):
                    raise ValueError(f"Question {number}: invalid answer choices")
            if not description or not answers or not found_solution:
                raise ValueError(f"Question {number}: missing description or solution")
            if choices and not answer_letters:
                raise ValueError(f"Question {number}: choices without a letter answer")

            questions.append({
                "description": "<br>".join(description),
                "choices": choices,
                "correct_answer": answers,
            })
            if number % 50 == 0:
                print(f"Imported {number} questions", flush=True)

    destination = root / "data" / "az305.json"
    destination.write_text(json.dumps(questions, ensure_ascii=False, indent=2) + "\n")
    print(
        f"Imported {len(questions)} questions, {image_count} image placements, "
        f"and {len(image_names)} unique images"
    )


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Import the AZ-305 complete Q&A PDF")
    parser.add_argument("source", type=Path)
    arguments = parser.parse_args()
    import_questions(arguments.source, Path(__file__).resolve().parents[1])
