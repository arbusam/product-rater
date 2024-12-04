# Product Rater

https://product-rater.vercel.app/

This is a website that gathers reviews from trusted sources online to present to you, as well as analysing how they feel about the product and what its overall pros and cons are.

## Installation

If you wish to run this on your own computer, follow these steps:
1. Clone this repo
2. Run `npm install`
3. Duplicate the .env.example and name it .env
4. Create a Google Programmable Search Engine for the sources you want this to use: https://programmablesearchengine.google.com/
5. Copy the Programmable Search Engine API key and CX and paste it into the .env file
6. Get a Google Gemini API key: https://ai.google.dev/
7. Copy the Gemini API key and paste it into the .env file
8. Create an Upstash account: https://upstash.com/
9. Create a new Redis database
10. Copy the Redis URL and token and paste it into the .env file.
11. Run `npm run dev`