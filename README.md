This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

The existing AZ-204 quiz is available at `/`. The AZ-305 quiz is available at
`/AZ305` and uses the same quiz component and JSON question format:

```json
{
  "description": "Question text, optionally containing HTML",
  "choices": [{ "A": "First choice" }, { "B": "Second choice" }],
  "correct_answer": ["A"]
}
```

AZ-305 includes all 366 questions from `az-305-complete-qna.pdf`, in PDF bookmark
order, including full case-study context and locally stored diagrams. Its question
bank is `data/az305.json`, and its images are in `public/az305/`. Answers are
preserved as displayed in the PDF. Diagram questions reveal the solution image
with **Show Answer**, matching the existing quiz's image-based question format.

To regenerate the AZ-305 data and images, install Python's `pdfplumber` and
`pypdf` packages, then run:

```bash
python3 scripts/import_az305.py /path/to/az-305-complete-qna.pdf
```

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
