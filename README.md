# search-engine

A simple search engine with a crawler and indexer.

## Features

- Crawling
- Indexing
- Ranking system

## Crawling

In order to crawl a website, you must navigate to the public/js folder and run `node index.js https://example.com`

## Installation

> [!IMPORTANT]
> You should first crawl sites for some data so you can get the `crawldata.db` file. Then, run the site with the commands below.

> [!WARNING]
> Web services (Vercel, Netlify, Render, etc.) have not yet been tested.

To run this project locally, follow these steps:

1. Clone the repository: `git clone https://github.com/nineby-nine/search-engine.git`
2. Navigate to the project directory: `cd search-engine`
3. Install dependencies: `pnpm install`
4. Start the express server: `node server.js`
5. On another terminal, start the indexer (change directory to `public/js`): `node server.js`

## Credits

[@ClaytonTDM](https://github.com/ClaytonTDM) - Crawler and Indexer (modified by nineby-nine)

## Contributing

Contributions are welcome! If you have any ideas or improvements, feel free to submit a pull request.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more information.
