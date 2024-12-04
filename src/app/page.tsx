"use client";

import { useEffect, useState, useCallback } from "react";
import { SearchResult } from "@/types/searchResult";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [prosAndConsLoading, setProsAndConsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [articleTexts, setArticleTexts] = useState<string[]>([]);
  const [pros, setPros] = useState<string[]>([]);
  const [cons, setCons] = useState<string[]>([]);
  const [searched, setSearched] = useState(false);
  const [exampleClicked, setExampleClicked] = useState(false);

  useEffect(() => {
    document.getElementById("search")?.focus();
  }, []);

  const performSearch = useCallback(() => {
    if (searchQuery === "") {
      return;
    }
    setSearched(true);
    setLoading(true);
    setProsAndConsLoading(true);
    setSearchResults([]);
    setArticleTexts([]);
    setPros([]);
    setCons([]);

    fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`)
      .then((res) => res.json())
      .then((results) => {
        setLoading(false);
        if (results.length === 0) {
          setProsAndConsLoading(false);
          return;
        }
        setSearchResults(results);

        results.forEach((result: SearchResult) => {
          fetch('/api/article', {
            method: 'POST',
            body: JSON.stringify(result),
          })
            .then((res) => res.json())
            .then(({ text }) => {
              articleTexts.push(text);

              fetch('/api/sentiment', {
                method: 'POST',
                body: JSON.stringify({ articleText: text, searchQuery }),
              })
                .then((res) => res.json())
                .then(({ sentiment }) => {
                  result.sentiment = sentiment;
                  setSearchResults([...results]);
                })
                .catch(console.error);

              if (articleTexts.length === results.length) {
                fetch('/api/proscons', {
                  method: 'POST',
                  body: JSON.stringify({ articles: articleTexts, searchQuery }),
                })
                  .then((res) => res.json())
                  .then((prosAndCons) => {
                    setPros(prosAndCons.pros);
                    setCons(prosAndCons.cons);
                    setProsAndConsLoading(false);
                  })
                  .catch(console.error);
              }
            })
            .catch(console.error);
        });
      })
      .catch((error) => {
        console.error("Error:", error);
        setLoading(false);
      });
  }, [searchQuery, articleTexts]);

  useEffect(() => {
    if (exampleClicked && searchQuery !== "") {
      performSearch();
      setExampleClicked(false);
    }
  }, [searchQuery, exampleClicked, performSearch]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch();
  };

  const handleExample = (example: string) => {
    const searchInput = document.getElementById(
      "search",
    ) as HTMLInputElement | null;
    if (searchInput) {
      searchInput.value = example;
      setSearchQuery(example);
      setExampleClicked(true);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="flex min-h-screen flex-col">
        <main className="flex-1 px-4 py-8">
          <div className="mx-auto max-w-2xl">
            <div className="rounded-lg bg-white p-8 shadow-lg dark:bg-black">
              <h1 className="text-3xl font-bold text-center mb-4">
                Tech Product Rater
              </h1>
              <h2 className="text-lg text-center mb-4">
                Analyses tech products by summarising online reviews. If this is
                your first time using this, you can start with one of these
                examples. For best results, be as specific as possible.
              </h2>
              <div className="flex flex-col sm:flex-row justify-center gap-2 mt-4">
                <button
                  onClick={() => handleExample("iPhone 16")}
                  className="w-full sm:w-auto px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  iPhone 16
                </button>
                <button
                  onClick={() => handleExample("Samsung Galaxy S24 Ultra")}
                  className="w-full sm:w-auto px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Samsung Galaxy S24 Ultra
                </button>
                <button
                  onClick={() => handleExample('MacBook Pro 2024 (14", M4)')}
                  className="w-full sm:w-auto px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  MacBook Pro 2024
                </button>
              </div>
              <div className="mt-6" />
              <form onSubmit={handleSearch} className="w-full">
                <div className="flex gap-2">
                  {/* TODO: Limit character length */}
                  <input
                    id="search"
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Enter a tech product"
                    className="flex-1 px-4 py-2 rounded-lg border bg-gray-50 border-gray-300 text-gray-900 text-sm focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  />
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    disabled={loading}
                  >
                    {loading ? (
                      <div role="status">
                        <svg
                          aria-hidden="true"
                          role="status"
                          className="inline w-4 h-4 me-3 text-white animate-spin"
                          viewBox="0 0 100 101"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                            fill="#E5E7EB"
                          />
                          <path
                            d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                            fill="currentColor"
                          />
                        </svg>
                        Analysing...
                      </div>
                    ) : (
                      "Analyse"
                    )}
                  </button>
                </div>
              </form>
              {searched && (
                <div>
                  {/* TODO: Add Skeleton Loader */}
                  <h2 className="text-base font-semibold mt-8">
                    Reviews from:{" "}
                    {searchResults.length > 0 ? (
                      <ul className="list-disc list-inside">
                        {searchResults.map((result) => (
                          <li key={result.link}>
                            <a
                              href={result.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-500 hover:underline"
                            >
                              {result.publication}
                            </a>
                            : {result.title}{" "}
                            {result.sentiment != null ? (
                              <p
                                className={
                                  result.sentiment === "POSITIVE"
                                    ? "text-green-500"
                                    : result.sentiment === "NEGATIVE"
                                      ? "text-red-500"
                                      : result.sentiment === "NEUTRAL"
                                        ? "text-gray-500"
                                        : result.sentiment === "MIXED"
                                          ? "text-yellow-500"
                                          : "text-gray-500"
                                }
                              >
                                ({result.sentiment})
                              </p>
                            ) : (
                              <div
                                role="status"
                                className="max-w-sm animate-pulse"
                              >
                                <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[75px] mb-2.5"></div>
                              </div>
                            )}
                          </li>
                        ))}
                      </ul>
                    ) : loading ? (
                      <div role="status" className="max-w-sm animate-pulse">
                        <div className="h-2.5 bg-gray-200 rounded-full dark:bg-gray-700 w-24 mb-4"></div>
                        <span className="sr-only">Loading...</span>
                      </div>
                    ) : (
                      <span>No reviews found</span>
                    )}
                  </h2>
                  <div className="mt-6" />
                  {searchResults.length > 0 && (
                    <div>
                      <h2 className="text-xl font-bold mt-8">Pros and Cons:</h2>
                      <table className="table-fixed w-full mt-2 text-left">
                        <thead>
                          <tr>
                            <th className="text-left text-lg">Pros</th>
                            <th className="text-left text-lg pl-4">Cons</th>
                          </tr>
                        </thead>
                        <tbody>
                          {pros.length === 0 &&
                          cons.length === 0 &&
                          prosAndConsLoading ? (
                            <tr>
                              <td className="align-top">
                                <ul className="list-disc list-inside">
                                  <div
                                    role="status"
                                    className="max-w-sm animate-pulse"
                                  >
                                    <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[250px] mb-2.5"></div>
                                    <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[250px] mb-2.5"></div>
                                    <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[250px] mb-2.5"></div>
                                  </div>
                                </ul>
                              </td>
                              <td className="align-top">
                                <ul className="list-disc list-inside">
                                  <div
                                    role="status"
                                    className="max-w-sm animate-pulse"
                                  >
                                    <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[250px] mb-2.5"></div>
                                    <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[250px] mb-2.5"></div>
                                    <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[250px] mb-2.5"></div>
                                  </div>
                                </ul>
                              </td>
                            </tr>
                          ) : (
                            <tr>
                              <td className="pr-4 align-top">
                                <ul className="list-disc list-inside">
                                  {pros.map((pro, index) => (
                                    <li key={index}>{pro}</li>
                                  ))}
                                </ul>
                              </td>
                              <td className="pl-4 align-top">
                                <ul className="list-disc list-inside">
                                  {cons.map((con, index) => (
                                    <li key={index}>{con}</li>
                                  ))}
                                </ul>
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </main>

        <footer className="mt-8 w-full bg-gray-100 px-4 py-5 dark:bg-gray-700">
          <div className="flex flex-col items-center justify-between space-y-4 md:flex-row md:space-y-0">
            <span className="text-sm text-gray-500 dark:text-gray-300">
              © 2024 <a href="https://flowbite.com/">Arhan Busam</a>. All
              Rights Reserved.
            </span>
            <div className="flex space-x-5 rtl:space-x-reverse">
              <a
                href="https://github.com/arbusam/product-rater/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                <svg
                  className="h-4 w-4"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 .333A9.911 9.911 0 0 0 6.866 19.65c.5.092.678-.215.678-.477 0-.237-.01-1.017-.014-1.845-2.757.6-3.338-1.169-3.338-1.169a2.627 2.627 0 0 0-1.1-1.451c-.9-.615.07-.6.07-.6a2.084 2.084 0 0 1 1.518 1.021 2.11 2.11 0 0 0 2.884.823c.044-.503.268-.973.63-1.325-2.2-.25-4.516-1.1-4.516-4.9A3.832 3.832 0 0 1 4.7 7.068a3.56 3.56 0 0 1 .095-2.623s.832-.266 2.726 1.016a9.409 9.409 0 0 1 4.962 0c1.89-1.282 2.717-1.016 2.717-1.016.366.83.402 1.768.1 2.623a3.827 3.827 0 0 1 1.02 2.659c0 3.807-2.319 4.644-4.525 4.889a2.366 2.366 0 0 1 .673 1.834c0 1.326-.012 2.394-.012 2.72 0 .263.18.572.681.475A9.911 9.911 0 0 0 10 .333Z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="sr-only">GitHub account</span>
              </a>
              <a
                href="https://arhanbusam.bsky.social/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                <svg
                  className="h-4 w-4"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 568 501"
                >
                  <path
                    fill="currentColor"
                    d="M123.121 33.664C188.241 82.553 258.281 181.68 284 234.873c25.719-53.192 95.759-152.32 160.879-201.21C491.866-1.611 568-28.906 568 57.947c0 17.346-9.945 145.713-15.778 166.555-20.275 72.453-94.155 90.933-159.875 79.748C507.222 323.8 536.444 388.56 473.333 453.32c-119.86 122.992-172.272-30.859-185.702-70.281-2.462-7.227-3.614-10.608-3.631-7.733-.017-2.875-1.169.506-3.631 7.733-13.43 39.422-65.842 193.273-185.702 70.281-63.111-64.76-33.89-129.52 80.986-149.071-65.72 11.185-139.6-7.295-159.875-79.748C9.945 203.659 0 75.291 0 57.946 0-28.906 76.135-1.612 123.121 33.664Z"
                  />
                </svg>
              </a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
